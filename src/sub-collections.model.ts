import { Cell } from "./cell.model";
import { Grid } from "./grid.model";
import { get } from 'config';
const verbose = get<boolean>('verbose');
const cellChecksEntities = get<boolean>('cellChecksEntities');

export const oneToNine = [1, 2, 3, 4, 5, 6, 7, 8, 9];

type EntityType = "unset" | "square" | "line" | "column";

export class GridSubCollection {
    cells: Cell[];
    solved: boolean;
    grid: Grid;
    entityType: EntityType;
    index: number;
    lockedOnPositions: Record<number, Cell[]>;

    constructor(grid: Grid, cells: Cell[], index: number, entityType: EntityType = "unset") {
        this.grid = grid;
        this.entityType = entityType;
        this.cells = cells;
        this.index = index;
        this.solved = false;
        this.lockedOnPositions = {};
        for (const cell of cells) {
            cell.setEntity(this);
        }
    }

    resetLockedOnPositions(): void {
        this.lockedOnPositions = {};
    }

    lockValueToCells(value: number, cells: Cell[]): void {
        this.lockedOnPositions[value] = cells;
    }

    hasValue(valueToCheck: number): boolean {
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
        return this.cells.filter(({ value }) => {
            this.grid.incrementSteps();
            return !value;
        });
    }

    get missingValues(): number[] {
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

    checkIsValid(): void {
        for (const cell of this.cells) {
            if (cell.value) {
                if (this.cells.filter(({ value }) => value === cell.value).length > 1) {
                    throw new Error('Invalid solution');
                }
            }
        }
    }

    settingCell(
        cell: Cell,
        value: number,
        origin: "solveValuesBySimpleCross" | "solveIfOneMissing" | "solveByElimination" | "solveValuesByComplexCross"
    ): Cell[] {
        let cells: Cell[] = [cell];
        cell.value = value;
        if (verbose) {
            console.log(`Found value from ${origin} on ${this.entityType} for ${cell.line + 1} - ${cell.column + 1}: ${cell.value}`);
        }
        if (cellChecksEntities) {
            const otherCells = cell.checkEntities();
            cells = [cell, ...otherCells];
        }
        return cells;
    }

    solveValuesBySimpleCross(grid: Grid): Cell[] {
        if (this.solved) {
            return [];
        }
        const missingValues = this.missingValues;
        for (const v of missingValues) {
            const availableCells: Cell[] = [];
            const freeCells = this.freeCells;
            for (const cell of freeCells) {
                if (!grid.lines[cell.line].hasValue(v) &&
                    !grid.columns[cell.column].hasValue(v)) {
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

    solveByElimination(grid: Grid): Cell[] {
        if (this.solved) {
            return [];
        }
        const missingValues = this.missingValues;
        const freeCells = this.freeCells;
        for (const freeCell of freeCells) {
            freeCell.potentialValues = missingValues.filter(value =>
                !grid.lines[freeCell.line].hasValue(value) &&
                !grid.columns[freeCell.column].hasValue(value)
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

    solveValuesByComplexCross(grid: Grid): Cell[] {
        if (this.solved) {
            return [];
        }
        const missingValues = this.missingValues;
        for (const v of missingValues) {
            const availableCells: Cell[] = [];
            const freeCells = this.freeCells;
            for (const cell of freeCells) {
                if (!grid.lines[cell.line].hasValueNotOnSquare(v, this) &&
                    !grid.columns[cell.column].hasValueNotOnSquare(v, this)) {
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

