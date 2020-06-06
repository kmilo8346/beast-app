import { StyleSheet, ViewStyle } from 'react-native';

import colors from '../../styles/colors';

interface Styles {
    wrapper: ViewStyle;
    container: ViewStyle;
}

export default StyleSheet.create<Styles>({
    wrapper: {
        flex: 1,
        height: '100%',
        backgroundColor: 'transparent'
    },
    container: {
        flex: 1,
        height: '100%',
        backgroundColor: colors.white

    }
});