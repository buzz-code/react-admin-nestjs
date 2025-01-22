import * as React from 'react';
import { ReportElementType, ReportStyles, getElementStyle, mergeStyles } from './reportStyles';

const StylesContext = React.createContext<ReportStyles>([]);

interface StylesProviderProps {
    value: ReportStyles;
    defaultStyles: ReportStyles;
    children: React.ReactNode;
}
export const StylesProvider: React.FC<StylesProviderProps> = ({ value, defaultStyles, children }) => {
    const mergedStyles = React.useMemo(() => {
        return mergeStyles(value, defaultStyles);
    }, [value, defaultStyles]);

    return (
        <StylesContext.Provider value={mergedStyles}>
            {children}
        </StylesContext.Provider>
    );
};

export const useStyles = (elementType: ReportElementType): ReportStyles[number] => {
    const styles = React.useContext(StylesContext);
    return getElementStyle(elementType, styles);
};

export default StylesContext;

interface IUserStyles {
    userStyles: ReportStyles;
}
export const wrapWithStyles = (Component: React.ComponentType<any>, defaultStyles: ReportStyles) => {
    return (props: IUserStyles) => {
        const { userStyles } = props;
        return (
            <StylesProvider value={userStyles} defaultStyles={defaultStyles}>
                <Component {...props} />
            </StylesProvider>
        );
    };
}
