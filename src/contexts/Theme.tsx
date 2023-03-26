import React from 'react';

export enum Token {
    // Mono0 = 'mono0',
    // Mono1 = 'mono1',
    MonoLow4 = 'monoLow4',
    MonoLow3 = 'monoLow3',
    MonoLow2 = 'monoLow2',
    MonoLow1 = 'monoLow1',
    // Mono = 'mono',
    MonoHigh3 = 'monoHigh3',
    MonoHigh4 = 'monoHigh4',
    MonoHigh5 = 'monoHigh5',
    MonoHigh6 = 'monoHigh6',
    Warning = 'warning',
    // Primary = 'primary',
    // PrimaryHigh1 = 'primaryHigher1'
};

// Lower             Low               High              Higher
// 000 111 222 333   444 555 666 777   888 999 aaa bbb   ccc ddd eee fff

const Colors: Record<Token, [string] | [string, string]> = {
    [Token.MonoHigh6]: ['#ffffff', '#333333'],
    [Token.MonoHigh5]: ['#fefefe', '#353535'],
    [Token.MonoHigh4]: ['#f5f5f5', '#3c3c3c'],
    [Token.MonoHigh3]: ['#f2f2f2', '#555555'],
    [Token.MonoLow1]: ['#ededed', '#696969'],
    [Token.MonoLow2]: ['#dedede', '#545454'],
    [Token.MonoLow3]: ['#cccccc', '#777777'],
    [Token.MonoLow4]: ['#333333', '#dddddd'],
    [Token.Warning]: ['#ff6347'],
};

const prefersColorDarkMedia = window.matchMedia('(prefers-color-scheme: dark)');

const styleColor = (name: Token, prefersColorDark: boolean) => {
    const [light, dark] = Colors[name];
    return prefersColorDark && dark ? dark : light; 
};

interface Context {
    color: (name: Token) => string;
}

const ThemeContext = React.createContext<Context>({
    color: (name) => styleColor(name, prefersColorDarkMedia.matches)
});

export const useThemeContext = () => React.useContext(ThemeContext);

const ThemeProvider = React.memo((props) => {

    const [prefersColorDark, setPrefersColorDark] = React.useState(prefersColorDarkMedia.matches);

    React.useEffect(() => {
        const listener = (event: MediaQueryListEvent) => setPrefersColorDark(event.matches);
        prefersColorDarkMedia.addEventListener('change', listener);
        return () => prefersColorDarkMedia.removeEventListener('change', listener);
    });

    const color = React.useCallback((name: Token) => {
        return styleColor(name, prefersColorDark)
    }, [
        prefersColorDark,
    ]);

    console.log('ThemeContext', { prefersColorDark })

    const context: Context = {
        color,
    }

    return (
        <ThemeContext.Provider value={context}>
            {props.children}
        </ThemeContext.Provider>
    );

});

export default ThemeProvider;
