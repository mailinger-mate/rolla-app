export const hexToHSL = (
    hex: string,
): [number, number, number] => {

    let r = parseInt("0x" + hex[1] + hex[2]) / 255,
        g = parseInt("0x" + hex[3] + hex[4]) / 255,
        b = parseInt("0x" + hex[5] + hex[6]) / 255;

    let min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        delta = max - min,
        hue = 0,
        s = 0,
        l = 0;

    if (delta == 0)
        hue = 0;
    else if (max == r)
        hue = ((g - b) / delta) % 6;
    else if (max == g)
        hue = (b - r) / delta + 2;
    else
        hue = (r - g) / delta + 4;

    hue = Math.round(hue * 60);

    if (hue < 0)
        hue += 360;

    l = (max + min) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return [hue, s, l];
}