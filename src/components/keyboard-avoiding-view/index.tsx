import React, { ReactNode } from 'react';
import { View, Platform, KeyboardAvoidingView } from 'react-native';

export interface KeyboardAvoidingViewProps {
  children: ReactNode;
}

export default ({ children }: KeyboardAvoidingViewProps) => {
  if (Platform.OS === 'android') {
    return <View style={{ flex: 1 }}>{children}</View>;
  }
  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={0}
      style={{ flex: 1 }}
    >
      {children}
    </KeyboardAvoidingView>
  );
};
