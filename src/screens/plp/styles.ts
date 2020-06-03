import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import colors from '../../styles/colors';
interface Styles {
    tagContainer: ViewStyle,
    sections: ViewStyle,
    tag: TextStyle,
    item: ViewStyle,
    lastItem: ViewStyle,
}

export default StyleSheet.create<Styles>({
    tagContainer: {
        marginBottom: 5,
        backgroundColor: colors.white,
        paddingBottom: 5
    },
    sections: {
    },
    tag: {
        textTransform: 'uppercase'
    },
    item: {
        marginBottom: 5
    },
    lastItem: {
        marginBottom: 15
    }
});