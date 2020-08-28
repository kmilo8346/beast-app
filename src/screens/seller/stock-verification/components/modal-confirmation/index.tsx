import React, { useState } from 'react';
import { View, Image, GestureResponderEvent } from 'react-native';

// components
import Modal, { ModalProps } from '../../../../../components/modals/modal';
import Button from '../../../../../components/buttons/button';
import Text from '../../../../../components/text';
import Touchable from '../../../../../components/touchable';
import Icon from '../../../../../components/icon';
// local components
import InputNumber, { InputNumberStatus } from '../input-number';
// libs
import * as utils from '../../../../../lib/utils';
import cloudinary from '../../../../../lib/cloudinary';
// types
import {
  ProductConfirmation,
  Item,
  ProductConfirmationType,
} from '../../../../../types';
// styles
import globalStyles from '../../../../../styles';
import colors from '../../../../../styles/colors';

// instances outside component
const prefix = '[modal confirmation component]';

export interface ModalConfirmationProps extends ModalProps {
  product: Item;
  confirmation?: ProductConfirmation;
  onSave?: (confirmation: ProductConfirmation) => void;
}

export default ({
  product,
  confirmation,
  onSave = utils.noop,
  ...otherProps
}: ModalConfirmationProps) => {
  // state
  const [state, setState] = useState<ProductConfirmation>(
    confirmation || {
      type: ProductConfirmationType.UPDATE,
      id: product.id,
      qty_posible: 0,
    }
  );
  // precondition
  if (state.type !== ProductConfirmationType.UPDATE) {
    throw new Error(
      `${prefix} Invalid product confirmation type, type ${state.type}`
    );
  }

  // event handlers
  const changeHandler = (qty: number) => {
    setState((prevState) => ({ ...prevState, qty_posible: qty }));
  };
  const pressIHaveAllHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    changeHandler(product.qty);
  };
  const saveHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onSave(state);
  };

  // render logic
  const image = product.images[0];
  let inputStatus: InputNumberStatus = 'error';
  if (state.qty_posible >= 1) {
    inputStatus = 'warning';
    if (state.qty_posible === product.qty) {
      inputStatus = 'success';
    }
  }
  return (
    <Modal {...otherProps}>
      <View style={globalStyles.withMargin}>
        <Image
          source={{ uri: cloudinary.dynamicUrl(image, 'w_200,h_200,c_scale') }}
          style={{
            alignSelf: 'center',
            width: 200,
            height: 200,
            borderRadius: 20,
            marginBottom: 15,
          }}
        />
        <Text
          level={4}
          weight="bold"
          style={{
            width: 200,
            alignSelf: 'center',
            marginBottom: 30,
            textAlign: 'center',
          }}
        >
          {product.name}
        </Text>

        <Text level={5} style={{ marginBottom: 15 }}>
          Agrega la cantidad que tienes disponible.
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <InputNumber
            value={state.qty_posible}
            min={0}
            max={product.qty}
            status={inputStatus}
            onChange={changeHandler}
          />
          <Touchable
            onPress={pressIHaveAllHandler}
            style={{
              backgroundColor: colors.blueLight4,
              borderRadius: 10,
              paddingHorizontal: 20,
              paddingVertical: 15,
            }}
          >
            <Text level={5} weight="bold" color={colors.blue}>
              Tengo todo
            </Text>
          </Touchable>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 25 }}>
          <Icon
            name="info"
            color={colors.red}
            size={20}
            style={{ marginRight: 10 }}
          />
          <Text level={7} style={{ lineHeight: 20, flex: 1 }}>
            El producto dejará de ser visible para los clientes si no tienes{' '}
            <Text level={7} weight="bold">
              stock
            </Text>{' '}
            suficiente.
          </Text>
        </View>

        <Button
          title="Confirmar producto"
          onPress={saveHandler}
          style={globalStyles.withMainActionAir}
        />
      </View>
    </Modal>
  );
};
