import React from 'react';
import { Platform } from 'react-native';
import {
  StackHeaderTitleProps,
  StackNavigationOptions,
} from '@react-navigation/stack';

// components
import Icon from '../components/icon';
import Text from '../components/text';

const commonStackOptions: StackNavigationOptions = {
  headerBackImage: () => <Icon name="chevron-left" />,
  headerLeftContainerStyle: {
    ...Platform.select({
      ios: {
        marginLeft: 18,
      },
      android: {
        marginLeft: 6,
      },
    }),
  },
  headerBackTitleVisible: false,
  headerTitle: ({ style, children }: StackHeaderTitleProps) => (
    <Text
      ellipsizeMode="tail"
      numberOfLines={1}
      level={2}
      weight="bold"
      style={[
        {
          marginLeft: 15,
          marginRight: 5,
        },
        style,
      ]}
    >
      {children}
    </Text>
  ),
  headerStyle: {
    shadowColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitleAlign: 'center',
};

export default commonStackOptions;
