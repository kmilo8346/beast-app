import React, { useState, useCallback } from 'react';
import { View } from 'react-native';

// components
import InputSelect from '../input-select';
import ModalSetDeliveryArea from '../../modals/modal-set-delivery-area';
// types
import { DeliveryArea } from '../../../types';

export interface InputSetDeliveryAreaProps {
  value?: DeliveryArea;
  errors?: string[];
  onChange?: (deliveryArea: DeliveryArea) => void;
}

export default ({
  value,
  errors,
  onChange = () => null,
}: InputSetDeliveryAreaProps) => {
  // state
  const [isVisible, setIsVisible] = useState(false);

  // event handlers
  const inputPressHandler = useCallback(() => {
    setIsVisible(true);
  }, []);
  const requestCloseHandler = useCallback(() => {
    setIsVisible((prevIsVisible) => !prevIsVisible);
  }, []);
  const saveHandler = (deliveryArea: DeliveryArea) => {
    onChange(deliveryArea);
    setIsVisible((prevIsVisible) => !prevIsVisible);
  };

  // render logic
  let areaText = '';
  if (value) {
    areaText = `${value.center.route.shortName} ${value.center.streetNumber.shortName}, ${value.radius}`;
  }

  return (
    <View>
      <InputSelect
        label="Área de despacho"
        value={areaText}
        icon="map-pin"
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
