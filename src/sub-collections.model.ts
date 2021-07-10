import { Cell } from "./cell.model";
import { Grid } from "./grid.model";
import { get } from 'config';
import { levelToSpaces } from "./helpers";
const verbose = get<boolean>('verbose');
const cellChecksEntities = get<boolean>('cellChecksEntities');
const useSubCollectionValueMaps = get<boolean>('useSubCollectionValueMaps');

export const oneToNine = [1, 2, 3, 4, 5, 6, 7, 8, 9];

type EntityType = "unset" | "square" | "line" | "column";

export class GridSubCollection {
    cells: Cell[];
    solved: boolean;
    grid: Grid;
    entityType: EntityType;
    index: number;
    lockedOnPositions: Record<number, Cell[]>;
    foundValues: Record<number, Cell | null>;
    private _missingValues: number[];
    private _freeCells: Cell[];

    constructor(grid: Grid, cells: Cell[], index: number, entityType: EntityType = "unset") {
        this.grid = grid;
        this.entityType = entityType;
        this.cells = cells;
        this.index = index;
        this.solved = false;
        this.lockedOnPositions = {};
        this._missingValues = [...oneToNine];
        this.foundValues = [...oneToNine].reduce((agg, curr) => ({
            ...agg, [curr]: null
        }), {});
        this._freeCells = [];
        for (const cell of cells) {
            cell.setEntity(this);
            if (cell.value) {
                this.cellSet(cell);
            } else {
                this._freeCells.push(cell);
            }
        }
    }

    cellSet(cell: Cell) {
        let valid = true;
        if (useSubCollectionValueMaps) {
            if (!!this.foundValues[cell.value as number] &&
                cell.column !== this.foundValues[cell.value as number]?.column &&
                cell.line !== this.foundValues[cell.value as number]?.line
            ) {
                valid = false;
            } else {
                this.foundValues[cell.value as number] = cell;
                this._missingValues = this._missingValues.filter((value) => value !== cell.value);
                this._freeCells = this._freeCells.filter(freeCell => freeCell !== cell);
            }
        } else {
            valid = this.checkIsValid();
        }
        if (!valid) {
            if (verbose) {
                console.log(levelToSpaces(this.grid) + 'Invalid solution');
            }
            throw new Error('Invalid solution');
        }
    }

    resetLockedOnPositions(): void {
        this.lockedOnPositions = {};
    }

    lockValueToCells(value: number, cells: Cell[]): void {
        this.lockedOnPositions[value] = cells;
    }

    hasValue(valueToCheck: number): boolean {
        if (useSubCollectionValueMaps) {
            this.grid.incrementSteps();
            return !!this.foundValues[valueToCheck];
        }
        return this.cells.some(({ value }) => {
            this.grid.incrementSteps();
            return valueToCheck === value;
        });
    }

    hasValueNotOnSquare(valueToCheck: number, square: Square): boolean {
        const hasValue = this.hasValue(valueToCheck);
        if (hasValue) {
            return true;
        }
        if (this.lockedOnPositions[valueToCheck]) {
            if (this.entityType === "line") {
                return this.lockedOnPositions[valueToCheck].some(cell => {
                    this.grid.incrementSteps();
                    return !square.columns.some(e => e === cell.column);
                });
            } else if (this.entityType === "column") {
                return this.lockedOnPositions[valueToCheck].some(cell => {

                    this.grid.incrementSteps();
                    return !square.lines.some(e => e === cell.line);
                });
            }
        }
        return false;
    }

    get freeCells(): Cell[] {
        if (useSubCollectionValueMaps) {
            return this._freeCells;
        }
        return this.cells.filter(({ value }) => {
            this.grid.incrementSteps();
            return !value;
        });
    }

    get missingValues(): number[] {
        if (useSubCollectionValueMaps) {
            return this._missingValues;
        }
        return [...oneToNine].filter(v => !this.cells.some(({ value }) => {
            this.grid.incrementSteps();
            return value === v;
        }));
    }

