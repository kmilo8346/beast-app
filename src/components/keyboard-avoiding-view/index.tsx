import React, { ReactNode } from 'react';
import {
  View,
  Platform,
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
} from 'react-native';

interface ComponentProps extends KeyboardAvoidingViewProps {
  children: ReactNode;
}

export default ({ children, ...others }: ComponentProps) => {
  if (Platform.OS === 'android') {
    return <View style={{ flex: 1 }}>{children}</View>;
  }
  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={0}
      style={{ flex: 1 }}
      {...others}
    >
      {children}
    </KeyboardAvoidingView>
  );
};
