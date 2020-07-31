import React, { ReactNode, memo, useState } from 'react';
import { Image, View } from 'react-native';

// components
import { Touchable, Text, Icon, Badge } from '../../../../../components';
// local components
import ModalConfirmation from '../modal-confirmation';
// types
import { Item, ProductConfirmation } from '../../../../../types';
// libs
import * as utils from '../../../../../lib/utils';

const checkSuccessImage = require('../../../../../../assets/icons/check_success.png');
const checkWarningImage = require('../../../../../../assets/icons/check_warning.png');
const checkErrorImage = require('../../../../../../assets/icons/check_error.png');

export interface ItemProps {
  product: Item;
  confirmation?: ProductConfirmation;
  editting: boolean;
  onChangeConfirmation?: (confirmation: ProductConfirmation) => void;
}

export default memo(
  ({
    product,
    confirmation,
    editting = false,
    onChangeConfirmation = utils.noop,
  }: ItemProps) => {
    // state
    const [isVisible, setIsVisible] = useState(false);
    // event handlers
    const pressItem = () => {
      if (editting) {
        setIsVisible(true);
      }
    };
    const requestCloseHandler = () => {
      setIsVisible(false);
    };
    const saveHandler = (confirmation: ProductConfirmation) => {
      setIsVisible(false);
      onChangeConfirmation(confirmation);
    };

    // render logic
    const image = product.images[0];
    let check: ReactNode | null = null;
    if (confirmation?.status === 'full_stock') {
      check = <Image source={checkSuccessImage} />;
    } else if (confirmation?.status === 'partial_stock') {
      check = <Image source={checkWarningImage} />;
    } else if (confirmation?.status === 'out_of_stock') {
      check = <Image source={checkErrorImage} />;
    }
    let chrevronRight: ReactNode | null = null;
    if (editting) {
      chrevronRight = <Icon name="chevron-right" style={{ marginLeft: 10 }} />;
    }

    return (
      <Touchable
        onPress={pressItem}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}
      >
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: image }}
            style={{ width: 55, height: 55, borderRadius: 10 }}
          />
          <Badge
            count={product.qty}
            style={{ position: 'absolute', top: -5, left: -5 }}
          />
        </View>
        <Text
          level={6}
          numberOfLines={2}
          ellipsizeMode="tail"
          style={{ flex: 1, marginHorizontal: 10 }}
        >
          {product.name}
        </Text>
        {check}
        {chrevronRight}
        {isVisible && (
          <ModalConfirmation
            product={product}
            confirmation={confirmation}
            onSave={saveHandler}
            onRequestClose={requestCloseHandler}
          />
        )}
      </Touchable>
    );
  }
);
