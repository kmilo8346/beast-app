import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import colors from '../../styles/colors';

interface Styles {
    tagContainer: ViewStyle,
    tag: TextStyle,
    lastItem: ViewStyle,
}

export default StyleSheet.create<Styles>({
    tagContainer: {
        marginBottom: 5,
        backgroundColor: colors.white,
        paddingBottom: 5
    },
    tag: {
        textTransform: 'uppercase'
    },
    lastItem: {
        marginBottom: 15
    }
});