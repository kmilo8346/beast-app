import { StyleSheet, ViewStyle } from 'react-native';

interface Styles {
    container: ViewStyle;
    minus: ViewStyle;
    plus: ViewStyle;
}

const button: ViewStyle = {
    width: 41,
    borderColor: '#C7D7FF',
    borderStyle: 'solid',
    borderWidth: 1,
    alignItems: 'center',
}

export default StyleSheet.create<Styles>({
    container: {
        width: 86,
        flexDirection: 'row',
        justifyContent: 'space-between'
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
    }
});