import { SudokuSolver } from "../src/sudoku-solver.model";
import * as fs from "fs";

// const mediums = JSON.parse(fs.readFileSync('./data/mediums.json').toString('ascii'));
// const hards = JSON.parse(fs.readFileSync('./data/hards.json').toString('ascii'));
// const experts = JSON.parse(fs.readFileSync('./data/experts.json').toString('ascii'));

describe('SudokuSolver', function () {
    describe('solve', () => {
        it.skip('should solve simple ones', () => {
            const easys = JSON.parse(fs.readFileSync('./data/easys.json').toString('ascii'));
            for (const sudoku of easys) {
                const sudokuSolver = new SudokuSolver(sudoku.mission);
                sudokuSolver.solve();
                expect(sudokuSolver.solved).toEqual(true);
            }
        });
    });
});
