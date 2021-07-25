import { Grid } from "../src/grid.model";
import { solvedGrid, solvedGridAsString } from "../src/data";
import spyOn = jest.spyOn;

describe('GridModel', function () {
    describe('constructor', () => {
        it('should set the level and path if we peovide a parent', () => {
            const parent = new Grid(' '.repeat(81), 0);
            const grid = new Grid(' '.repeat(81), 1, parent);
            expect(parent.level).toEqual(0);
            expect(parent.path).toEqual('0');
            expect(grid.level).toEqual(1);
            expect(grid.path).toEqual('0|1');
        });
    });
    describe('clear', () => {
        it('should clear the grid if the index is not 0 and the grid is not solved', () => {
            const grid = new Grid(' '.repeat(81), 1);
            expect(grid.cells.length).toEqual(81);
            expect(grid.squares.length).toEqual(9);
            expect(grid.lines.length).toEqual(9);
            expect(grid.columns.length).toEqual(9);
            grid.clear();
            expect(grid.cells.length).toEqual(0);
            expect(grid.squares.length).toEqual(0);
            expect(grid.lines.length).toEqual(0);
            expect(grid.columns.length).toEqual(0);
        });
        it('should not clear the grid if the index is 0', () => {
            const grid = new Grid(' '.repeat(81), 0);
            expect(grid.cells.length).toEqual(81);
            expect(grid.squares.length).toEqual(9);
            expect(grid.lines.length).toEqual(9);
            expect(grid.columns.length).toEqual(9);
            grid.clear();
            expect(grid.cells.length).toEqual(81);
            expect(grid.squares.length).toEqual(9);
            expect(grid.lines.length).toEqual(9);
            expect(grid.columns.length).toEqual(9);
        });
        it('should not clear the grid if the index is not 0 but grid is solved', () => {
            const grid = new Grid(solvedGrid, 1);
            expect(grid.cells.length).toEqual(81);
            expect(grid.squares.length).toEqual(9);
            expect(grid.lines.length).toEqual(9);
            expect(grid.columns.length).toEqual(9);
            grid.checkSolved();
            grid.clear();
            expect(grid.cells.length).toEqual(81);
            expect(grid.squares.length).toEqual(9);
            expect(grid.lines.length).toEqual(9);
            expect(grid.columns.length).toEqual(9);
        });
    });
    describe('print', () => {
        it('should log with the grid', () => {
            const grid = new Grid(solvedGrid, 0);
            const consoleLogSpy = spyOn(global.console, 'log');
            spyOn(grid, 'toString').mockImplementation(() => 'string');
            grid.print();
            expect(consoleLogSpy).toHaveBeenCalledWith('string');
        });
    });
    describe('toString', () => {
        it('should log with the grid', () => {
            const grid = new Grid(solvedGrid, 0);
            const gridAsString = grid.toString();
            expect(gridAsString).toEqual(solvedGridAsString);
        });
    });
    describe('toRawString', () => {
        it('should return a raw version of the grid', () => {
            const grid = new Grid(solvedGrid, 0);
            expect(grid.toRawString()).toEqual(solvedGrid);
        });
        it('should return a raw version of the grid with the new option', () => {
            const grid = new Grid(' '.repeat(81), 0);
            expect(grid.toRawString({ value: 1, cell: grid.cells[0] })).toEqual('1' + ' '.repeat(80));
        });
    });
    describe('getCellsToFill', () => {
        it('should return the cells that were not initiallySet', () => {
            const originalGrid = new Grid('1' + ' '.repeat(79) + '9', 0);
            const grid = new Grid(originalGrid.toRawString(), 1);
            const cellsToFill = grid.getCellsToFill(originalGrid);

            expect(cellsToFill.length).toEqual(79);
            expect(cellsToFill.filter((cell) =>
                (cell.line === 0 && cell.column === 0) ||
                (cell.line === 8 && cell.column === 8)
            ).length).toEqual(0);
        });
    });
});
