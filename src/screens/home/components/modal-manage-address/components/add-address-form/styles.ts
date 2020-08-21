import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// colors
import colors from '../../../../../styles/colors';

interface Styles {
  container: ViewStyle;
  messagesContainer: ViewStyle;
  predictionContainer: ViewStyle;
  messagesText: TextStyle;
  predictionText: TextStyle;
}

export default StyleSheet.create<Styles>({
  container: {
    flex: 1,
  },
  messagesContainer: {
    minHeight: 150,
    maxHeight: 200,
  },
  messagesText: {
    color: 'black',
    textAlign: 'center',
  },
  predictionText: {
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 10,
    lineHeight: 20,
  },
  predictionContainer: {
    marginLeft: 5,
    marginRight: 10,
    borderBottomColor: colors.blackLight6,
    borderBottomWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
