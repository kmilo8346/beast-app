import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import colors from '../../styles/colors';

interface Styles {
    container: ViewStyle;
    minus: ViewStyle;
    plus: ViewStyle;
    value: TextStyle
}

const button: ViewStyle = {
    width: 41,
    borderColor: colors.blueLight1,
    borderStyle: 'solid',
    borderWidth: 1,
    alignItems: 'center',
}

export default StyleSheet.create<Styles>({
    container: {
        width: 86,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    minus: {
        ...button,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    plus: {
        ...button,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8
    },
    value: {
        marginHorizontal: 8
    }
});