import React from 'react';

import { ScreenView, Text } from '../../components';

export default () => {
  return (
    <ScreenView safeArea withMargin fakeHeader>
      <Text weight="bold">Vender</Text>
    </ScreenView>
  );
};
