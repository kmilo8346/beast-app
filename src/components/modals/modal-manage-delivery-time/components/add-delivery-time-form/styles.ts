import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// colors
import colors from '../../../../../styles/colors';

interface Styles {
  container: ViewStyle;
  messagesContainer: ViewStyle;
}

export default StyleSheet.create<Styles>({
  container: {
    flex: 1,
  },
  messagesContainer: {
    minHeight: 150,
    maxHeight: 200,
  },
});
