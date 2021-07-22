import { Column, Line, Square } from "../src/sub-collections.model";
import { Cell } from "../src/cell.model";

describe('SubCollection', function () {
});
describe('Square', function () {
    describe('entityType', () => {
        it('should have entityType set to square', () => {
            const square = new Square(0);
            expect(square.entityType).toEqual('square');
        });
    })
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

            new Cell(1, 0, { line, column, square});
            new Cell(2, 1, { line, column, square});
            new Cell(3, 2, { line, column, square});
            new Cell(null, 3, { line, column, square});
            new Cell(null, 4, { line, column, square});
            new Cell(null, 5, { line, column, square});
            new Cell(4, 6, { line, column, square});
            new Cell(5, 7, { line, column, square});
            new Cell(null, 8, { line, column, square});

            expect(line.toString()).toEqual('| 1  2  3 | _  _  _ | 4  5  _ |\n');
        });
    });
});
describe('Column', function () {
    describe('entityType', () => {
        it('should have entityType set to column', () => {
            const column = new Column(0);
            expect(column.entityType).toEqual('column');
        });
    })
});
