import React from 'react';
import { View } from 'react-native';

// components
// widgets
import Banner from '../banner';
import NearbyStores from '../nearby-stores';
// types
import { ComputedWidget, WidgetType } from '../../../../types';

interface ComponentProps {
  data: ComputedWidget;
}

export default ({ data }: ComponentProps) => {
  // banner
  if (data.type === WidgetType.BANNER) {
    return <Banner data={data} />;
  }

  // nearby stores
  if (data.type === WidgetType.NEARBY_STORES) {
    return <NearbyStores data={data} />;
  }

  // not mapped widget
  return null;
};
