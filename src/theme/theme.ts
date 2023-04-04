export enum Scheme {
    Light = 'light',
    Dark = 'dark',
}

export enum Token {
    MonoLow4 = 'monoLow4',
    MonoLow3 = 'monoLow3',
    MonoLow2 = 'monoLow2',
    MonoLow1 = 'monoLow1',
    MonoHigh3 = 'monoHigh3',
    MonoHigh4 = 'monoHigh4',
    MonoHigh5 = 'monoHigh5',
    MonoHigh6 = 'monoHigh6',
    Primary = 'primary',
    Warning = 'warning',
};

export type ColorTheme = Record<Token, string>;

export type Theme = {
    color: {
        [index: string]: Partial<ColorTheme>;
        [Scheme.Light]: ColorTheme;
    }
}
