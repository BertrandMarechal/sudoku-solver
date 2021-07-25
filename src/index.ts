import { SudokuSolver } from "./sudoku-solver.model";
// import { sudokus } from "./data";
// for (const sudoku of sudokus) {
//     const sudokuSolver = new SudokuSolver(sudoku);
//     sudokuSolver.solve();
// }

import * as fs from "fs";

const easys = JSON.parse(fs.readFileSync('./data/easys.json').toString('ascii'));
const mediums = JSON.parse(fs.readFileSync('./data/mediums.json').toString('ascii'));
const hards = JSON.parse(fs.readFileSync('./data/hards.json').toString('ascii'));
const experts = JSON.parse(fs.readFileSync('./data/experts.json').toString('ascii'));

console.log('easys', easys.length);
for (const sudoku of easys.filter(({ solved }: any) => !solved)) {
    const sudokuSolver = new SudokuSolver(sudoku.mission);
    sudokuSolver.solve();
}
console.log('mediums', mediums.length);
for (const sudoku of mediums.filter(({ solved }: any) => !solved)) {
    const sudokuSolver = new SudokuSolver(sudoku.mission);
    sudokuSolver.solve();
}
console.log('hards', hards.length);
for (const sudoku of hards.filter(({ solved }: any) => !solved)) {
    const sudokuSolver = new SudokuSolver(sudoku.mission);
    sudokuSolver.solve();
}
console.log('experts', experts.length);
for (const sudoku of experts.filter(({ solved }: any) => !solved)) {
    const sudokuSolver = new SudokuSolver(sudoku.mission);
    sudokuSolver.solve({ timeout: 30000 });
}
