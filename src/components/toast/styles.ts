import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

import colors from '../../styles/colors';

interface Styles {
  container: ViewStyle;
  toast: ViewStyle;
  message: TextStyle;
}

export default StyleSheet.create<Styles>({
  container: {},
  toast: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  message: {
    flex: 1,
    color: colors.white,
  },
});
