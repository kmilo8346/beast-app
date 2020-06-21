import { StyleSheet, ViewStyle } from 'react-native';

interface Styles {
  container: ViewStyle;
  indicator: ViewStyle;
}

export default StyleSheet.create<Styles>({
  container: {
    flex: 1,
  },
  indicator: {
    marginTop: '20%',
  },
});
