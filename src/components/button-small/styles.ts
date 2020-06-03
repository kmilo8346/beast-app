import { StyleSheet, ViewStyle } from 'react-native';
import colors from '../../styles/colors';

interface Styles {
    container: ViewStyle;
}

export default StyleSheet.create<Styles>({
    container: {
        width: 86,
        paddingVertical: 5,
        borderColor: colors.blueLight1,
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
});