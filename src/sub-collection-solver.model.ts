import { Cell } from "./cell.model";
import { GridSubCollection } from "./sub-collections.model";
import { CellResolution } from "./sudoku-solver.model";
import { get } from "config";

const debug = get<boolean>('debug');

export class SubCollectionSolver {
    /**
     * Loops through the missing values on the entity, and checks if the other sub collections have this entity. If we
     * have only one place where to put the cell, then we place it
     * @param subCollection
     */
    public static solveValuesBySimpleCross(subCollection: GridSubCollection): CellResolution | null {
        if (debug) {
            console.log(`solveValuesBySimpleCross ${subCollection.entityType} ${subCollection.index + 1}`);
        }
        if (subCollection.solved) {
            return null;
        }
        let cost = 0;
        const missingValues = subCollection.missingValues;
        for (const v of missingValues) {
            const availableCells: Cell[] = [];
            const freeCells = subCollection.freeCells;
            for (const cell of freeCells) {
                let isAvailable = false;
                switch (subCollection.entityType) {
                    case "square":
                        isAvailable = !cell.lineEntity.hasValue(v) &&
                            !cell.columnEntity.hasValue(v);
                        cost += 2;
                        break;
                    case "column":
                        isAvailable = !cell.squareEntity.hasValue(v) &&
                            !cell.lineEntity.hasValue(v);
                        cost += 2;
                        break;
                    case "line":
                        isAvailable = !cell.squareEntity.hasValue(v) &&
                            !cell.columnEntity.hasValue(v);
                        cost += 2;
                        break;
                }
                if (isAvailable) {
                    availableCells.push(cell);
                }
            }
            if (availableCells.length === 1) {
                availableCells[0].value = v;
                return new CellResolution({
                    cell: availableCells[0],
                    origin: "solveValuesBySimpleCross",
                    entity: subCollection,
                    cost,
                });
            }
        }
        return null;
    }

    /**
     * Sets the free cell with the missing value if we have one only
     * @param subCollection
     */
    public static solveIfOneMissing(subCollection: GridSubCollection): CellResolution | null {
        if (debug) {
            console.log(`solveIfOneMissing ${subCollection.entityType} ${subCollection.index + 1}`, subCollection.solved, subCollection.missingValues.length, subCollection.freeCells.length);
        }
        if (subCollection.solved) {
            return null;
        }
        let cost = 0;
        let missingValues = subCollection.missingValues;
        if (missingValues.length === 1) {
            cost++;
            const cell = subCollection.freeCells[0];
            cell.value = missingValues[0];
            return new CellResolution({
                cell,
                origin: "solveIfOneMissing",
                entity: subCollection,
                cost,
            });
        }
        return null;
    }

    /**
     * Check potential values for each cell from simple cross, and set the first one that has only one potential value
     * @param subCollection
     */
    public static solveByElimination(subCollection: GridSubCollection): CellResolution | null {
        if (debug) {
            console.log(`solveByElimination ${subCollection.entityType} ${subCollection.index + 1}`);
        }
        if (subCollection.solved) {
            return null;
        }
        let cost = 0;
        const missingValues = subCollection.missingValues;
        const freeCells = subCollection.freeCells;
        for (const freeCell of freeCells) {
            freeCell.potentialValues = missingValues.filter(value => {
                switch (subCollection.entityType) {
                    case "square":
                        cost += 2;
                        return !freeCell.lineEntity.hasValue(value) &&
                            !freeCell.columnEntity.hasValue(value);
                    case "column":
                        cost += 2;
                        return !freeCell.squareEntity.hasValue(value) &&
                            !freeCell.columnEntity.hasValue(value);
                    case "line":
                        cost += 2;
                        return !freeCell.squareEntity.hasValue(value) &&
                            !freeCell.lineEntity.hasValue(value);
                }
            });
            if (freeCell.potentialValues.length === 1) {
                freeCell.value = freeCell.potentialValues[0];
                return new CellResolution({
                    cell: freeCell,
                    origin: "solveByElimination",
                    entity: subCollection,
                    cost,
                });
            }
        }
        return null;
    }

    /**
     * Tries to solve the sub collection based on the values we found will be on one line or column
     * @param subCollection
     */
    static solveValuesByComplexCross(subCollection: GridSubCollection): CellResolution | null {
        if (debug) {
            console.log(`solveValuesByComplexCross ${subCollection.entityType} ${subCollection.index + 1}`);
        }
        if (subCollection.solved) {
            return null;
        }
        let cost = 0;
        const missingValues = subCollection.missingValues;
        for (const v of missingValues) {
            const availableCells: Cell[] = [];
            const freeCells = subCollection.freeCells;
            for (const cell of freeCells) {
                let isAvailable = false;
                switch (subCollection.entityType) {
                    case "square":
                        cost += 2;
                        isAvailable = !cell.lineEntity.hasValueExtended(v, subCollection) &&
                            !cell.columnEntity.hasValueExtended(v, subCollection);
                        break;
                    case "column":
                        cost += 2;
                        isAvailable = !cell.squareEntity.hasValue(v) &&
                            !cell.lineEntity.hasValueExtended(v, subCollection);
                        break;
                    case "line":
                        cost += 2;
                        isAvailable = !cell.squareEntity.hasValue(v) &&
                            !cell.columnEntity.hasValueExtended(v, subCollection);
                        break;
                }
                if (isAvailable) {
                    availableCells.push(cell);
                }
            }
            if (availableCells.length === 1) {
                const cell = availableCells[0];
                cell.value = v;
                return new CellResolution({
                    cell,
                    origin: "solveValuesByComplexCross",
                    entity: subCollection,
                    cost,
                });
            }
        }
        return null;
    }
}
