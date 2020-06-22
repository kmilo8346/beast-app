import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import colors from '../../../styles/colors';

interface Styles {
  container: ViewStyle;
  label: TextStyle;
  inputWrapper: ViewStyle;
  prefix: ViewStyle;
  prefixComponent: ViewStyle;
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
    top: 0,
    bottom: 0,
    opacity: 0.7,
    justifyContent: 'center',
  },
  prefixComponent: {
    height: 24,
    width: 24,
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
    top: 0,
    bottom: 0,
    opacity: 0.7,
    justifyContent: 'center',
  },
  error: {
    marginTop: 3,
    marginLeft: 4,
  },
});
