import React, { ReactNode, Fragment } from 'react';
import {
  View,
  ViewStyle,
  StyleProp,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Space from '../space';
import globalStyles from '../../styles';
import styles from './styles';

export interface Props {
  safeArea?: boolean;
  withMargin?: boolean;
  withPadding?: boolean;
  withFakeHeader?: boolean;
  style?: StyleProp<ViewStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export default ({
  safeArea = false,
  withMargin = false,
  withPadding = false,
  withFakeHeader = false,
  style = {},
  wrapperStyle = {},
  children,
}: Props) => {
  // creating content
  let content = children;
  if (withFakeHeader) {
    content = (
      <>
        <Space.FakeHeader />
        {children}
      </>
    );
  }

  // creating style
  const containerStyle: StyleProp<ViewStyle> = [styles.container];
  if (withMargin) {
    containerStyle.push(globalStyles.withMargin);
  }
  if (withPadding) {
    containerStyle.push(globalStyles.withPadding);
  }
  containerStyle.push(style);

  // creating container
  let Container: any = <View style={containerStyle}>{content}</View>;
  if (safeArea) {
    Container = <SafeAreaView style={containerStyle}>{content}</SafeAreaView>;
  }
  const _wrapperStyle = [styles.wrapper, wrapperStyle];
  let wrapper = <View style={_wrapperStyle}>{Container}</View>;
  if (Platform.OS === 'ios') {
    wrapper = (
      <KeyboardAvoidingView behavior="padding" style={_wrapperStyle}>
        {Container}
      </KeyboardAvoidingView>
    );
  }
  return wrapper;
};
