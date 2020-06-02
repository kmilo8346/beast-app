import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface Styles {
    container: ViewStyle;
}

export default StyleSheet.create<Styles>({
    container: {
        width: 86,
        height: 27,
        borderColor: '#C7D7FF',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
});