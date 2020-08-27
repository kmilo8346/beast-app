import React, { ReactNode, memo, useState } from 'react';
import { Image, View } from 'react-native';

// components
import Touchable from '../../../../../components/touchable';
import Text from '../../../../../components/text';
import Icon from '../../../../../components/icon';
import Badge from '../../../../../components/badge';
import ButtonIcon from '../../../../../components/buttons/button-icon';
// local components
import ModalConfirmation from '../modal-confirmation';
// types
import {
  Item,
  ProductConfirmation,
  ProductConfirmationType,
} from '../../../../../types';
// libs
import * as utils from '../../../../../lib/utils';
import colors from '../../../../../styles/colors';

const checkSuccessImage = require('../../../../../../assets/icons/check_success.png');
const checkWarningImage = require('../../../../../../assets/icons/check_warning.png');
const checkErrorImage = require('../../../../../../assets/icons/check_error.png');

export interface ItemProps {
  product: Item;
  productConfirmation?: ProductConfirmation;
  editting: boolean;
  onChangeProductConfirmation?: (
    productConfirmation: ProductConfirmation
  ) => void;
  onRevertProductConfirmation?: (
    productConfirmation: ProductConfirmation
  ) => void;
}

export default memo(
  ({
    product,
    productConfirmation,
    editting = false,
    onChangeProductConfirmation = utils.noop,
    onRevertProductConfirmation = utils.noop,
  }: ItemProps) => {
    // state
    const [isVisible, setIsVisible] = useState(false);
    // event handlers
    const pressItem = () => {
      if (productConfirmation?.type !== ProductConfirmationType.DELETE) {
        setIsVisible(true);
      }
    };
    const requestCloseHandler = () => {
      setIsVisible(false);
    };
    const pressDeleteHandler = () => {
      onChangeProductConfirmation({
        type: ProductConfirmationType.DELETE,
        id: product.id,
      });
    };
    const pressUndoHandler = () => {
      onRevertProductConfirmation(productConfirmation as ProductConfirmation);
    };
    const saveHandler = (productConfirmation: ProductConfirmation) => {
      setIsVisible(false);
      onChangeProductConfirmation(productConfirmation);
    };

    // render logic
    let editAction: ReactNode | null = null;
    if (editting) {
      editAction = (
        <ButtonIcon
          icon="x-circle"
          iconStyle={{ color: colors.red }}
          onPress={pressDeleteHandler}
        />
      );
      if (
        productConfirmation &&
        productConfirmation.type === ProductConfirmationType.DELETE
      ) {
        editAction = (
          <ButtonIcon
            icon="undo"
            iconStyle={{ color: colors.green }}
            onPress={pressUndoHandler}
          />
        );
      }
    }
    const image = product.images[0];
    let label: ReactNode | null = null;
    if (productConfirmation) {
      let text = 'Eliminado';
      let containerColor = colors.blackLight5;
      let textColor = colors.black;
      if (productConfirmation.type === ProductConfirmationType.UPDATE) {
        text = 'Sin stock';
        containerColor = colors.redLight3;
        textColor = colors.redLight2;
        if (productConfirmation.qty_posible === product.qty) {
          text = ``;
        } else if (productConfirmation.qty_posible >= 1) {
          text = `Se entregará ${productConfirmation.qty_posible} de ${product.qty}`;
          containerColor = colors.yellowLight2;
          textColor = colors.yellow;
        }
      }
      if (text) {
        label = (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 5,
              backgroundColor: containerColor,
              alignSelf: 'flex-start',
              marginTop: 7,
            }}
          >
            <Text level={6} color={textColor}>
              {text}
            </Text>
          </View>
        );
      }
    }
    let rightPart: ReactNode | null = (
      <Icon name="chevron-right" style={{ marginLeft: 10 }} />
    );
    if (productConfirmation) {
      rightPart = null;
      if (productConfirmation.type === ProductConfirmationType.UPDATE) {
        if (productConfirmation.qty_posible === 0) {
          rightPart = <Image source={checkErrorImage} />;
        } else if (productConfirmation.qty_posible < product.qty) {
          rightPart = <Image source={checkWarningImage} />;
        } else {
          rightPart = <Image source={checkSuccessImage} />;
        }
      }
    }

    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={{ marginRight: 5, marginTop: 8 }}>{editAction}</View>
        <Touchable
          onPress={pressItem}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 15,
            flex: 1,
          }}
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

          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Text level={6} numberOfLines={2} ellipsizeMode="tail">
              {product.name}
            </Text>
            {label}
          </View>

          {rightPart}

          {isVisible && (
            <ModalConfirmation
              product={product}
              confirmation={productConfirmation}
              onSave={saveHandler}
              onRequestClose={requestCloseHandler}
            />
          )}
        </Touchable>
      </View>
    );
  }
);
