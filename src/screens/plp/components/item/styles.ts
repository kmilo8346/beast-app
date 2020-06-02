import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface Styles {
    container: ViewStyle;
    leftContainer: ViewStyle;
    centerContainer: ViewStyle;
    rightContainer: ViewStyle;
    badge: ViewStyle;
    image: ViewStyle;
    name: ViewStyle;
    format: ViewStyle;
    price: ViewStyle;
    inputNumber: ViewStyle;
}

export default StyleSheet.create<Styles>({
    container: {
        flex: 1,
        flexDirection: 'row',
        maxHeight: 84,
    },
    leftContainer: {
        width: 60,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center'
    },
    centerContainer: {
        flex: 1,
        paddingHorizontal: 11,
        paddingTop: 6
    },
    rightContainer: {
    },
    badge: {
        position: 'absolute',
        top: 7,
        left: -1
    },
    image: {
        width: 55
    },
    name: {
        marginTop: 9,
    },
    format: {
        marginTop: 3,
    },
    price: {
        marginTop: 7,
        alignSelf: 'flex-end'
    },
    inputNumber: {
        marginTop: 12
    }
});