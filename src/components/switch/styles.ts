import { StyleSheet, ViewStyle } from 'react-native';
import colors from '../../styles/colors';

interface Styles {
  container: ViewStyle;
  checked: ViewStyle;
  pointerActive: ViewStyle;
}

export default StyleSheet.create<Styles>({
  container: {
    width: 50,
    height: 30,
    borderRadius: 20,
    backgroundColor: colors.blackLight3,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  checked: {
    backgroundColor: colors.blue,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  pointerActive: {
    width: 24,
    height: 24,
    borderRadius: 15,
    backgroundColor: colors.white,
  },
});
