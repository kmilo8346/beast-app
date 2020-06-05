import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface Styles {
    container: ViewStyle;
    icon: TextStyle
}

export default StyleSheet.create<Styles>({
    container: {
        flex: 1,
        margin: 24 /** Si todo el touchable es clickeable esto es un padding */
    },
    icon: {
        color: 'black'
    }
});