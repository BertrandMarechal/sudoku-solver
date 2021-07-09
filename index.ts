import { Grid } from "./grid.model";
import { sudokus } from "./data";

for (const sudoku of sudokus) {
    new Grid(sudoku).solve();
}
