import { StyleSheet, ViewStyle } from 'react-native';

interface Styles {
  container: ViewStyle;
  horizontal: ViewStyle;
}

export default StyleSheet.create<Styles>({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
});
