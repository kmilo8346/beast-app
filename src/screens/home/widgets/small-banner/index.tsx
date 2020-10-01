import React from 'react';
import { Image } from 'react-native';

// components
import Touchable from '../../../../components/touchable';
// types
import { ComputedWidget, SmallBannerContent } from '../../../../types';

interface ComponentProps {
  data: ComputedWidget;
}

export default ({ data }: ComponentProps) => {
  // computed vars
  const content = data.content as SmallBannerContent;

  // render logic
  return (
    <Touchable>
      <Image
        source={{ uri: content.image }}
        style={{
          width: '100%',
          height: 67,
          borderRadius: 8,
        }}
      />
    </Touchable>
  );
};
