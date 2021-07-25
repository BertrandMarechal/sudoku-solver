import { Column, Line, Square } from "../src/sub-collections.model";
import { Cell } from "../src/cell.model";
import { SubCollectionSolver } from "../src/sub-collection-solver.model";

describe('SubCollectionSolver', function () {
    describe('solveIfOneMissing', () => {
        it('should set the last cell if only one is missing', () => {
            for (let i = 0; i < 3; i++) {
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

                const result = SubCollectionSolver.solveIfOneMissing(entities[i]);
                expect(result).not.toBeNull();
            }
        });
        it('should not set a cell if more than one is missing', () => {
            for (let i = 0; i < 3; i++) {
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
                new Cell(null, 7, { line, column, square });
                new Cell(null, 8, { line, column, square });

                const result = SubCollectionSolver.solveIfOneMissing(entities[i]);
                expect(result).toBeNull();
            }
        });
        it('should not set a cell if none are missing', () => {
            for (let i = 0; i < 3; i++) {
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

                const result = SubCollectionSolver.solveIfOneMissing(entities[i]);
                expect(result).toBeNull();
            }
        });
    });
    describe('solveValuesBySimpleCross', () => {
        it('should set the value if there is only one possibility for the cell', () => {
            for (let i = 0; i < 3; i++) {
                const square = new Square(0);
                const line = new Line(0);
                const column = new Column(0);
                const entities = [square, line, column];

                new Cell(1, 0, { line, column, square});
                new Cell(2, 1, { line, column, square});
                new Cell(3, 2, { line, column, square});
                new Cell(4, 3, { line, column, square});
                new Cell(5, 4, { line, column, square});
                new Cell(6, 5, { line, column, square});
                new Cell(7, 6, { line, column, square});
                new Cell(8, 7, { line, column, square});
                new Cell(null, 8, { line, column, square});

                const result = SubCollectionSolver.solveValuesBySimpleCross(entities[i]);
                expect(result).not.toBeNull();
            }
        });
        it('should not set the value if we are all solved', () => {
            for (let i = 0; i < 3; i++) {
                const square = new Square(0);
                const line = new Line(0);
                const column = new Column(0);
                const entities = [square, line, column];

                new Cell(1, 0, { line, column, square});
                new Cell(2, 1, { line, column, square});
                new Cell(3, 2, { line, column, square});
                new Cell(4, 3, { line, column, square});
                new Cell(5, 4, { line, column, square});
                new Cell(6, 5, { line, column, square});
                new Cell(7, 6, { line, column, square});
                new Cell(8, 7, { line, column, square});
                new Cell(9, 8, { line, column, square});

                const result = SubCollectionSolver.solveValuesBySimpleCross(entities[i]);
                expect(result).toBeNull();
            }
        });
        it('should not set the value if we have more than one available possible cell', () => {
            for (let i = 0; i < 3; i++) {
                const square = new Square(0);
                const line = new Line(0);
                const column = new Column(0);
                const entities = [square, line, column];

                new Cell(null, 0, { line, column, square});
                new Cell(null, 1, { line, column, square});
                new Cell(null, 2, { line, column, square});
                new Cell(null, 3, { line, column, square});
                new Cell(null, 4, { line, column, square});
                new Cell(null, 5, { line, column, square});
                new Cell(null, 6, { line, column, square});
                new Cell(null, 7, { line, column, square});
                new Cell(null, 8, { line, column, square});

                const result = SubCollectionSolver.solveValuesBySimpleCross(entities[i]);
                expect(result).toBeNull();
            }
        });
    });
    describe('solveByElimination', () => {
        it('should return null if the subCollection is solved', () => {
            for (let i = 0; i < 3; i++) {
                const square = new Square(0);
                const line = new Line(0);
                const column = new Column(0);
                const entities = [square, line, column];

                new Cell(1, 0, { line, column, square});
                new Cell(2, 1, { line, column, square});
                new Cell(3, 2, { line, column, square});
                new Cell(4, 3, { line, column, square});
                new Cell(5, 4, { line, column, square});
                new Cell(6, 5, { line, column, square});
                new Cell(7, 6, { line, column, square});
                new Cell(8, 7, { line, column, square});
                new Cell(9, 8, { line, column, square});

                const result = SubCollectionSolver.solveByElimination(entities[i]);
                expect(result).toBeNull();
            }
        });
        it('should set the value if there is only one potential value for the cell', () => {
            for (let i = 0; i < 3; i++) {
                const square = new Square(0);
                const line = new Line(0);
                const column = new Column(0);
                const entities = [square, line, column];

                new Cell(1, 0, { line, column, square});
                new Cell(2, 1, { line, column, square});
                new Cell(3, 2, { line, column, square});
                new Cell(4, 3, { line, column, square});
                new Cell(5, 4, { line, column, square});
                new Cell(6, 5, { line, column, square});
                new Cell(7, 6, { line, column, square});
                new Cell(8, 7, { line, column, square});
                new Cell(null, 8, { line, column, square});

                const result = SubCollectionSolver.solveByElimination(entities[i]);
                expect(result).not.toBeNull();
            }
        });
        it('should not the value if there is more than one potential value for the cell', () => {
            for (let i = 0; i < 3; i++) {
                const square = new Square(0);
                const line = new Line(0);
                const column = new Column(0);
                const entities = [square, line, column];

                new Cell(1, 0, { line, column, square});
                new Cell(2, 1, { line, column, square});
                new Cell(3, 2, { line, column, square});
                new Cell(4, 3, { line, column, square});
                new Cell(5, 4, { line, column, square});
                new Cell(6, 5, { line, column, square});
                new Cell(7, 6, { line, column, square});
                new Cell(null, 7, { line, column, square});
                new Cell(null, 8, { line, column, square});

                const result = SubCollectionSolver.solveByElimination(entities[i]);
                expect(result).toBeNull();
            }
        });
    });
    describe('solveValuesByComplexCross', () => {
        it('should return null if the subCollection is solved', () => {
            for (let i = 0; i < 3; i++) {
                const square = new Square(0);
                const line = new Line(0);
                const column = new Column(0);
                const entities = [square, line, column];

                new Cell(1, 0, { line, column, square});
                new Cell(2, 1, { line, column, square});
                new Cell(3, 2, { line, column, square});
                new Cell(4, 3, { line, column, square});
                new Cell(5, 4, { line, column, square});
                new Cell(6, 5, { line, column, square});
                new Cell(7, 6, { line, column, square});
                new Cell(8, 7, { line, column, square});
                new Cell(9, 8, { line, column, square});

                const result = SubCollectionSolver.solveValuesByComplexCross(entities[i]);
                expect(result).toBeNull();
            }
        });
    });
});
