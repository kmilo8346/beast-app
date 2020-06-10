import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import colors from '../../styles/colors';

interface Styles {
  container: ViewStyle;
  label: TextStyle;
  inputContainer: ViewStyle;
  input: TextStyle;
  error: TextStyle;
}

export default StyleSheet.create<Styles>({
  container: {
    marginBottom: 12,
  },
  label: {
    marginLeft: 4,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: colors.blackLight6,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 4,
    paddingRight: 36,
    fontSize: 14,
  },
  error: {
    marginTop: 3,
    marginLeft: 4,
  },
});
