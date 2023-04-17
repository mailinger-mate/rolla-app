import React from 'react';
import { theme } from '../theme/default';
import { ColorTheme, Scheme } from '../theme/theme';

const colorDarkMedia = window.matchMedia('(prefers-color-scheme: dark)');

// const styleColor = (name: Token, prefersColorDark: boolean) => {
//     const [light, dark] = Colors[name];
//     return prefersColorDark && dark ? dark : light; 
// };

interface Context {
    color: ColorTheme
}

const colorTheme = (
    schemeDark: boolean,
): ColorTheme => {
    const defaultColor = theme.color[Scheme.Light];
    const color = schemeDark && theme.color[Scheme.Dark];
    return {
        ...defaultColor,
        ...color
    };
}

const ThemeContext = React.createContext<Context>({
    color: colorTheme(colorDarkMedia.matches),
});

export const useThemeContext = () => React.useContext(ThemeContext);

const ThemeProvider = React.memo((props) => {

    const [colorDark, setColorDark] = React.useState(colorDarkMedia.matches);

    React.useEffect(() => {
        const listener = (event: MediaQueryListEvent) => setColorDark(event.matches);
        colorDarkMedia.addEventListener('change', listener);
        return () => colorDarkMedia.removeEventListener('change', listener);
    });

    const context: Context = {
        color: colorTheme(colorDark),
    }

    return (
        <ThemeContext.Provider value={context}>
            {props.children}
        </ThemeContext.Provider>
    );

});

ThemeProvider.displayName = 'ThemeProvider';

export default ThemeProvider;
