import { StyleSheet, ViewStyle } from 'react-native';

interface Styles {
    withMargin: ViewStyle;
    withPadding: ViewStyle;
}

export default StyleSheet.create<Styles>({
    withMargin: {
        marginHorizontal: 20
    },
    withPadding: {
        paddingHorizontal: 20
    },
});