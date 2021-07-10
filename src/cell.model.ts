import { GridSubCollection } from './sub-collections.model';
import { blue, cyan, gray, green, grey, magenta, red, white, yellow } from 'colors/safe';
import { get } from 'config';
import { Grid } from "./grid.model";

const useSubCollectionValueMaps = get<boolean>('useSubCollectionValueMaps');
const color = get<boolean>('color');

export class Cell {
    set value(value: number | null) {
        this._value = value;
        if (useSubCollectionValueMaps) {
            this.columnEntity?.cellSet(this);
            this.lineEntity?.cellSet(this);
            this.squareEntity?.cellSet(this);
        }
    }
    get value(): number | null {
        return this._value;
    }
    column: number;
    line: number;
    private _value: number | null;
    potentialValues: number[];
    lineEntity: GridSubCollection | null;
    columnEntity: GridSubCollection | null;
    squareEntity: GridSubCollection | null;

    constructor(value: number | null, index: number) {
        this._value = value;
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
        return [
            ...this.columnEntity?.solveIfOneMissing() || [],
            ...this.columnEntity?.solveValuesBySimpleCross() || [],
            ...this.lineEntity?.solveIfOneMissing() || [],
            ...this.lineEntity?.solveValuesBySimpleCross() || [],
            ...this.squareEntity?.solveIfOneMissing() || [],
            ...this.squareEntity?.solveValuesBySimpleCross() || [],
        ];
    }

    toString() {
        return ` ${this.coloredValue} `;
    }

    get coloredValue() {
        if (!this.value) {
            return '_';
        }
        if (!color) {
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
