
import { defaultTheme } from 'react-admin';

const theme = {
    ...defaultTheme,
    direction: 'rtl',
    isRtl: true,
    components: {
        ...defaultTheme.components,
        RaUserMenu: {
            styleOverrides: {
                root: {
                    "& .MuiButton-startIcon": {
                        marginInlineEnd: 8,
                        marginInlineStart: -4
                    }
                }
            }
        },
        MuiTableCell:{
            styleOverrides:{
                root:{
                    textAlign: 'right'
                }
            }
        },
    }
};

export default theme;