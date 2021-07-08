import { Cell } from "./cell.model";
import { Column, Line, oneToNine, Square } from "./sub-collections.model";

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

    constructor(grid: string, root: Grid | null = null) {
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
        if (this.root) {
            this.root.subGrids.push(this);
        }
        this.startTime = new Date().getTime();
        this.endTime = new Date().getTime();
        this.totalTime = new Date().getTime();
    }

    init(grid: string) {
        this.cells = grid
            .split("")
            .map(n => n === " " ? null : +n)
            .map((v, i) => new Cell(v, i));
        for (let i = 0; i < 9; i++) {
            this.lines.push(new Line(this.cells.slice(9 * i, 9 + 9 * i), i));
        }
        for (let i = 0; i < 9; i++) {
            this.columns.push(new Column([
                this.lines[0].cells[i],
                this.lines[1].cells[i],
                this.lines[2].cells[i],
                this.lines[3].cells[i],
                this.lines[4].cells[i],
                this.lines[5].cells[i],
                this.lines[6].cells[i],
                this.lines[7].cells[i],
                this.lines[8].cells[i],
            ], i));
        }
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.squares.push(new Square([
                    ...this.lines[3 * i].cells.slice(3 * j, 3 + 3 * j),
                    ...this.lines[1 + 3 * i].cells.slice(3 * j, 3 + 3 * j),
                    ...this.lines[2 + 3 * i].cells.slice(3 * j, 3 + 3 * j),
                ], i * 3 + j));
            }
        }
    }

    toString() {
        let grid = '';
        for (let i = 0; i < 9; i++) {
            if (i % 3 === 0) {
                grid += '-'.repeat(31) + '\n';
            }
            for (let j = 0; j < 9; j++) {
                if (j % 3 === 0) {
                    grid += '|';
                }
                grid += this.lines[i].cells[j].toString();
            }
            grid += '|\n';
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
            this.checkIsValid();
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
            }

            if (!this.solved) {
                if (this.valid && this.testSubGrids()) {
                    this.solved = true;
                }
                if (!this.root) {
                    if (this.subGrids.length) {
                        const analysedSubGrids = this.subGrids;
                        const validSubGrids = this.subGrids.filter(({ solved }) => solved);
                        if (validSubGrids.length) {
                            console.log(validSubGrids[validSubGrids.length - 1].toString());
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
        this.checkIsValid();
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
            cells = this.squares[i].solveValuesBySimpleCross(this);
            if (cells.length === 0) {
                cells = this.lines[i].solveValuesBySimpleCross(this);
            }
            if (cells.length === 0) {
                cells = this.columns[i].solveValuesBySimpleCross(this);
            }
            i++;
        }
        return cells;
    }

    solveByElimination(): Cell[] {
        let cells: Cell[] = [];
        let i = 0;
        while (!cells.length && i < 9) {
            cells = this.squares[i].solveByElimination(this);
            if (cells.length === 0) {
                this.lines[i].solveByElimination(this);
            }
            if (cells.length === 0) {
                this.columns[i].solveByElimination(this);
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
                const cellsOfValue = freeCells.filter(cell =>
                    cell.potentialValues.some(value => value === missingValue)
                );
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
            cells = this.squares[i].solveValuesByComplexCross(this);
            i++;
        }
        return cells;
    }

    checkSolved() {
        for (let square of this.squares) {
            square.checkSolved();
        }
        for (let line of this.lines) {
            line.checkSolved();
        }
        for (let column of this.columns) {
            column.checkSolved();
        }
        this.solved = !this.squares.some(({ solved }) => !solved);
    }

    checkIsValid() {
        for (let square of this.squares) {
            square.checkIsValid();
        }
        for (let line of this.lines) {
            line.checkIsValid();
        }
        for (let column of this.columns) {
            column.checkIsValid();
        }
    }

    checkIsKnown() {
        if (this.root) {
            const regExp = this.toRawRegExp();
            this.known = this.root.subGrids.some(grid => grid !== this && regExp.test(grid.toRawString()));
            if (this.known) {
                throw new Error('Grid vVariant is known');
            }
        }
    }

    testSubGrids(): boolean {
        const cellsToFill = this.cells.filter(({ value }) => !value);
        for (const cellToFill of cellsToFill) {
            cellToFill.potentialValues = [...oneToNine].filter(value =>
                !this.lines[cellToFill.line].hasValue(value) &&
                !this.columns[cellToFill.column].hasValue(value)
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
            const grid = new Grid(this.toRawString(option), this.root || this);
            grid.solve();
            if (grid.solved && process.env.stopOnFirstSuccessfulSubGrid === '1') {
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
}

