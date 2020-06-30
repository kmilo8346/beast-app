import { StyleSheet, TextStyle } from 'react-native';

import colors from '../../styles/colors';

interface Styles {
  val: TextStyle;
}

export default StyleSheet.create<Styles>({
  val: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: colors.blackLight5,
    fontSize: 20,
    borderRadius: 13,
    textAlign: 'center',
  },
});
