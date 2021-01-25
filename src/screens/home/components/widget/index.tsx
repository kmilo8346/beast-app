import React from 'react';

// local components
import StoreVerticalList from './components/store-vertical-list';
import StoreHorizontalList from './components/store-horizontal-list';
// libs
import { capture } from '../../../../lib/sentry';
// types
import {
  RenderedWidget,
  StoreHorizontalListRenderedWidget,
  StoreVerticalListRenderedWidget,
  WidgetType,
} from '../../../../types';

// instances outside component
const prefix = '[widget component]';

interface ComponentProps {
  navigation: any;
  widget: RenderedWidget;
}

export default ({ navigation, widget }: ComponentProps) => {
  // render logic
  switch (widget.type) {
    case WidgetType.STORE_HORIZONTAL_LIST:
      return (
        <StoreHorizontalList
          navigation={navigation}
          title={(widget as StoreHorizontalListRenderedWidget).data.title}
          response={(widget as StoreHorizontalListRenderedWidget).data.response}
        />
      );
    case WidgetType.STORE_VERTICAL_LIST:
      return (
        <StoreVerticalList
          navigation={navigation}
          response={(widget as StoreVerticalListRenderedWidget).data.response}
        />
      );
    default:
      capture(prefix, `Widget not mapped, type: ${widget.type}`);
      return null;
  }
};
