import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface Styles {
    container: ViewStyle;
    content: ViewStyle;
    address: ViewStyle;
    // text: TextStyle
}

export default StyleSheet.create<Styles>({
    container: {
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 13,
        paddingLeft: 18
        /* borderStyle: 'solid',
         borderWidth: 1*/
    },
    content: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    address: {
        marginLeft: 18
    }
});