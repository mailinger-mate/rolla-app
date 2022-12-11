export const minMs = 6e+4;
export const hourMs = 3.6e+6;
export const dayMs = 8.64e+7;

export const isAfter = (
    date: Date,
    time: number,
) => {
    return +new Date() - +date > time;
}