import { Cell } from "./cell.model";
import { Column, Line, oneToNine, Square } from "./sub-collections.model";
import { get } from "config";
import { verbose } from "../config/default";
import { levelToSpaces } from "./helpers";
const stopOnFirstSuccessfulSubGrid = get<boolean>('stopOnFirstSuccessfulSubGrid');

export class Grid {
    root: Grid | null;
    subGrids: Grid[];
    cells: Cell[];
    squares: Square[];
    columns: Column[];
    lines: Line[];
    solved: Boolean;
    valid: Boolean;
    known: Boolean;
    startTime: number;
    endTime: number;
    totalTime: number;
    stepCount: number;
    level: number;
    endRawText: string;

    constructor(grid: string, root: Grid | null = null, parent: Grid | null = null) {
        this.stepCount = 0;
        this.subGrids = [];
        this.cells = [];
        this.squares = [];
        this.columns = [];
        this.lines = [];
        this.solved = false;
        this.valid = true;
        this.known = false;
        this.init(grid);
        this.root = root;
        this.level = 0;
        if (this.root) {
            this.root.subGrids.push(this);
            if (parent) {
                this.level = parent.level + 1;
                this.stepCount = parent.stepCount;
            }
        }
        this.startTime = new Date().getTime();
        this.endTime = new Date().getTime();
        this.totalTime = new Date().getTime();
        this.endRawText = "";
    }

    init(grid: string) {
        for (let i = 0; i < 9; i++) {
            this.lines.push(new Line(this, i));
            this.columns.push(new Column(this, i));
            this.squares.push(new Square(this, i));
        }
        this.cells = grid
            .split("")
            .map(n => /^[1-9]$/.test(n) ? +n : null)
            .map((v, i) => new Cell(v, i, {
                line: this.lines[Math.floor(i / 9)],
                column: this.columns[Math.floor(i % 9)],
                square: this.squares.find(square =>square.hasCell({
                    line: Math.floor(i / 9),
                    column: Math.floor(i % 9)
                })) as Square,
            }));
    }

    toString() {
        let grid = '';
        for (let i = 0; i < 9; i++) {
            if (i % 3 === 0) {
                grid += '-'.repeat(31) + '\n';
            }
            grid += this.lines[i].toString();
        }
        grid += '-'.repeat(31) + '\n';
        return grid;
    }

    toRawString(params?: { cell: Cell, value: number }) {
        return this.cells.map((currentCell) => {
            if (
                params &&
                params.cell.line === currentCell.line &&
                params.cell.column === currentCell.column
            ) {
                return params.value;
            }
            return currentCell.value || ' ';
        }).join('');
    }

    toRawRegExp() {
        return new RegExp(this.cells.map((currentCell) => {
            return currentCell.value || '.';
        }).join(''));
    }

    solve() {
        if (!this.root) {
            console.log(this.toString());
        }
        try {
            while (this.solveStepByStep().length) {
            }
            this.checkSolved();
        } catch {
            this.solved = false;
            this.valid = false;
        } finally {
            this.endTime = new Date().getTime();
            this.totalTime = this.endTime - this.startTime;

            if (this.solved && !this.root) {
                console.log(this.toString());
                console.log(`Solved: ${this.solved}`);
                this.startTime = new Date().getTime();
                console.log(`Total time: ${this.totalTime} ms`);
                console.log(`Total steps: ${this.stepCount}`);
            }

            if (!this.solved) {
                this.endRawText = this.toRawString();
                if (this.valid && this.testSubGrids()) {
                    this.solved = true;
                }
                if (!this.root) {
                    if (this.subGrids.length) {
                        const analysedSubGrids = this.subGrids;
                        const validSubGrids = this.subGrids.filter(({ solved }) => solved);
                        if (validSubGrids.length) {
                            console.log(validSubGrids[validSubGrids.length - 1].toString());
                            console.log(`Total steps: ${validSubGrids[validSubGrids.length - 1].stepCount}`);
                        }
                        console.log(`Total time: ${this.subGrids[this.subGrids.length - 1].endTime - this.startTime} ms`);

                        console.log(`${analysedSubGrids.length} variation${analysedSubGrids.length === 1 ? '' : 's'} analysed`);
                        console.log(`${validSubGrids.length} variation${validSubGrids.length === 1 ? '' : 's'} solved`);
                    }
                    console.log(`Solved: ${this.solved}`);
                }
            }
        }
    }

