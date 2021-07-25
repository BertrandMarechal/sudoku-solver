import { levelToSpaces } from "../src/helpers";

describe('Helpers', function () {
    describe('levelToSpaces', () => {
        it('should create a string with as many spaces as the level asks for', () => {
            expect(levelToSpaces({ level: 6 })).toEqual('      ');
        });
    });
});
