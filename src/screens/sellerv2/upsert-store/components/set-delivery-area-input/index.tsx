import React, { useState } from 'react';
import { View } from 'react-native';

// upsert store components
import FakeInput from '../fake-input';
// components
import ModalSetDeliveryArea from '../../../../../components/modals/modal-set-delivery-area';
// types
import { DeliveryArea } from '../../../../../types';
// lib
import * as utils from '../../../../../lib/utils';

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
    areaText = `${value.center.route.short_name} ${value.center.street_number.short_name}, ${value.radius}`;
  }
  let suffix = 'chevron-down';
  if (isVisible) {
    suffix = 'chevron-up';
  }

  return (
    <View>
      <FakeInput
        required
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
