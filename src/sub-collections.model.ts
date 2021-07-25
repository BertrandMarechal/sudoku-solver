import { Cell } from "./cell.model";
import { get } from 'config';

const verbose = get<boolean>('verbose');

export const oneToNine = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export type EntityType = "unset" | "square" | "line" | "column" | "value";
export type HasValueExtendedParams = { line: number, column?: never } | { line?: never, column: number };

export class GridSubCollection {
    protected _cells: Cell[];
    solved: boolean;
    valid: boolean;
    entityType: EntityType;
    index: number;
    lockedOnPositions: Record<number, Cell[]>;
    foundValues: Record<number, Cell | null>;
    lines: number[];
    columns: number[];
    private _missingValues: number[];
    private _freeCells: Cell[];

    get cells(): Cell[] {
        return this._cells;
    }

    constructor(index: number, entityType: EntityType = "unset") {
        this.entityType = entityType;
        this.lines = [];
        this.columns = [];
        this._cells = [];
        this.index = index;
        this.solved = false;
        this.valid = true;
        this.lockedOnPositions = {};
        this._missingValues = [...oneToNine];
        this.foundValues = [...oneToNine].reduce((agg, curr) => ({
            ...agg, [curr]: null
        }), {});
        this._freeCells = [];
    }

    addCell(cell: Cell) {
        this._cells.push(cell);
        if (!cell.value) {
            this._freeCells.push(cell);
        }
        if (this._cells.length === 9) {
            this.processCells();
        }
    }

    protected processCells() {
        for (const cell of this._cells) {
            cell.setEntity(this);
            if (cell.value) {
                this.cellSet(cell);
            }
        }
    }

    cellSet(cell: Cell) {
        const value = cell.value;
        if (value) {
            const alreadyFound = this.foundValues[value];
            if (!!alreadyFound &&
                (
                    cell.column !== alreadyFound?.column ||
                    cell.line !== alreadyFound?.line
                )
            ) {
                this.valid = false;
            } else {
                this.foundValues[value] = cell;
                this._missingValues = this._missingValues.filter((v) => v !== value);
                this._freeCells = this._freeCells.filter(freeCell => freeCell !== cell);
                this.solved = this._freeCells.length === 0;
            }
            if (!this.valid) {
                if (verbose) {
                    console.log(`Invalid solution for ${this.entityType} ${this.index + 1}. Was setting ${cell.line + 1} - ${cell.column + 1} to ${cell.value}`);
                }
                throw new Error('Invalid solution');
            }
        }
    }

    resetLockedOnPositions(): void {
        this.lockedOnPositions = {};
    }

    lockValueToCells(value: number, cells: Cell[]): void {
        this.lockedOnPositions[value] = cells;
    }

    hasValue(valueToCheck: number): boolean {
        if (this.solved) {
            return true;
        }
        return !!this.foundValues[valueToCheck];
    }

    hasValueExtended(valueToCheck: number, subCollection: GridSubCollection): boolean {
        const hasValue = this.hasValue(valueToCheck);
        if (hasValue) {
            return true;
        }
        if (this.lockedOnPositions[valueToCheck]) {
            if (this.entityType === "line") {
                return this.lockedOnPositions[valueToCheck].some(cell => {
                    return !subCollection.columns.some(e => e === cell.column);
                });
            } else if (this.entityType === "column") {
                return this.lockedOnPositions[valueToCheck].some(cell => {
                    return !subCollection.lines.some(e => e === cell.line);
                });
            }
        }
        return false;
    }

    get freeCells(): Cell[] {
        return this._freeCells;
    }

    get missingValues(): number[] {
        return this._missingValues;
    }
}

export class Square extends GridSubCollection {
    constructor(index: number) {
        super(index, "square");
        const verticalBlock = Math.floor(index / 3);
        const horizontalBlock = index % 3;
        this.lines = [];
        this.columns = [];
        for (let i = 0; i < 3; i++) {
            this.lines.push(i + 3 * verticalBlock);
        }
        for (let i = 0; i < 3; i++) {
            this.columns.push(i + 3 * horizontalBlock);
        }
    }

    hasCell({ line, column }: { line: number; column: number }) {
        return this.lines.some(l => l === line) && this.columns.some(c => c === column);
    }
}

export class Line extends GridSubCollection {
    constructor(index: number) {
        super(index, "line");
        if (index < 3) {
            this.lines = [0, 1, 2];
        } else if (index < 6) {
            this.lines = [3, 4, 5];
        } else {
            this.lines = [6, 7, 8];
        }
    }

    toString(): string {
        let line: string = '';
        for (let i = 0; i < 9; i++) {
            if (i % 3 === 0) {
                line += '|';
            }
            line += this._cells[i].toString();
        }
        return line + '|\n';
    }
}

export class Column extends GridSubCollection {
    constructor(index: number) {
        super(index, "column");
        if (index < 3) {
            this.columns = [0, 1, 2];
        } else if (index < 6) {
            this.columns = [3, 4, 5];
        } else {
            this.columns = [6, 7, 8];
        }
    }
}

