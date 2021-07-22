import { SudokuSolver } from "../src/sudoku-solver.model";
import { exampleSudokus } from "../src/data";

describe('SudokuSolver', function () {
    describe('solve', () => {
        it('should solve simple ones', () => {
            for (const sudoku of exampleSudokus.simple) {
                const sudokuSolver = new SudokuSolver(sudoku);
                sudokuSolver.solve();
                expect(sudokuSolver.solved).toEqual(true);
            }
        });
        it('should solve complex ones', () => {
            for (const sudoku of exampleSudokus.complex) {
                const sudokuSolver = new SudokuSolver(sudoku);
                sudokuSolver.solve();
                expect(sudokuSolver.solved).toEqual(true);
            }
        });
        it('should solve some with variations', () => {
            for (const sudoku of exampleSudokus.withChoices) {
                const sudokuSolver = new SudokuSolver(sudoku);
                sudokuSolver.solve();
                expect(sudokuSolver.solved).toEqual(true);
            }
        });
    });
});
