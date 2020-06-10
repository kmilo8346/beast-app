import { StyleSheet, ViewStyle, ImageStyle } from 'react-native';

interface Styles {
  container: ViewStyle;
  leftContainer: ViewStyle;
  centerContainer: ViewStyle;
  rightContainer: ViewStyle;
  badge: ViewStyle;
  image: ImageStyle;
  name: ViewStyle;
  description: ViewStyle;
  price: ViewStyle;
  action: ViewStyle;
}

export default StyleSheet.create<Styles>({
  container: {
    flex: 1,
    flexDirection: 'row',
    maxHeight: 84,
    paddingLeft: 1,
  },
  leftContainer: {
    width: 60,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    paddingHorizontal: 11,
    paddingTop: 6,
  },
  rightContainer: {},
  badge: {
    position: 'absolute',
    top: 7,
    left: -1,
  },
  image: {
    maxWidth: 56,
    maxHeight: 54,
    borderRadius: 7,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  name: {
    marginTop: 10,
  },
  description: {
    marginTop: 3,
  },
  price: {
    marginTop: 7,
    alignSelf: 'flex-end',
  },
  action: {
    marginTop: 12,
  },
});
