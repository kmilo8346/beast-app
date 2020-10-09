import { StyleSheet, ViewStyle } from 'react-native';

import colors from '../../styles/colors';

interface Styles {
  container: ViewStyle;
}

export default StyleSheet.create<Styles>({
  container: {
    borderRadius: 22,
    backgroundColor: colors.blue,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 24,
    minWidth: 24,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: colors.white,
  },
});
