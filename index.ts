process.env.verbose = '2';
process.env.cellChecksEntities = '1';
process.env.color = '1';
process.env.stopOnFirstSuccessfulSubGrid = '0';
import { Grid } from "./grid.model";
import { sudokus } from "./data";

for (const sudoku of sudokus) {
    new Grid(sudoku).solve();
}
