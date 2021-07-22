export const exampleSudokus = {
    simple: [
        '  74 6  9 4  17 6 9           7  84   8     2   3  91 1         7  24 9   35 9  7',
        '4  3 7  883  4  16  6   4      7      1 3 9  982   371  7   8    3   1     619   ',
        '6 8   9 2   1 6     4 7 1  1   9   4  3 4 5    57 23           8  425  94  9 7  6',
    ],
    complex: [
        // '   784   7 95 26 31   6   4             3    4 38 72 93 2   9 56       25  9 3  7',
        '15  82   3   7  1       753   5276 9      5   4  638 74    8   7 3 4 1    86  3  ',
    ],
    withChoices: [
        '2  53  647      9       13 1     6   8 9   273    79      4  71  5  63   37 9   6',
    ],
    expert: [
        '  9     1  1 4 9   56      4   1  6 9  7  3     45   7   9  68    2    47  8     ',
    ]
};

export const sudokus = [
    // ...exampleSudokus.simple,
    ...exampleSudokus.complex,
    // ...exampleSudokus.withChoices,
];
