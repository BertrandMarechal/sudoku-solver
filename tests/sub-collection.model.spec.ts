import { Column, Line, Square } from "../src/sub-collections.model";
import { Cell } from "../src/cell.model";

describe('SubCollection', function () {
    describe('cells', () => {
        it('should return the cells', () => {
            const square = new Square(0);
            const line = new Line(0);
            const column = new Column(0);
            const entities = [square, line, column];

            for (let i = 0; i < entities.length; i++) {
                expect(entities[i].cells.length).toEqual(0);
            }
        });
    });
    describe('lockValueToCells', () => {
        it('should set lockedOnPositions for the value', () => {
            const square = new Square(0);
            const line = new Line(0);
            const column = new Column(0);
            const entities = [square, line, column];

            const cell = new Cell(null, 0, { line, column, square });
            for (let i = 0; i < entities.length; i++) {
                entities[i].lockValueToCells(1, [cell]);
                expect(entities[i].lockedOnPositions[1][0]).toEqual(cell);
                expect(Object.keys(entities[i].lockedOnPositions).length).toEqual(1);
            }
        });
    });
    describe('cellSet', () => {
        it('should throw if we already have the value', () => {
            const square = new Square(0);
            const line = new Line(0);
            const column = new Column(0);
            const entities = [square, line, column];

            new Cell(1, 0, { line, column, square });
            const cell = new Cell(null, 1, { line, column, square });
            new Cell(null, 2, { line, column, square });
            new Cell(null, 3, { line, column, square });
            new Cell(null, 4, { line, column, square });
            new Cell(null, 5, { line, column, square });
            new Cell(null, 6, { line, column, square });
            new Cell(null, 7, { line, column, square });
            new Cell(null, 8, { line, column, square });

            for (let i = 0; i < entities.length; i++) {
                let error: Error | undefined;
                try {
                    cell.value = 1;
                } catch (e) {
                    error = e;
                }
                expect(error).not.toBeUndefined();
            }
        });
        it('should update the entities', () => {
            const square = new Square(0);
            const line = new Line(0);
            const column = new Column(0);
            const entities = [square, line, column];

            new Cell(1, 0, { line, column, square });
            const cell = new Cell(null, 1, { line, column, square });
            new Cell(null, 2, { line, column, square });
            new Cell(null, 3, { line, column, square });
            new Cell(null, 4, { line, column, square });
            new Cell(null, 5, { line, column, square });
            new Cell(null, 6, { line, column, square });
            new Cell(null, 7, { line, column, square });
            new Cell(null, 8, { line, column, square });

            for (let i = 0; i < entities.length; i++) {
                cell.value = 2;
                expect(entities[i].missingValues.length).toEqual(7);
                expect(entities[i].freeCells.length).toEqual(7);
            }
        });
        it('should mark as solved if it is the last value', () => {
            const square = new Square(0);
            const line = new Line(0);
            const column = new Column(0);
            const entities = [square, line, column];

            new Cell(1, 0, { line, column, square });
            const cell = new Cell(null, 1, { line, column, square });
            new Cell(3, 2, { line, column, square });
            new Cell(4, 3, { line, column, square });
            new Cell(5, 4, { line, column, square });
            new Cell(6, 5, { line, column, square });
            new Cell(7, 6, { line, column, square });
            new Cell(8, 7, { line, column, square });
            new Cell(9, 8, { line, column, square });

            for (let i = 0; i < entities.length; i++) {
                cell.value = 2;
                expect(entities[i].solved).toEqual(true);
            }
        });
    });
    describe('resetLockedOnPositions', () => {
        it('should empty the lockedOnPositions', () => {

            const square = new Square(0);
            const line = new Line(0);
            const column = new Column(0);
            const entities = [square, line, column];

            const cell = new Cell(null, 0, { line, column, square });
            for (let i = 0; i < entities.length; i++) {
                entities[i].lockValueToCells(1, [cell]);
                expect(entities[i].lockedOnPositions[1][0]).toEqual(cell);
                expect(Object.keys(entities[i].lockedOnPositions).length).toEqual(1);
                entities[i].resetLockedOnPositions();
                expect(Object.keys(entities[i].lockedOnPositions).length).toEqual(0);
            }
        });
    });
    describe('hasValue', () => {
        it('should return true if we are solved', () => {
            const square = new Square(0);
            const line = new Line(0);
            const column = new Column(0);
            const entities = [square, line, column];

            new Cell(1, 0, { line, column, square });
            new Cell(2, 1, { line, column, square });
            new Cell(3, 2, { line, column, square });
            new Cell(4, 3, { line, column, square });
            new Cell(5, 4, { line, column, square });
            new Cell(6, 5, { line, column, square });
            new Cell(7, 6, { line, column, square });
            new Cell(8, 7, { line, column, square });
            new Cell(9, 8, { line, column, square });

            for (let i = 0; i < entities.length; i++) {
                expect(entities[i].hasValue(1)).toEqual(true);
            }
        });
        it('should return whether we have a cell with the value', () => {
            const square = new Square(0);
            const line = new Line(0);
            const column = new Column(0);
            const entities = [square, line, column];

            new Cell(1, 0, { line, column, square });
            new Cell(2, 1, { line, column, square });
            new Cell(3, 2, { line, column, square });
            new Cell(4, 3, { line, column, square });
            new Cell(5, 4, { line, column, square });
            new Cell(6, 5, { line, column, square });
            new Cell(7, 6, { line, column, square });
            new Cell(8, 7, { line, column, square });
            new Cell(null, 8, { line, column, square });

            for (let i = 0; i < entities.length; i++) {
                expect(entities[i].hasValue(1)).toEqual(true);
                expect(entities[i].hasValue(9)).toEqual(false);
            }
        });
    });
    describe('hasValueExtended', () => {
        it('should return true if we are solved', () => {
            const square = new Square(0);
            const line = new Line(0);
            const column = new Column(0);
            const entities = [square, line, column];

            new Cell(1, 0, { line, column, square });
            new Cell(2, 1, { line, column, square });
            new Cell(3, 2, { line, column, square });
            new Cell(4, 3, { line, column, square });
            new Cell(5, 4, { line, column, square });
            new Cell(6, 5, { line, column, square });
            new Cell(7, 6, { line, column, square });
            new Cell(8, 7, { line, column, square });
            new Cell(9, 8, { line, column, square });

            for (let i = 0; i < entities.length; i++) {
                expect(entities[i].hasValueExtended(1, square)).toEqual(true);
            }
        });
        it('should true if we have the value', () => {
            const square = new Square(0);
            const line = new Line(0);
            const column = new Column(0);
            const entities = [square, line, column];

            new Cell(1, 0, { line, column, square });
            new Cell(2, 1, { line, column, square });
            new Cell(3, 2, { line, column, square });
            new Cell(4, 3, { line, column, square });
            new Cell(5, 4, { line, column, square });
            new Cell(6, 5, { line, column, square });
            new Cell(7, 6, { line, column, square });
            new Cell(8, 7, { line, column, square });
            new Cell(null, 8, { line, column, square });

            for (let i = 0; i < entities.length; i++) {
                expect(entities[i].hasValueExtended(1, square)).toEqual(true);
            }
        });
        it('should true if we do not have the value but it is locked', () => {
            const square = new Square(0);
            const line = new Line(0);
            const column = new Column(0);

            const cell1 = new Cell(null, 8, { line, column, square });
            const cell2 = new Cell(null, 71, { line, column, square });

            line.lockValueToCells(9, [cell1]);
            column.lockValueToCells(9, [cell2]);

            expect(line.hasValueExtended(9, column)).toEqual(true);
            expect(column.hasValueExtended(9, line)).toEqual(true);
        });
        it('should false if we do not have the value and it is not locked', () => {
            const square = new Square(0);
            const line = new Line(0);
            const column = new Column(0);
            const entities = [square, line, column];

            new Cell(1, 0, { line, column, square });
            new Cell(2, 1, { line, column, square });
            new Cell(3, 2, { line, column, square });
            new Cell(4, 3, { line, column, square });
            new Cell(5, 4, { line, column, square });
            new Cell(6, 5, { line, column, square });
            new Cell(7, 6, { line, column, square });
            new Cell(8, 7, { line, column, square });
            new Cell(null, 8, { line, column, square });

            for (let i = 0; i < entities.length; i++) {
                expect(entities[i].hasValueExtended(9, square)).toEqual(false);
            }
        });
    });
});
describe('Square', function () {
    describe('entityType', () => {
        it('should have entityType set to square', () => {
            const square = new Square(0);
            expect(square.entityType).toEqual('square');
        });
    });
    describe('lines', () => {
        it('should set the lines correctly', () => {
            for (let i = 0; i < 3; i++) {
                const square = new Square(i);
                expect(square.lines).toEqual([0, 1, 2]);
            }
            for (let i = 3; i < 6; i++) {
                const square = new Square(i);
                expect(square.lines).toEqual([3, 4, 5]);
            }
            for (let i = 6; i < 9; i++) {
                const square = new Square(i);
                expect(square.lines).toEqual([6, 7, 8]);
            }
        });
    });
    describe('columns', () => {
        it('should set the columns correctly', () => {
            for (let i = 0; i < 3; i++) {
                const square = new Square(i * 3);
                expect(square.columns).toEqual([0, 1, 2]);
            }
            for (let i = 3; i < 6; i++) {
                const square = new Square(i * 3 + 1);
                expect(square.columns).toEqual([3, 4, 5]);
            }
            for (let i = 6; i < 9; i++) {
                const square = new Square(i * 3 + 2);
                expect(square.columns).toEqual([6, 7, 8]);
            }
        });
    });
});
describe('Line', function () {
    describe('entityType', () => {
        it('should have entityType set to line', () => {
            const line = new Line(0);
            expect(line.entityType).toEqual('line');
        });
    });
    describe('toString', () => {
        it('should return the cells with a nice formatting', () => {

            const square = new Square(0);
            const line = new Line(0);
            const column = new Column(0);

            new Cell(1, 0, { line, column, square });
            new Cell(2, 1, { line, column, square });
            new Cell(3, 2, { line, column, square });
            new Cell(null, 3, { line, column, square });
            new Cell(null, 4, { line, column, square });
            new Cell(null, 5, { line, column, square });
            new Cell(4, 6, { line, column, square });
            new Cell(5, 7, { line, column, square });
            new Cell(null, 8, { line, column, square });

            expect(line.toString()).toEqual('| 1  2  3 | _  _  _ | 4  5  _ |\n');
        });
    });
    describe('lines', () => {
        it('should set the lines correctly', () => {
            for (let i = 0; i < 3; i++) {
                const line = new Line(i);
                expect(line.lines).toEqual([0, 1, 2]);
            }
            for (let i = 3; i < 6; i++) {
                const line = new Line(i);
                expect(line.lines).toEqual([3, 4, 5]);
            }
            for (let i = 6; i < 9; i++) {
                const line = new Line(i);
                expect(line.lines).toEqual([6, 7, 8]);
            }
        });
    });
});
describe('Column', function () {
    describe('entityType', () => {
        it('should have entityType set to column', () => {
            const column = new Column(0);
            expect(column.entityType).toEqual('column');
        });
    });
    describe('columns', () => {
        it('should set the columns correctly', () => {
            for (let i = 0; i < 3; i++) {
                const column = new Column(i);
                expect(column.columns).toEqual([0, 1, 2]);
            }
            for (let i = 3; i < 6; i++) {
                const column = new Column(i);
                expect(column.columns).toEqual([3, 4, 5]);
            }
            for (let i = 6; i < 9; i++) {
                const column = new Column(i);
                expect(column.columns).toEqual([6, 7, 8]);
            }
        });
    });
});
