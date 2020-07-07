import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// styles
import colors from '../../../styles/colors';

interface Styles {
  container: ViewStyle;
  icon: TextStyle;
  textContainer: ViewStyle;
  label: TextStyle;
  error: TextStyle;
}

export default StyleSheet.create<Styles>({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: colors.blackLight6,
    borderRadius: 10,
  },
  icon: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    marginBottom: 5,
    color: colors.blackLight2,
  },
  error: {
    marginTop: 3,
    marginLeft: 10,
  },
});
