const HEX = '0123456789abcdef';

const endIndex = HEX.length - 1;

export const cellsBetween = (
    start: string,
    end: string,
    mask: number,
) => {
    const cells = [start];
    const cellMask = start.substring(start.length - mask);
    let cell = start.slice(0, -mask);
    console.log(cell, end.slice(0, -mask));
    while (cell !== end.slice(0, -mask)) {
        let id = [];
        // let isMax = true;
        for (let index = 0; index < cell.length; index++) {
            const digit = cell[index];
            // if (HEX.indexOf(digit) !== endIndex) isMax = false;
            id.push(digit);
        }
        // if (isMax) {
        //     if (cell.length < end.length) {
        //         id = Array.from({ length: cell.length + 1 }, () => HEX[0]);
        //     }
        //     else break;
        // }

        for (let index = id.length - 1; index >= 0; index--) {
            const digit = cell[index];
            const digitIndex = HEX.indexOf(digit);

            if (digitIndex < endIndex) {
                id[index] = HEX[digitIndex + 1];
                break;
            }
            id[index] = HEX[0];
        }

        cell = id.join("");
        cells.push(cell + cellMask);
        // h3Index = end.slice(0, -mask);
    }
    console.log('cellsBetween', start, end, cells.length);
    return cells;
}