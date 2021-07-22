import puppeteer from 'puppeteer';
import { SudokuSolver } from './sudoku-solver.model';
import * as fs from "fs";

const levels = ['easy', 'medium', 'hard', 'expert'];

async function fillSudoku(page: puppeteer.Page, values: { line: number, column: number, value: number }[]) {
    if (values) {
        const elem = await page.$('#game');
        if (elem) {
            const boundingBox = await elem.boundingBox();
            const cellSize = (boundingBox?.width || 0) / 9.0;
            for (const { value, column, line } of values) {

                await page.mouse.click(
                    (boundingBox?.x || 0) + column * cellSize + cellSize / 2,
                    (boundingBox?.y || 0) + line * cellSize + cellSize / 2,
                );
                await page.keyboard.type(`${value}`);
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
            try {
                await page.waitForSelector('#ima-play-btn', { timeout: 2000, visible: false });
                await page.click('#ima-play-btn');
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch {
                console.log('No video');
            }
            await page.waitForSelector('.button.button-play', { timeout: 2000, visible: false });
        }
    }
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    let sudoku = {
        mission: '',
        solution: '',
    };
    page.on('response', async (response) => {
        if (response.request().method().toLowerCase() === 'get' && response.url().indexOf(`/api/level/`) > -1) {
            const { mission, solution, difficulty } = await response.json();
            sudoku.solution = solution;
            sudoku.mission = mission;
            fs.writeFileSync(`./data/${difficulty.type}.json`, JSON.stringify({ mission, solution }, null, 2));
        }
    });
    for (const level of levels) {
        sudoku.solution = "";
        sudoku.mission = "";
        await page.goto(`https://sudoku.com/${level}`);
        try {
            await page.waitForSelector('#banner-close');
            await page.click('#banner-close');
            sudoku.solution = "";
            sudoku.mission = "";
        } catch {
            console.log('Cookies accepted');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await page.waitForSelector('#game');

        while (!sudoku.mission) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        const sudokuSolver = new SudokuSolver(sudoku.mission.replace(/0/g, ' '));
        sudokuSolver.solve();
        if (sudokuSolver.solved) {
            await fillSudoku(page, sudokuSolver.getSolution());
        }
    }

    await browser.close();
})();

