import React from 'react';

// widgets
import Banner from '../small-banner';
import NearbyStores from '../nearby-stores';
// types
import { ComputedWidget, WidgetType } from '../../../../types';

interface ComponentProps {
  data: ComputedWidget;
}

export default ({ data }: ComponentProps) => {
  // banner
  if (data.type === WidgetType.SMALL_BANNER) {
    return <Banner data={data} />;
  }

  // nearby stores
  if (data.type === WidgetType.NEARBY_STORES) {
    return <NearbyStores data={data} />;
  }

  // not mapped widget
  return null;
};
