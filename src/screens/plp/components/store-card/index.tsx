import React from 'react';
import { View, Image, GestureResponderEvent } from 'react-native';

import { Text, Touchable } from '../../../../components';
import colors from '../../../../styles/colors';

export interface StoreCardProps {
  name: string;
  image: string;
  onPress: (event: GestureResponderEvent) => void;
}

export default ({ name, image, onPress }: StoreCardProps) => {
  return (
    <Touchable
      style={{
        position: 'relative',
        width: '48.5%',
      }}
      onPress={onPress}
    >
      <Image
        source={{ uri: image }}
        style={{ width: '100%', height: 135, borderRadius: 7 }}
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          left: 0,
          backgroundColor: 'rgba(1,0,0,0.3)',
          borderRadius: 7,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          left: 0,
          alignItems: 'center',
          height: 45,
        }}
      >
        <Text
          level={5}
          weight="bold"
          color={colors.white}
          multiline
          numberOfLines={2}
          style={{ letterSpacing: 0.5, maxWidth: '95%', textAlign: 'center' }}
        >
          {name}
        </Text>
      </View>
    </Touchable>
  );
};
