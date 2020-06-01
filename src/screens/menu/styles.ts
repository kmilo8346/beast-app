import { StyleSheet, ViewStyle } from 'react-native';

interface Styles {
    space1: ViewStyle;
    space2: ViewStyle;
}

export default StyleSheet.create<Styles>({
    space1: {
        height: 40
    },
    space2: {
        height: 28
    },
});