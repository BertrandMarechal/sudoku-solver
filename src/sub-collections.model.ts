import { Cell } from "./cell.model";
import { Grid } from "./grid.model";
import { get } from 'config';
import { levelToSpaces } from "./helpers";
import { red } from "colors/safe";

const verbose = get<boolean>('verbose');
const useSubCollectionValueMaps = get<boolean>('useSubCollectionValueMaps');

export const oneToNine = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export type EntityType = "unset" | "square" | "line" | "column" | "value";

export class GridSubCollection {
    protected _cells: Cell[];
    solved: boolean;
    grid: Grid;
    entityType: EntityType;
    index: number;
    lockedOnPositions: Record<number, Cell[]>;
    foundValues: Record<number, Cell | null>;
    private _missingValues: number[];
    private _freeCells: Cell[];

    constructor(grid: Grid, index: number, entityType: EntityType = "unset") {
        this.grid = grid;
        this.entityType = entityType;
        this._cells = [];
        this.index = index;
        this.solved = false;
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
        let valid = true;
        if (useSubCollectionValueMaps) {
            if (!!this.foundValues[cell.value as number] &&
                (
                    cell.column !== this.foundValues[cell.value as number]?.column ||
                    cell.line !== this.foundValues[cell.value as number]?.line
                )
            ) {
                valid = false;
            } else {
                this.foundValues[cell.value as number] = cell;
                this._missingValues = this._missingValues.filter((value) => value !== cell.value);
                this._freeCells = this._freeCells.filter(freeCell => freeCell !== cell);
                this.solved = this._freeCells.length === 0;
            }
        } else {
            valid = this.checkIsValid();
            if (valid) {
                this.solved = this.missingValues.length === 0;
            }
        }
        if (!valid) {
            if (verbose) {
                console.log(levelToSpaces(this.grid) + `Invalid solution for ${this.entityType} ${this.index + 1}`);
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
        if (this.solved) {
            return true;
        }
        if (useSubCollectionValueMaps) {
            this.grid.incrementSteps();
            return !!this.foundValues[valueToCheck];
        }
        return this._cells.some(({ value }) => {
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
        return this._cells.filter(({ value }) => {
            this.grid.incrementSteps();
            return !value;
        });
    }

    get missingValues(): number[] {
        if (useSubCollectionValueMaps) {
            return this._missingValues;
        }
        return [...oneToNine].filter(v => !this._cells.some(({ value }) => {
            this.grid.incrementSteps();
            return value === v;
        }));
    }

    private checkIsValid(): boolean {
        for (const cell of this._cells) {
            if (cell.value) {
                if (this._cells.filter(({ value }) => value === cell.value).length > 1) {
                    return false;
                }
            }
        }
        return true;
    }

    protected settingCell(
        cell: Cell,
        value: number,
        origin: "solveValuesBySimpleCross" | "solveIfOneMissing" | "solveByElimination" | "solveValuesByComplexCross"
    ): Cell[] {
        return cell.setValue(value, origin, this.entityType, this.grid.level);
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
                let isAvailable = false;
                switch (this.entityType) {
                    case "square":
                        isAvailable = !cell.lineEntity.hasValue(v) &&
                            !cell.columnEntity.hasValue(v);
                        break;
                    case "column":
                        isAvailable = !cell.squareEntity.hasValue(v) &&
                            !cell.columnEntity.hasValue(v);
                        break;
                    case "line":
                        isAvailable = !cell.squareEntity.hasValue(v) &&
                            !cell.lineEntity.hasValue(v);
                        break;
                }
                if (isAvailable) {
                    availableCells.push(cell);
                }
            }
            if (availableCells.length === 1) {
                return this.settingCell(availableCells[0], v, "solveValuesBySimpleCross");
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
            const cell = this._cells.find(({ value }) => {
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
            freeCell.potentialValues = missingValues.filter(value => {
                switch (this.entityType) {
                    case "square":
                        return !freeCell.lineEntity.hasValue(value) &&
                            !freeCell.columnEntity.hasValue(value);
                    case "column":
                        return !freeCell.squareEntity.hasValue(value) &&
                            !freeCell.columnEntity.hasValue(value);
                    case "line":
                        return !freeCell.squareEntity.hasValue(value) &&
                            !freeCell.lineEntity.hasValue(value);
                }
            });
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

    constructor(grid: Grid, index: number) {
        super(grid, index, "square");
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

    solveValuesByComplexCross(): Cell[] {
        if (this.solved) {
            return [];
        }
        const missingValues = this.missingValues;
        for (const v of missingValues) {
            const availableCells: Cell[] = [];
            const freeCells = this.freeCells;
            for (const cell of freeCells) {
                if (!cell.lineEntity.hasValueNotOnSquare(v, this) &&
                    !cell.columnEntity.hasValueNotOnSquare(v, this)) {
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

    hasCell({ line, column }: { line: number; column: number }) {
        return this.lines.some(l => l === line) && this.columns.some(c => c === column);
    }
}

export class Line extends GridSubCollection {
    constructor(grid: Grid, index: number) {
        super(grid, index, "line");
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
    constructor(grid: Grid, index: number) {
        super(grid, index, "column");
    }
}

