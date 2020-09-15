import React, { memo } from 'react';
import { Image, View, GestureResponderEvent } from 'react-native';

// components
import Touchable from '../../../../../../components/touchable';
import Text from '../../../../../../components/text';
// libs
import durationFormatter from '../../../../../../lib/formatters/duration-formatter';
import { navigate } from '../../../../../../lib/root-navigation';
import cloudinary from '../../../../../../lib/cloudinary';
// types
import { Store } from '../../../../../../types';
// styles
import colors from '../../../../../../styles/colors';

interface ComponentProps {
  data: Store;
}

export default memo(({ data }: ComponentProps) => {
  // computed vars
  const image = data.images[0];
  const timeText = durationFormatter.humanizeDurationRange(
    data.delivery_time.gte,
    data.delivery_time.lte
  );

  // event handlers
  const pressHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigate('Store', { store: data });
  };

  // render logic
  return (
    <Touchable
      style={{
        backgroundColor: colors.white,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,

        elevation: 1,
      }}
      onPress={pressHandler}
    >
      <Image
        source={{ uri: cloudinary.dynamicUrl(image, 'h_500') }}
        style={{
          width: '100%',
          height: 250,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      />
      <View
        style={{
          paddingLeft: 15,
          paddingTop: 15,
          paddingBottom: 15,
          paddingRight: 15,
        }}
      >
        <Text
          level={4}
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginBottom: 2 }}
        >
          {data.name}
        </Text>
        <Text
          level={6}
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginBottom: 2 }}
        >
          {timeText}
        </Text>
      </View>
    </Touchable>
  );
});