    solveStepByStep(): Cell[] {
        this.checkIsKnown();
        this.checkSolved();
        let cells = this.solveIfOneMissing();
        if (cells.length > 0) {
            return cells;
        }
        cells = this.solveValuesBySimpleCross();
        if (cells.length > 0) {
            return cells;
        }
        if (cells.length > 0) {
            return cells;
        }
        cells = this.solveByElimination();
        if (cells.length > 0) {
            return cells;
        }
        cells = this.solveFromCloseBy();
        return cells;
    }

    solveIfOneMissing(): Cell[] {
        let cells: Cell[] = [];
        let i = 0;
        while (!cells.length && i < 9) {
            cells = this.squares[i].solveIfOneMissing();
            if (cells.length === 0) {
                cells = this.lines[i].solveIfOneMissing();
            }
            if (cells.length === 0) {
                cells = this.columns[i].solveIfOneMissing();
            }
            i++;
        }
        return cells;
    }

    solveValuesBySimpleCross(): Cell[] {
        let cells: Cell[] = [];
        let i = 0;
        while (!cells.length && i < 9) {
            cells = this.squares[i].solveValuesBySimpleCross();
            if (cells.length === 0) {
                cells = this.lines[i].solveValuesBySimpleCross();
            }
            if (cells.length === 0) {
                cells = this.columns[i].solveValuesBySimpleCross();
            }
            i++;
        }
        return cells;
    }

    solveByElimination(): Cell[] {
        let cells: Cell[] = [];
        let i = 0;
        while (!cells.length && i < 9) {
            cells = this.squares[i].solveByElimination();
            if (cells.length === 0) {
                this.lines[i].solveByElimination();
            }
            if (cells.length === 0) {
                this.columns[i].solveByElimination();
            }
            i++;
        }
        return cells;
    }

    solveFromCloseBy(): Cell[] {
        for (const line of this.lines) {
            line.resetLockedOnPositions();
        }
        for (const column of this.columns) {
            column.resetLockedOnPositions();
        }
        // get the state
        for (const square of this.squares) {
            const freeCells = square.freeCells;
            const missingValues = square.missingValues;
            for (let freeCell of freeCells) {
                freeCell.potentialValues = missingValues.filter(value =>
                    !this.lines[freeCell.line].hasValue(value) &&
                    !this.columns[freeCell.column].hasValue(value)
                );
            }
            for (const missingValue of missingValues) {
                const cellsOfValue = freeCells.filter(cell => {
                    return cell.potentialValues.some(value => {
                        this.incrementSteps();
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
                    this.lines[lines[0]].lockValueToCells(missingValue, cellsOfValue);
                }
                if (columns.length === 1) {
                    this.columns[columns[0]].lockValueToCells(missingValue, cellsOfValue);
                }
            }
        }

        let cells: Cell[] = [];
        let i = 0;
        while (!cells.length && i < 9) {
            cells = this.squares[i].solveValuesByComplexCross();
            i++;
        }
        return cells;
    }

    checkSolved() {
        this.solved = !this.squares.some(({ solved }) => !solved);
    }

    checkIsKnown() {
        if (this.root) {
            const regExp = this.toRawRegExp();
            this.known = this.root.subGrids.some(grid => grid !== this && regExp.test(grid.endRawText));
            if (this.known) {
                if (verbose) {
                    console.log(levelToSpaces(this) + 'Grid vVariant is known');
                }
                throw new Error('Grid vVariant is known');
            }
        }
    }

    testSubGrids(): boolean {
        const cellsToFill = this.cells.filter(({ value }) => !value);
        for (const cellToFill of cellsToFill) {
            cellToFill.potentialValues = [...oneToNine].filter(value =>
                !this.lines[cellToFill.line].hasValue(value) &&
                !this.columns[cellToFill.column].hasValue(value) &&
                !cellToFill.squareEntity?.hasValue(value)
            );
        }
        cellsToFill.sort((a, b) => a.potentialValues.length - b.potentialValues.length);
        const options: { cell: Cell, value: number }[] = [];
        for (let cell of cellsToFill) {
            for (const value of cell.potentialValues) {
                options.push({ cell, value });
            }
        }
        for (const option of options) {
            if (verbose) {
                console.log(levelToSpaces(this) + '=> Trying new variation');
            }
            const grid = new Grid(
                this.toRawString(option),
                this.root || this,
                this
            );
            grid.solve();
            if (grid.solved && stopOnFirstSuccessfulSubGrid) {
                return true;
            }
        }
        if (!this.root) {
            if (this.subGrids.some(({ solved }) => solved)) {
                return true;
            }
        }
        return false;
    }

    incrementSteps(count?: number) {
        this.stepCount += count || 1;
    }
}

