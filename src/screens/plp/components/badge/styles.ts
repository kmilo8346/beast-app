import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

import colors from '../../../../styles/colors';

interface Styles {
    container: ViewStyle;
}

export default StyleSheet.create<Styles>({
    container: {
        borderRadius: 22,
        backgroundColor: colors.blue,
        alignSelf: "flex-start",
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,

    },
});