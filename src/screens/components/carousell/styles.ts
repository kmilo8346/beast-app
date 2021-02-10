import { StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import colors from '../../../styles/colors';

interface Styles {
  container: ViewStyle;
  barContainer: ViewStyle;
  track: ViewStyle;
  bar: ViewStyle;
}

export default StyleSheet.create<Styles>({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    marginBottom: 10,
  },
  barContainer: {
    zIndex: 2,
    flexDirection: 'row',
    marginTop: 10,
  },
  track: {
    backgroundColor: colors.blackLight4,
    overflow: 'hidden',
    height: 2,
  },
  bar: {
    backgroundColor: colors.blue,
    height: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
