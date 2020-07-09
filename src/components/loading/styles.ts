import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface Styles {
  container: ViewStyle;
  indicator: ViewStyle;
  message: TextStyle;
}

export default StyleSheet.create<Styles>({
  container: {
    flexDirection: 'row',
  },
  indicator: {},
  message: {
    marginLeft: 5,
  },
});
