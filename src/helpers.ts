import { Grid } from "./grid.model";

export function levelToSpaces({ level }: { level: number }): string {
    return '  '.repeat(level);
}
