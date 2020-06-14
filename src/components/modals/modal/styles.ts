import { StyleSheet, ViewStyle } from 'react-native';

import colors from '../../../styles/colors';

interface Styles {
  containerBackdrop: ViewStyle;
  backdrop: ViewStyle;
  containerModal: ViewStyle;
  modal: ViewStyle;
  modal_auto: ViewStyle;
  modal_full: ViewStyle;
  containerDrag: ViewStyle;
  dragIndicator: ViewStyle;
  bodyContainer: ViewStyle;
  title: ViewStyle;
  header: ViewStyle;
  closeContainer: ViewStyle;
}

export default StyleSheet.create<Styles>({
  containerBackdrop: {
    flex: 1,
    backgroundColor: colors.modalBackdrop,
  },
  backdrop: {
    height: '100%',
    width: '100%',
  },
  containerModal: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: 'white',
  },
  modal_auto: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modal_full: {
    flex: 1,
  },
  containerDrag: {
    height: 33,
  },
  dragIndicator: {
    width: 39,
    height: 5,
    backgroundColor: colors.blackLight3,
    marginTop: 5,
    alignSelf: 'center',
    borderRadius: 5,
  },
  bodyContainer: {
    paddingTop: 0,
  },
  title: {
    marginHorizontal: 21,
    marginBottom: 34,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  closeContainer: {
    position: 'absolute',
    right: 0,
  },
});
