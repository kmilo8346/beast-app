import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

import colors from '../../../styles/colors';

interface Styles {
  container: ViewStyle;
  container_primary: ViewStyle;
  container_secondary: ViewStyle;
  container_link: ViewStyle;
  container_disabled: ViewStyle;
  title_primary: TextStyle;
  title_secondary: TextStyle;
  title_link: TextStyle;
  iconContainer: ViewStyle;
  loadingContainer: ViewStyle;
  icon: ViewStyle;
}

export default StyleSheet.create<Styles>({
  container: {
    height: 49,
    borderRadius: 10,
    position: 'relative',
    paddingHorizontal: 19,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container_primary: {
    backgroundColor: colors.blue,
    color: colors.white,
  },
  container_secondary: {
    backgroundColor: colors.white,
    color: colors.blue,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: colors.blue,
  },
  container_link: {
    backgroundColor: colors.white,
    color: colors.blue,
    height: 'auto',
  },
  container_disabled: {
    opacity: 0.6,
  },
  title_primary: {
    color: colors.white,
  },
  title_secondary: {
    color: colors.blue,
  },
  title_link: {
    textAlign: 'center',
    color: colors.blue,
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 18,
    width: 24,
    justifyContent: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 18,
    width: 24,
    justifyContent: 'center',
  },
  icon: {},
});
