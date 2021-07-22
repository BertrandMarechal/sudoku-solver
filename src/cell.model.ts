import { Column, GridSubCollection, Line, Square } from './sub-collections.model';
import { blue, cyan, gray, green, grey, magenta, red, white, yellow } from 'colors/safe';
import { get } from 'config';

const color = get<boolean>('color');

export class Cell {
    set value(value: number | null) {
        this._value = value;
        this.columnEntity.cellSet(this);
        this.lineEntity.cellSet(this);
        this.squareEntity.cellSet(this);
    }
    get value(): number | null {
        return this._value;
    }

    column: number;
    line: number;
    initiallySet: boolean;
    private _value: number | null;
    potentialValues: number[];
    lineEntity: GridSubCollection;
    columnEntity: GridSubCollection;
    squareEntity: GridSubCollection;

    constructor(
        value: number | null,
        index: number,
        { line, column, square }: {
            line: Line;
            column: Column;
            square: Square;
        }
    ) {
        this._value = value || null;
        this.initiallySet = !!value;
        this.column = index % 9;
        this.line = Math.floor(index / 9);
        this.potentialValues = [];
        this.lineEntity = line;
        this.columnEntity = column;
        this.squareEntity = square;
        this.lineEntity.addCell(this);
        this.columnEntity.addCell(this);
        this.squareEntity.addCell(this);
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

    toRawString(textIfEmpty: string = ' '): string {
        return `${this._value || textIfEmpty}`;
    }

    toString() {
        return ` ${this._coloredValue} `;
    }

    private get _coloredValue() {
        if (!this._value) {
            return '_';
        }
        if (!color) {
            return this._value;
        }
        switch (this._value) {
            case 1:
                return red(`${this._value}`);
            case 2:
                return green(`${this._value}`);
            case 3:
                return yellow(`${this._value}`);
            case 4:
                return blue(`${this._value}`);
            case 5:
                return magenta(`${this._value}`);
            case 6:
                return cyan(`${this._value}`);
            case 7:
                return white(`${this._value}`);
            case 8:
                return gray(`${this._value}`);
            case 9:
                return grey(`${this._value}`);
        }
    }
}
