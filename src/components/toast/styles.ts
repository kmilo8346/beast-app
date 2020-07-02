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
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.blackLight5,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  message: {
    flex: 1,
  },
});
