import React from 'react';
import { Image } from 'react-native';

// types
import { ComputedWidget, BannerContent } from '../../../../types';
import { Touchable } from '../../../../components';

interface ComponentProps {
  data: ComputedWidget;
}

export default ({ data }: ComponentProps) => {
  // computed vars
  const content = data.content as BannerContent;
  // render logic
  return (
    <Touchable>
      <Image
        source={{ uri: content.image }}
        style={{
          width: '100%',
          height: 200,
          borderRadius: 20,
        }}
      />
    </Touchable>
  );
};
