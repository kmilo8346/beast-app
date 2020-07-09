import { StyleSheet, ViewStyle } from 'react-native';

interface Styles {
  switchContainer: ViewStyle;
}

export default StyleSheet.create<Styles>({
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});
