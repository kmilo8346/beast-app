import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import colors from '../../../styles/colors';

interface Styles {
  container: ViewStyle;
  container_dark: ViewStyle;
  minus: ViewStyle;
  plus: ViewStyle;
  icons: ViewStyle;
  minus_dark: ViewStyle;
  plus_dark: ViewStyle;
  icons_dark: ViewStyle;
  textContainer: ViewStyle;
}

const button: ViewStyle = {
  width: 41,
  borderColor: colors.blueLight1,
  borderStyle: 'solid',
  borderWidth: 1,
  alignItems: 'center',
};

export default StyleSheet.create<Styles>({
  container: {
    width: 86,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container_dark: {
    height: 40,
    width: 112,
    borderColor: colors.blackLight4,
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  minus: {
    ...button,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  minus_dark: {
    width: 41,
    alignItems: 'center',
    borderWidth: 0,
  },
  plus: {
    ...button,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  plus_dark: {
    width: 41,
    alignItems: 'center',
    borderWidth: 0,
  },
  icons: {
    color: colors.blue,
  },
  icons_dark: {
    color: colors.blackLight3,
  },
  textContainer: {
    width: 30,
  },
});
