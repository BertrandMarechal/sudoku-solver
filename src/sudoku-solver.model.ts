import { Grid } from "./grid.model";
import { Cell } from "./cell.model";
import { SubCollectionSolver } from "./sub-collection-solver.model";
import { GridSubCollection, oneToNine } from "./sub-collections.model";
import { get } from "config";
import { levelToSpaces } from "./helpers";

const verbose = get<boolean>('verbose');
const debug = get<boolean>('debug');
const stopOnFirstSuccessfulSubGrid = get<boolean>('stopOnFirstSuccessfulSubGrid');

export type CellResolutionOrigin =
    | "solveValuesBySimpleCross"
    | "solveIfOneMissing"
    | "solveIfOneValueMissing"
    | "solveByElimination"
    | "solveValuesByComplexCross";

export class CellResolution {
    get origin(): CellResolutionOrigin {
        return this._origin;
    }

    get cell(): Cell {
        return this._cell;
    }

    get entity(): GridSubCollection | undefined {
        return this._entity;
    }

    private _cell: Cell;
    private _origin: CellResolutionOrigin;
    private _entity?: GridSubCollection;

    constructor(
        { cell, origin, entity }: { cell: Cell, origin: CellResolutionOrigin, entity?: GridSubCollection }
    ) {
        this._cell = cell;
        this._origin = origin;
        this._entity = entity;
    }

}

interface GridOption {
    grid?: Grid;
    option?: { value: number, cell: Cell };
}

export class SudokuSolver {
    private _grids: GridOption[];
    private _originalGrid: Grid;
    private _currentGrid: Grid;
    private _cellsToCheck: Cell[];
    private _solved: boolean;
    private _currentVariationIndex: number;
    private _totalGridCount: number;

    constructor(gridAsString: string) {
        const grid = new Grid(gridAsString, 0);
        if (verbose) {
            grid.print();
        }
        this._originalGrid = grid;
        this._currentGrid = grid;
        this._grids = [{ grid }];
        this._solved = false;

        this._cellsToCheck = [];
        this._currentVariationIndex = 0;
        this._totalGridCount = 1;
    }

    get solved(): boolean {
        return this._solved;
    }

    getSolution(): { line: number, column: number, value: number }[] {
        const firstSolution = this._grids.find(({ grid }) => grid?.solved);
        if (firstSolution) {
            return (firstSolution.grid as Grid).getCellsToFill(this._originalGrid) || [];
        }
        return [];
    }

    solve() {
        let carryOn = true;
        while (carryOn) {
            try {
                let cellResolution = this._solveStepByStep();
                while (cellResolution) {
                    this.logCellResolution(cellResolution);
                    this._cellsToCheck.push(cellResolution.cell);
                    this._solveCellsFromCell();
                    cellResolution = this._solveStepByStep();
                }
                this._currentGrid.checkSolved();
                this._solved = this._currentGrid.solved;
                if (!this._solved) {
                    if (debug) {
                        this._currentGrid.print();
                    }
                    carryOn = this._getNextGrid();
                } else {
                    if (stopOnFirstSuccessfulSubGrid) {
                        carryOn = false;
                    }
                }
            } catch (e) {
                if (debug) {
                    console.log(e);
                    this._currentGrid.print();
                }
                this._currentGrid.solved = false;
                this._currentGrid.valid = false;
                carryOn = this._getNextGrid(true);
            } finally {
                if (this._currentGrid?.solved && this._currentGrid === this._originalGrid) {
                    if (verbose) {
                        console.log(this._currentGrid.toString());
                        console.log(`Solved: ${this._currentGrid.solved}`);
                    }
                }
            }
        }
        if (this._grids.some(({ grid }) => grid?.solved)) {
            console.log(`Solved`);
        } else {
            console.log(`Not solved`);
        }
    }

    private logCellResolution({ cell, origin, entity }: CellResolution) {
        if (verbose) {
            console.log(levelToSpaces({ level: this._currentGrid.level }) + `Found ${cell.toString()} at ${cell.line + 1} - ${cell.column + 1} from ${origin} on ${entity?.entityType || 'value'}`);
        }
    }

