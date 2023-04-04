import { Token, Scheme, Theme } from "./theme";

export const theme: Theme = {
    color: {
        [Scheme.Light]: {
            [Token.MonoHigh6]: '#ffffff',
            [Token.MonoHigh5]: '#fefefe',
            [Token.MonoHigh4]: '#f5f5f5',
            [Token.MonoHigh3]: '#f2f2f2',
            [Token.MonoLow1]: '#ededed',
            [Token.MonoLow2]: '#dedede',
            [Token.MonoLow3]: '#cccccc',
            [Token.MonoLow4]: '#333333',
            [Token.Warning]: '#ff6347',
            [Token.Primary]: '#90ee90',
        },
        [Scheme.Dark]: {
            [Token.MonoHigh6]: '#333333',
            [Token.MonoHigh5]: '#353535',
            [Token.MonoHigh4]: '#3c3c3c',
            [Token.MonoHigh3]: '#555555',
            [Token.MonoLow1]: '#696969',
            [Token.MonoLow2]: '#545454',
            [Token.MonoLow3]: '#777777',
            [Token.MonoLow4]: '#dddddd',
        },
    }
} as const;