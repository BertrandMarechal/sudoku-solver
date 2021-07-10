import { Grid } from "./grid.model";

export function levelToSpaces(grid: Grid): string {
    return '  '.repeat(grid.level);
}
