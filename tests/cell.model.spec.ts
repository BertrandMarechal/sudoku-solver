const config = {
    get: () => jest.fn(() => true)
};
const color = {
    red: jest.fn((value) => value),
    green: jest.fn((value) => value),
    yellow: jest.fn((value) => value),
    blue: jest.fn((value) => value),
    magenta: jest.fn((value) => value),
    cyan: jest.fn((value) => value),
    white: jest.fn((value) => value),
    gray: jest.fn((value) => value),
    grey: jest.fn((value) => value),
};
jest.mock('config', () => config);
jest.mock('colors/safe', () => color);

import { Column, Line, Square } from '../src/sub-collections.model';
import { Cell } from '../src/cell.model';

describe('Cell', function () {
    describe('toString', () => {
        describe('colors', () => {
            it('should call color if the setting is off', () => {
                const square = new Square(0);
                const line = new Line(0);
                const column = new Column(0);

                const cell = new Cell(null, 0, { line, column, square });

                const redSpy = jest.spyOn(color, 'red');
                const greenSpy = jest.spyOn(color, 'green');
                const yellowSpy = jest.spyOn(color, 'yellow');
                const blueSpy = jest.spyOn(color, 'blue');
                const magentaSpy = jest.spyOn(color, 'magenta');
                const cyanSpy = jest.spyOn(color, 'cyan');
                const whiteSpy = jest.spyOn(color, 'white');
                const graySpy = jest.spyOn(color, 'gray');
                const greySpy = jest.spyOn(color, 'grey');

                cell.value = 1;
                cell.toString();
                expect(redSpy).toHaveBeenCalled();
                cell.value = 2;
                cell.toString();
                expect(greenSpy).toHaveBeenCalled();
                cell.value = 3;
                cell.toString();
                expect(yellowSpy).toHaveBeenCalled();
                cell.value = 4;
                cell.toString();
                expect(blueSpy).toHaveBeenCalled();
                cell.value = 5;
                cell.toString();
                expect(magentaSpy).toHaveBeenCalled();
                cell.value = 6;
                cell.toString();
                expect(cyanSpy).toHaveBeenCalled();
                cell.value = 7;
                cell.toString();
                expect(whiteSpy).toHaveBeenCalled();
                cell.value = 8;
                cell.toString();
                expect(graySpy).toHaveBeenCalled();
                cell.value = 9;
                cell.toString();
                expect(greySpy).toHaveBeenCalled();

                expect(redSpy).toHaveBeenCalledTimes(1);
                expect(greenSpy).toHaveBeenCalledTimes(1);
                expect(yellowSpy).toHaveBeenCalledTimes(1);
                expect(blueSpy).toHaveBeenCalledTimes(1);
                expect(magentaSpy).toHaveBeenCalledTimes(1);
                expect(cyanSpy).toHaveBeenCalledTimes(1);
                expect(whiteSpy).toHaveBeenCalledTimes(1);
                expect(graySpy).toHaveBeenCalledTimes(1);
                expect(greySpy).toHaveBeenCalledTimes(1);
            });
        });
    });
});
