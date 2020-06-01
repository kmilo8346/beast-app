import { StyleSheet, ViewStyle } from 'react-native';

interface Styles {
    container: ViewStyle;
}

export default StyleSheet.create<Styles>({
    container: {
        height: 32,
        width: '100%'
    },
});