    private _solveCellsFromCell() {
        while (!this._currentGrid.solved && this._cellsToCheck.length) {
            const cellResolution = SudokuSolver._solveOnCellEntities(this._cellsToCheck[this._cellsToCheck.length - 1]);
            if (cellResolution) {
                this.logCellResolution(cellResolution);
                this._cellsToCheck.push(cellResolution.cell);
            } else {
                this._cellsToCheck.pop();
            }
            this._currentGrid.checkSolved();
        }
    }

    private static _solveOnCellEntities(cell: Cell): CellResolution | null {
        return SubCollectionSolver.solveIfOneMissing(cell.squareEntity) ||
            SubCollectionSolver.solveIfOneMissing(cell.lineEntity) ||
            SubCollectionSolver.solveIfOneMissing(cell.columnEntity) ||
            SubCollectionSolver.solveValuesBySimpleCross(cell.squareEntity) ||
            SubCollectionSolver.solveValuesBySimpleCross(cell.lineEntity) ||
            SubCollectionSolver.solveValuesBySimpleCross(cell.columnEntity) ||
            null;
    }

    private _solveStepByStep(): CellResolution | null {
        this._currentGrid.checkSolved();
        return this._solveIfOneValueMissing() ||
            this._solveIfOneIsMissing() ||
            this._solveValuesBySimpleCross() ||
            this._solveByElimination() ||
            this._solveFromCloseBy() ||
            null;
    }

    private _solveIfOneValueMissing(): CellResolution | null {
        for (let v = 1; v < 10; v++) {
            const [lines, columns] = this._currentGrid.cells.reduce((
                [lines, columns]: [number[], number[]],
                { value, line, column }) => {
                if (value === v) {
                    return [
                        lines.filter(l => l !== line),
                        columns.filter(l => l !== column),
                    ];
                }
                return [lines, columns];
            }, [oneToNine.map(i => i - 1), oneToNine.map(i => i - 1)]);
            if (lines.length === 1 && columns.length === 1) {
                const [line, column] = [lines[0], columns[0]];
                this._currentGrid.cells[line * 9 + column].value = v;
                return new CellResolution({
                    cell: this._currentGrid.cells[line * 9 + column],
                    origin: "solveIfOneValueMissing",
                });
            }
        }
        return null;
    }

    private _solveIfOneIsMissing(): CellResolution | null {
        let cellResolution: CellResolution | null = null;
        let i = 0;
        while (!cellResolution && i < 9) {
            cellResolution = SubCollectionSolver.solveIfOneMissing(this._currentGrid.squares[i]) ||
                SubCollectionSolver.solveIfOneMissing(this._currentGrid.lines[i]) ||
                SubCollectionSolver.solveIfOneMissing(this._currentGrid.columns[i]) ||
                null;
            i++;
        }
        return cellResolution;
    }

    private _solveValuesBySimpleCross(): CellResolution | null {
        let cellResolution: CellResolution | null = null;
        let i = 0;
        while (!cellResolution && i < 9) {
            cellResolution = SubCollectionSolver.solveValuesBySimpleCross(this._currentGrid.squares[i]) ||
                SubCollectionSolver.solveValuesBySimpleCross(this._currentGrid.lines[i]) ||
                SubCollectionSolver.solveValuesBySimpleCross(this._currentGrid.columns[i]) ||
                null;
            i++;
        }
        return cellResolution;
    }

    private _solveByElimination(): CellResolution | null {
        let cellResolution: CellResolution | null = null;
        let i = 0;
        while (!cellResolution && i < 9) {
            cellResolution = SubCollectionSolver.solveByElimination(this._currentGrid.squares[i]) ||
                SubCollectionSolver.solveByElimination(this._currentGrid.lines[i]) ||
                SubCollectionSolver.solveByElimination(this._currentGrid.columns[i]) ||
                null;
            i++;
        }
        return cellResolution;
    }

