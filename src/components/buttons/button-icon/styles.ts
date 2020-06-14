import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import colors from '../../../styles/colors';

interface Styles {
  container: ViewStyle;
  icon: TextStyle;
}

export default StyleSheet.create<Styles>({
  container: {
    alignSelf: 'flex-start',
    padding: 6,
  },
  icon: {
    color: colors.black,
  },
});