    checkSolved(): void {
        if (!this.solved) {
            this.solved = this.freeCells.length === 0;
        }
    }

    checkIsValid(): boolean {
        for (const cell of this.cells) {
            if (cell.value) {
                if (this.cells.filter(({ value }) => value === cell.value).length > 1) {
                    return false;
                }
            }
        }
        return true;
    }

    settingCell(
        cell: Cell,
        value: number,
        origin: "solveValuesBySimpleCross" | "solveIfOneMissing" | "solveByElimination" | "solveValuesByComplexCross"
    ): Cell[] {
        let cells: Cell[] = [cell];
        cell.value = value;
        if (verbose) {
            console.log(levelToSpaces(this.grid) + `Found value from ${origin} on ${this.entityType} for ${cell.line + 1} - ${cell.column + 1}: ${cell.value}`);
        }
        if (cellChecksEntities) {
            const otherCells = cell.checkEntities();
            cells = [cell, ...otherCells];
        }
        return cells;
    }

    solveValuesBySimpleCross(): Cell[] {
        if (this.solved) {
            return [];
        }
        const missingValues = this.missingValues;
        for (const v of missingValues) {
            const availableCells: Cell[] = [];
            const freeCells = this.freeCells;
            for (const cell of freeCells) {
                if (!this.grid.lines[cell.line].hasValue(v) &&
                    !this.grid.columns[cell.column].hasValue(v)) {
                    availableCells.push(cell);
                }
            }
            if (availableCells.length === 1) {
                const cell = availableCells[0];
                return this.settingCell(cell, v, "solveValuesBySimpleCross");
            }
        }
        return [];
    }

    solveIfOneMissing(): Cell[] {
        if (this.solved) {
            return [];
        }
        const missingValues = this.missingValues;
        if (missingValues.length === 1) {
            const cell = this.cells.find(({ value }) => {
                this.grid.incrementSteps();
                return !value;
            }) as Cell;
            return this.settingCell(cell, missingValues[0], "solveIfOneMissing");
        }
        return [];
    }

    solveByElimination(): Cell[] {
        if (this.solved) {
            return [];
        }
        const missingValues = this.missingValues;
        const freeCells = this.freeCells;
        for (const freeCell of freeCells) {
            freeCell.potentialValues = missingValues.filter(value =>
                !this.grid.lines[freeCell.line].hasValue(value) &&
                !this.grid.columns[freeCell.column].hasValue(value)
            );
            if (freeCell.potentialValues.length === 1) {
                return this.settingCell(freeCell, freeCell.potentialValues[0], "solveByElimination");
            }
        }
        return [];
    }
}

export class Square extends GridSubCollection {
    lines: number[];
    columns: number[];

    constructor(grid: Grid, cells: Cell[], index: number) {
        super(grid, cells, index, "square");
        this.lines = [cells[0].line, cells[3].line, cells[6].line];
        this.columns = [cells[0].column, cells[1].column, cells[2].column];
    }

    solveValuesByComplexCross(): Cell[] {
        if (this.solved) {
            return [];
        }
        const missingValues = this.missingValues;
        for (const v of missingValues) {
            const availableCells: Cell[] = [];
            const freeCells = this.freeCells;
            for (const cell of freeCells) {
                if (!this.grid.lines[cell.line].hasValueNotOnSquare(v, this) &&
                    !this.grid.columns[cell.column].hasValueNotOnSquare(v, this)) {
                    availableCells.push(cell);
                }
            }
            if (availableCells.length === 1) {
                const cell = availableCells[0];
                return this.settingCell(cell, v, "solveValuesByComplexCross");
            }
        }
        return [];
    }
}

export class Line extends GridSubCollection {
    constructor(grid: Grid, cells: Cell[], index: number) {
        super(grid, cells, index, "line");
    }
}

export class Column extends GridSubCollection {
    constructor(grid: Grid, cells: Cell[], index: number) {
        super(grid, cells, index, "column");
    }
}

