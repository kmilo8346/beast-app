import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import colors from '../../../styles/colors';

interface Styles {
  container: ViewStyle;
  label: TextStyle;
  inputWrapper: ViewStyle;
  prefix: ViewStyle;
  input: TextStyle;
  suffix: ViewStyle;
  error: TextStyle;
}

export default StyleSheet.create<Styles>({
  container: {
    marginBottom: 12,
  },
  label: {
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
  },
  prefix: {
    position: 'absolute',
    left: 0,
    top: 6,
    opacity: 0.7,
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
  suffix: {
    position: 'absolute',
    right: 0,
    top: 6,
    opacity: 0.7,
  },
  error: {
    marginTop: 3,
    marginLeft: 4,
  },
});
