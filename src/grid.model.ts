import { Cell } from "./cell.model";
import { Column, Line, Square } from "./sub-collections.model";
import { get } from "config";

const stopOnFirstSuccessfulSubGrid = get<boolean>('stopOnFirstSuccessfulSubGrid');

export class Grid {
    parent: Grid | null;
    subGrids: Grid[];
    cells: Cell[];
    squares: Square[];
    columns: Column[];
    lines: Line[];
    solved: boolean;
    valid: boolean;
    known: boolean;
    startTime: number;
    endTime: number;
    totalTime: number;
    level: number;
    index: number;
    path: string;
    endRawText: string;

    constructor(grid: string, index: number, parent: Grid | null = null) {
        this.subGrids = [];
        this.cells = [];
        this.squares = [];
        this.columns = [];
        this.lines = [];
        this.solved = false;
        this.valid = true;
        this.known = false;
        this.init(grid);
        this.parent = parent;
        this.level = 0;
        this.index = index;
        if (parent) {
            this.path = `${parent.path}|${index}`;
            this.level = parent.level + 1;
        } else {
            this.path = `${index}`;
        }
        this.startTime = new Date().getTime();
        this.endTime = new Date().getTime();
        this.totalTime = new Date().getTime();
        this.endRawText = "";
    }

    init(grid: string) {
        for (let i = 0; i < 9; i++) {
            this.lines.push(new Line(i));
            this.columns.push(new Column(i));
            this.squares.push(new Square(i));
        }
        this.cells = grid
            .split("")
            .map(n => /^[1-9]$/.test(n) ? +n : null)
            .map((v, i) => new Cell(v, i, {
                line: this.lines[Math.floor(i / 9)],
                column: this.columns[Math.floor(i % 9)],
                square: this.squares.find(square => square.hasCell({
                    line: Math.floor(i / 9),
                    column: Math.floor(i % 9)
                })) as Square,
            }));
    }

    print() {
        console.log(this.toString());
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
            return currentCell.toRawString();
        }).join('');
    }

    toRawRegExpString() {
        return this.cells.map((currentCell) =>
            currentCell.toRawString('.')
        ).join('');
    }

    checkSolved() {
        this.solved =
            this.squares.every(({ solved }) => solved) &&
            this.lines.every(({ solved }) => solved) &&
            this.columns.every(({ solved }) => solved);
    }

    checkValid() {
        this.valid =
            this.squares.every(({ valid }) => valid) &&
            this.lines.every(({ valid }) => valid) &&
            this.columns.every(({ valid }) => valid);
    }

    getCellsToFill(): { line: number, column: number, value: number }[] {
        return this.cells
            .filter(({initiallySet}) => !initiallySet)
            .map(({line, column, value}) => ({line, column, value: value || 0}));
    }
}

