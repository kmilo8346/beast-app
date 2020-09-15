import React, { ReactNode } from 'react';
import { GestureResponderEvent, Image, View } from 'react-native';

// components
import Touchable from '../../../../../components/touchable';
import Text from '../../../../../components/text';
import Icon from '../../../../../components/icon';
// libs
import cloudinary from '../../../../../lib/cloudinary';
// types
import { Store } from '../../../../../types';
// libs
import * as utils from '../../../../../lib/utils';
import colors from '../../../../../styles/colors';

export interface StoreItemProps {
  data: Store;
  progress?: number;
  onPress?: (store: Store) => void;
}

export default ({ data, progress, onPress = utils.noop }: StoreItemProps) => {
  // event handlers
  const pressHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onPress(data);
  };

  // render logic
  const image = data.images[0];
  let inProgressText: ReactNode | null = null;
  if (progress && progress > 0) {
    inProgressText = (
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.red,
          borderRadius: 7,
          paddingHorizontal: 5,
          paddingVertical: 5,
          alignSelf: 'flex-start',
          marginLeft: 15,
        }}
      >
        <Text
          level={7}
          color={colors.red}
        >{`Tienes ${progress} ventas en curso`}</Text>
      </View>
    );
  }
  return (
    <Touchable
      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}
      onPress={pressHandler}
    >
      <Image
        source={{ uri: cloudinary.dynamicUrl(image, 'w_100') }}
        style={{ width: 50, height: 50, borderRadius: 10 }}
      />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text level={5} weight="bold" style={{ marginHorizontal: 15 }}>
          {data.name}
        </Text>
        {inProgressText}
      </View>
      <Icon name="chevron-right" />
    </Touchable>
  );
};
