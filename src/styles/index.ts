import { StyleSheet, ViewStyle } from 'react-native';

interface Styles {
  withMargin: ViewStyle;
  withPadding: ViewStyle;
  withMainActionAir: ViewStyle;
  withScreenAir: ViewStyle;
  withCartSpace: ViewStyle;
  screenWithoutHeaderSpace: ViewStyle;
  modalSubtitleSpace: ViewStyle;
}

export default StyleSheet.create<Styles>({
  withMargin: {
    marginHorizontal: 20,
  },
  withPadding: {
    paddingHorizontal: 20,
  },
  withMainActionAir: {
    marginBottom: 15,
  },
  withScreenAir: {
    marginBottom: 150,
  },
  withCartSpace: {
    marginBottom: 90,
  },
  screenWithoutHeaderSpace: {
    marginBottom: 10,
  },
  modalSubtitleSpace: {
    marginBottom: 20,
  },
});
