import { GridSubCollection } from './sub-collections.model';
import { red, blue, cyan, magenta, grey, gray, green, white, yellow } from 'colors/safe';

export class Cell {
    column: number;
    line: number;
    value: number | null;
    potentialValues: number[];
    lineEntity: GridSubCollection | null;
    columnEntity: GridSubCollection | null;
    squareEntity: GridSubCollection | null;

    constructor(value: number | null, index: number) {
        this.value = value;
        this.column = index % 9;
        this.line = Math.floor(index / 9);
        this.potentialValues = [];
        this.lineEntity = null;
        this.columnEntity = null;
        this.squareEntity = null;
    }

    setEntity(entity: GridSubCollection) {
        switch (entity.entityType) {
            case 'column':
                this.columnEntity = entity;
                break;
            case 'line':
                this.lineEntity = entity;
                break;
            case 'square':
                this.squareEntity = entity;
                break;
        }
    }

    checkEntities(): Cell[] {
        let cellsFound: Cell[] = [];
        if (this.columnEntity) {
            const columnCells = [
                ...this.columnEntity.solveIfOneMissing(),
            ];
            cellsFound = [
                ...cellsFound, ...columnCells
            ];
        }
        if (this.lineEntity) {
            const lineCells = [
                ...this.lineEntity.solveIfOneMissing(),
            ];
            cellsFound = [
                ...cellsFound, ...lineCells
            ];
        }
        if (this.squareEntity) {
            const squareCells = [
                ...this.squareEntity.solveIfOneMissing(),
            ];
            cellsFound = [
                ...cellsFound, ...squareCells
            ];
        }
        return cellsFound;
    }

    toString() {
        return ` ${this.coloredValue} `;
    }

    get coloredValue() {
        if (!this.value) {
            return '_';
        }
        if (process.env.color !== '1') {
            return this.value;
        }
        switch (this.value) {
            case 1:
                return red(`${this.value}`);
            case 2:
                return green(`${this.value}`);
            case 3:
                return yellow(`${this.value}`);
            case 4:
                return blue(`${this.value}`);
            case 5:
                return magenta(`${this.value}`);
            case 6:
                return cyan(`${this.value}`);
            case 7:
                return white(`${this.value}`);
            case 8:
                return gray(`${this.value}`);
            case 9:
                return grey(`${this.value}`);
        }
    }
}
