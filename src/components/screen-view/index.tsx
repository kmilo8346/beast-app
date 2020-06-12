import React, { ReactNode } from 'react';
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
  withMargin?: boolean;
  withPadding?: boolean;
  safeArea?: boolean;
  fakeHeader?: boolean;
  keyboardAvoiding?: boolean;
  style?: StyleProp<ViewStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export default ({
  withMargin = false,
  withPadding = false,
  safeArea = false,
  fakeHeader = false,
  keyboardAvoiding = true,
  style = {},
  wrapperStyle = {},
  children,
}: Props) => {
  // creating content
  let content = children;
  if (fakeHeader) {
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
  const wrapperFinalStyle = [styles.wrapper, wrapperStyle];
  let wrapper = <View style={wrapperFinalStyle}>{Container}</View>;
  if (Platform.OS === 'ios' && keyboardAvoiding) {
    wrapper = (
      <KeyboardAvoidingView behavior="padding" style={wrapperFinalStyle}>
        {Container}
      </KeyboardAvoidingView>
    );
  }
  return wrapper;
};
