import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import colors from '../../styles/colors';

interface Styles {
  container: ViewStyle;
  content: ViewStyle;
  cardType: TextStyle;
  chipContainer: ViewStyle;
  chip: ImageStyle;
  numberLogo: ViewStyle;
  numbers: ViewStyle;
  logo: ImageStyle;
  number: TextStyle;
  validCodeContainer: ViewStyle;
  validCodSection: ViewStyle;
  cardHolder: TextStyle;
  dateCod: TextStyle;
}

export default StyleSheet.create<Styles>({
  container: {
    width: 331,
    height: 190,
    borderRadius: 12,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  content: {
    width: 291,
    height: 160,
  },
  cardType: {
    color: colors.white,
    top: 0,
    left: 237,
    fontWeight: 'bold',
  },
  chipContainer: {
    width: 82,
    height: 32,
    marginTop: 2,
    flexDirection: 'row',
  },
  chip: {
    width: 40,
    height: 30,
  },
  numberLogo: {
    width: 291,
    height: 33,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  numbers: {
    width: 235,
    height: 33,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 30,
  },
  number: {
    color: colors.white,
  },
  validCodeContainer: {
    width: 291,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  validCodSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHolder: {
    color: colors.white,
    marginTop: 10,
  },
  dateCod: {
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});
