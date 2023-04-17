export const hexToHSL = (
    hex: string,
    transform?: (
        h: number,
        s: number,
        l: number,
    ) => [number, number, number],
): string => {

    let r = parseInt("0x" + hex[1] + hex[2]) / 255,
        g = parseInt("0x" + hex[3] + hex[4]) / 255,
        b = parseInt("0x" + hex[5] + hex[6]) / 255;

    let min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        delta = max - min,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0)
        h = 0;
    else if (max == r)
        h = ((g - b) / delta) % 6;
    else if (max == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (max + min) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);
    
    [h, s, l] = transform?.(h, s, l) || [h, s, l];

    return `hsl(${h}, ${s}%, ${l}%)`;
}