import { sudokus } from "./data";
import { SudokuSolver } from "./sudoku-solver.model";

for (const sudoku of sudokus) {
    const sudokuSolver = new SudokuSolver(sudoku);
    sudokuSolver.solve();
}
