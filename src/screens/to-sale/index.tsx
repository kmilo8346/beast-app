import React from 'react';

import { ScreenView, Text } from '../../components';

export default () => {
  return (
    <ScreenView safeArea withMargin withFakeHeader>
      <Text weight="bold">Vender</Text>
    </ScreenView>
  );
};
