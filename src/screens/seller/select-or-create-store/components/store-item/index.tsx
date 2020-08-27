import React from 'react';
import { GestureResponderEvent, Image } from 'react-native';

// components
import Touchable from '../../../../../components/touchable';
import Text from '../../../../../components/text';
import Icon from '../../../../../components/icon';
// types
import { Store } from '../../../../../types';
// libs
import * as utils from '../../../../../lib/utils';

export interface StoreItemProps {
  data: Store;
  onPress?: (store: Store) => void;
}

export default ({ data, onPress = utils.noop }: StoreItemProps) => {
  // event handlers
  const pressHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onPress(data);
  };

  // render logic
  const image = data.images[0];
  return (
    <Touchable
      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}
      onPress={pressHandler}
    >
      <Image
        source={{ uri: image }}
        style={{ width: 55, height: 55, borderRadius: 10 }}
      />
      <Text level={5} weight="bold" style={{ flex: 1, marginHorizontal: 15 }}>
        {data.name}
      </Text>
      <Icon name="chevron-right" />
    </Touchable>
  );
};
