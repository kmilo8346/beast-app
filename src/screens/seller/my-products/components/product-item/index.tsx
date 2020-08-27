import React, { useState, memo, useEffect } from 'react';
import { Image, View, GestureResponderEvent } from 'react-native';

// components
import Touchable from '../../../../../components/touchable';
import Text from '../../../../../components/text';
import Switch from '../../../../../components/switch';
import ButtonIcon from '../../../../../components/buttons/button-icon';
import Icon from '../../../../../components/icon';
// types
import { Product, Service } from '../../../../../types';
// libs
import numberFormatter from '../../../../../lib/formatters/number-formatter';
// styles
import colors from '../../../../../styles/colors';

export interface ProductItemProps {
  data: Product | Service;
  editting: boolean;
  onChangeEnabled?: (id: string, enabled: boolean) => void;
  onPressEdit?: (product: Product) => void;
  onPressDelete?: (product: Product) => void;
}

export default memo(
  ({
    data,
    editting = false,
    onChangeEnabled = () => null,
    onPressEdit = () => null,
    onPressDelete = () => null,
  }: ProductItemProps) => {
    // state
    const [product, setProduct] = useState(data);
    // event handlers
    const pressItemHandler = (event: GestureResponderEvent) => {
      event.stopPropagation();
      if (editting) {
        onPressEdit(product);
      }
    };
    const enabledChangeHandler = (enabled: boolean) => {
      setProduct((prevProduct) => ({ ...prevProduct, enabled }));
      // call external handler
      onChangeEnabled(product.id, enabled);
    };
    const pressDeleteHandler = (e: GestureResponderEvent) => {
      e.stopPropagation();
      // call external handler
      onPressDelete(product);
    };
    useEffect(() => {
      setProduct(data);
    }, [data]);
    // render logic
    const image = product.images[0];
    let deleteComponent = null;
    let priceText = 'Precio a convenir';
    let rightPartContent = (
      <Switch value={product.enabled} onValueChange={enabledChangeHandler} />
    );
    if (editting) {
      deleteComponent = (
        <ButtonIcon
          icon="x-circle"
          iconStyle={{ color: colors.red }}
          onPress={pressDeleteHandler}
        />
      );
      rightPartContent = <Icon name="chevron-right" />;
    }
    if (product.price) {
      priceText = numberFormatter.toCurrency(product.price);
    }
    return (
      <View style={{ flexDirection: 'row', marginBottom: 15 }}>
        <View style={{ justifyContent: 'center', marginRight: 5 }}>
          {deleteComponent}
        </View>

        <Touchable
          style={{ flexDirection: 'row', flex: 1 }}
          onPress={pressItemHandler}
        >
          <Image
            source={{ uri: image }}
            style={{ width: 55, height: 55, borderRadius: 10 }}
          />
          <View
            style={{ flex: 1, marginHorizontal: 10, justifyContent: 'center' }}
          >
            <Text level={5} weight="bold">
              {product.name}
            </Text>
            <Text level={6} color={colors.blackLight5}>
              {priceText}
            </Text>
          </View>
          <View style={{ justifyContent: 'center' }}>{rightPartContent}</View>
        </Touchable>
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.data.id === nextProps.data.id &&
      prevProps.data.name === nextProps.data.name &&
      prevProps.data.price === nextProps.data.price &&
      prevProps.editting === nextProps.editting
    );
  }
);
