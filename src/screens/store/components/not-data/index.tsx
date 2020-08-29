import React from 'react';
import { View } from 'react-native';

// component
import Text from '../../../../components/text';
import PhoneWithProductsViewImage from '../../../../components/svgs/images/phone-with-products-view';
import HeartBlue from '../../../../components/svgs/icons/heart-blue';

export default () => {
  // render logic
  return (
    <View style={{ alignItems: 'center' }}>
      <PhoneWithProductsViewImage />
      <Text level={1} weight="bold" style={{ marginTop: 15, marginBottom: 3 }}>
        Muy pronto
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <Text level={5}>Agregaremos productos.</Text>
        <HeartBlue />
      </View>
    </View>
  );
};
