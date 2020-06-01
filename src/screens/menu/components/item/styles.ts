import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

import colors from '../../../../styles/colors';

interface Styles {
    container: ViewStyle;
    textContainer: ViewStyle;
    name: ViewStyle,
    description: ViewStyle,
    iconContainer: ViewStyle
}

export default StyleSheet.create<Styles>({
    container: {
        flex: 1,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderColor: '#F5F5F5',
        marginBottom: 24,
        paddingLeft: 3
    },
    textContainer: {
        flex: 1,
    },
    name: {
        marginBottom: 4
    },
    description: {
        marginBottom: 16
    },
    iconContainer: {
        alignSelf: "center"
    }
});