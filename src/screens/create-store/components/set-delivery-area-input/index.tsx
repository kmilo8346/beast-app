import React, { useState } from 'react';
import { View } from 'react-native';

// screen components
import FakeInput from '../../../components/fake-input';
// components
import ModalSetDeliveryArea from '../../../../components/modals/modal-set-delivery-area';
// types
import { DeliveryArea } from '../../../../types';
// lib
import * as utils from '../../../../lib/utils';

interface ComponentProps {
  value?: DeliveryArea;
  errors?: string[];
  onChange?: (deliveryArea: DeliveryArea) => void;
}

export default ({ value, errors, onChange = utils.noop }: ComponentProps) => {
  // state
  const [isVisible, setIsVisible] = useState(false);

  // event handlers
  const inputPressHandler = () => {
    setIsVisible(true);
  };

  const requestCloseHandler = () => {
    setIsVisible((prevIsVisible) => !prevIsVisible);
  };

  const saveHandler = (deliveryArea: DeliveryArea) => {
    onChange(deliveryArea);
    setIsVisible((prevIsVisible) => !prevIsVisible);
  };

  // render logic
  let areaText = '';
  if (value) {
    areaText = `${utils.formatPlace(value.center)} · ${value.radius}`;
  }
  let suffix = 'chevron-down';
  if (isVisible) {
    suffix = 'chevron-up';
  }

  return (
    <View>
      <FakeInput
        required={false}
        label="Área de despacho"
        placeholder="Agrega área de despacho"
        suffix={suffix}
        value={areaText}
        errors={errors}
        onPress={inputPressHandler}
      />
      {isVisible && (
        <ModalSetDeliveryArea
          deliveryArea={value}
          onSave={saveHandler}
          onRequestClose={requestCloseHandler}
        />
      )}
    </View>
  );
};
