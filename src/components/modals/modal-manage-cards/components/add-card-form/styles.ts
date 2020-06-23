import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

interface Styles {
  cardNumberPrefixImage: ImageStyle;
  loadingErrorContainer: ViewStyle;
  messageText: TextStyle;
  validDateCvvContainer: ViewStyle;
  inputValidDateContainer: ViewStyle;
  inputCvvContainer: ViewStyle;
  optRutContainer: ViewStyle;
  inputNumDocContainer: ViewStyle;
}

export default StyleSheet.create<Styles>({
  cardNumberPrefixImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  loadingErrorContainer: {
    height: 150,
  },
  messageText: {
    textAlign: 'center',
    marginTop: '10%',
  },
  validDateCvvContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputValidDateContainer: {
    width: '40%',
  },
  inputCvvContainer: {
    width: '40%',
  },
  optRutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputNumDocContainer: {
    width: '60%',
  },
});
