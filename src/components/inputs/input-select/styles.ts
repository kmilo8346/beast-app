import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// styles
import colors from '../../../styles/colors';

interface Styles {
  container: ViewStyle;
  text: TextStyle;
  icon: ViewStyle;
}

export default StyleSheet.create<Styles>({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: colors.blackLight6,
    borderRadius: 7,
  },
  text: {
    marginLeft: 15,
    marginRight: 3,
    flex: 1,
  },
  icon: {
    marginRight: 15,
  },
});