    private _solveFromCloseBy(): CellResolution | null {
        if (debug) {
            console.log('_solveFromCloseBy');
        }
        for (const line of this._currentGrid.lines) {
            line.resetLockedOnPositions();
        }
        for (const column of this._currentGrid.columns) {
            column.resetLockedOnPositions();
        }
        // get the state
        for (const square of this._currentGrid.squares) {
            const freeCells = square.freeCells;
            const missingValues = square.missingValues;
            for (let freeCell of freeCells) {
                freeCell.potentialValues = missingValues.filter(value =>
                    !this._currentGrid.lines[freeCell.line].hasValue(value) &&
                    !this._currentGrid.columns[freeCell.column].hasValue(value)
                );
            }
            for (const missingValue of missingValues) {
                const cellsOfValue = freeCells.filter(cell => {
                    return cell.potentialValues.some(value => {
                        return value === missingValue;
                    });
                });
                const lines = cellsOfValue.reduce((agg: number[], { line }) => {
                    if (!agg.some(value => value === line)) {
                        agg.push(line);
                    }
                    return agg;
                }, []);
                const columns = cellsOfValue.reduce((agg: number[], { column }) => {
                    if (!agg.some(value => value === column)) {
                        agg.push(column);
                    }
                    return agg;
                }, []);
                if (lines.length === 1) {
                    this._currentGrid.lines[lines[0]].lockValueToCells(missingValue, cellsOfValue);
                }
                if (columns.length === 1) {
                    this._currentGrid.columns[columns[0]].lockValueToCells(missingValue, cellsOfValue);
                }
            }
        }

        let cellResolution: CellResolution | null = null;
        let i = 0;
        while (!cellResolution && i < 9) {
            cellResolution = SubCollectionSolver.solveValuesByComplexCross(this._currentGrid.squares[i])
                || SubCollectionSolver.solveValuesByComplexCross(this._currentGrid.lines[i])
                || SubCollectionSolver.solveValuesByComplexCross(this._currentGrid.columns[i])
                || null
            ;
            i++;
        }
        return cellResolution;
    }

    private _getNextGrid(lastOneWasInvalid: boolean = false): boolean {
        this._currentVariationIndex++;

        if (!lastOneWasInvalid) {
            const cellsRepresentation: Record<number, number> = {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
                6: 0,
                7: 0,
                8: 0,
                9: 0,
            };
            const cellsToFill: Cell[] = [];
            for (const cell of this._currentGrid.cells) {
                if (!cell.value) {
                    cellsToFill.push(cell);
                } else {
                    cellsRepresentation[cell.value]++;
                }
            }
            this._currentGrid.cells.filter(({ value }) => !value);
            for (const cellToFill of cellsToFill) {
                cellToFill.potentialValues = [...oneToNine].filter(value =>
                    !cellToFill.lineEntity.hasValue(value) &&
                    !cellToFill.columnEntity.hasValue(value) &&
                    !cellToFill.squareEntity.hasValue(value)
                );
            }
            let variationsCount = 0;
            const options: { cell: Cell, value: number }[] = [];
            for (let cell of cellsToFill) {
                for (const value of cell.potentialValues) {
                    variationsCount++;
                    options.push({ cell, value });
                }
            }
            options.sort((a, b) => {
                if (cellsRepresentation[a.value] === cellsRepresentation[b.value]) {
                    return a.cell.potentialValues.length - b.cell.potentialValues.length;
                }
                return cellsRepresentation[b.value] - cellsRepresentation[a.value];
            });
            for (const option of options) {
                this._grids.splice(this._currentVariationIndex, 0, {
                    grid: new Grid(this._currentGrid.toRawString(option), this._totalGridCount, this._currentGrid),
                    option: option
                });
                this._totalGridCount++;
            }
            if (variationsCount) {
                if (verbose) {
                    console.log(levelToSpaces(this._currentGrid) + `=> Adding ${variationsCount} variation${variationsCount === 1 ? '' : 's'}`);
                }
            }
        }
        if (verbose) {
            if (this._grids[this._currentVariationIndex]) {
                console.log(levelToSpaces(this._currentGrid) +
                    `=> Trying new variation ${
                        this._grids[this._currentVariationIndex].option?.value
                    } at ${
                        this._grids[this._currentVariationIndex].option?.cell.line
                    } - ${
                        this._grids[this._currentVariationIndex].option?.cell.column
                    }`
                    , (this._currentVariationIndex + 1) + '/' + this._grids.length,);
            } else {
                console.log('No more variations to try');
            }
        }
        this._currentGrid.clear();
        if (!this._currentGrid.solved) {
            this._grids[this._currentVariationIndex - 1].grid = undefined;
        }
        this._currentGrid = this._grids[this._currentVariationIndex]?.grid as Grid;

        return !!this._currentGrid;
    }
}

