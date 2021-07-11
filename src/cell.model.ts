import { Column, EntityType, GridSubCollection, Line, Square } from './sub-collections.model';
import { blue, cyan, gray, green, grey, magenta, red, white, yellow } from 'colors/safe';
import { get } from 'config';
import { levelToSpaces } from "./helpers";

const verbose = get<boolean>('verbose');
const cellChecksEntities = get<boolean>('cellChecksEntities');
const useSubCollectionValueMaps = get<boolean>('useSubCollectionValueMaps');
const color = get<boolean>('color');

export class Cell {
    get value(): number | null {
        return this._value;
    }

    column: number;
    line: number;
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
        this._value = value;
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

    setValue(
        value: number | null,
        origin: "solveValuesBySimpleCross" |
            "solveIfOneMissing" |
            "solveByElimination" |
            "solveValuesByComplexCross",
        entityType: EntityType,
        level: number
    ) {
        this._value = value;
        if (verbose) {
            console.log(levelToSpaces({ level }) + `Found value from ${origin} on ${entityType} for ${this.line + 1} - ${this.column + 1}: ${value}`);
        }
        if (useSubCollectionValueMaps) {
            this.columnEntity.cellSet(this);
            this.lineEntity.cellSet(this);
            this.squareEntity.cellSet(this);
        }
        let cells: Cell[] = [this];
        if (cellChecksEntities) {
            cells.push(...this.solveRelatedToThisOne());
        }
        return cells;
    }

    solveRelatedToThisOne(): Cell[] {
        return [
            ...this.columnEntity.solveIfOneMissing() || [],
            ...this.columnEntity.solveValuesBySimpleCross() || [],
            ...this.lineEntity.solveIfOneMissing() || [],
            ...this.lineEntity.solveValuesBySimpleCross() || [],
            ...this.squareEntity.solveIfOneMissing() || [],
            ...this.squareEntity.solveValuesBySimpleCross() || [],
        ];
    }

    toRawString(textIfEmpty: string = ' '): string {
        return `${this._value || textIfEmpty}`;
    }

    toString() {
        return ` ${this.coloredValue} `;
    }

    get coloredValue() {
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
