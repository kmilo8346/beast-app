import React, { useState, useCallback } from 'react';
import { View } from 'react-native';

// components
import InputSelect from '../input-select';
import ModalManageDeliveryTime from '../../modals/modal-set-delivery-time';
// containers
import UserProvider from '../../../containers/user';
// types
import { IntegerRange, I } from '../../../types';
// formatters
import DurationFormatter from '../../../lib/formatters/duration-formatter';

export interface InputSetDeliveryTimeProps {
  value?: IntegerRange;
  errors?: string[];
  onChange?: (deliveryTime: IntegerRange) => void;
}

export default ({
  value,
  errors,
  onChange = () => null,
}: InputSetDeliveryTimeProps) => {
  // state
  const [isVisible, setIsVisible] = useState(false);

  // event handlers
  const inputPressHandler = useCallback(() => {
    setIsVisible(true);
  }, []);
  const requestCloseHandler = useCallback(() => {
    setIsVisible((prevIsVisible) => !prevIsVisible);
  }, []);
  const saveHandler = (deliveryTime: IntegerRange) => {
    onChange(deliveryTime);
    setIsVisible((prevIsVisible) => !prevIsVisible);
  };

  // render logic
  let deliveryTimeText = '';
  if (value) {
    deliveryTimeText = DurationFormatter.humanizeDurationRange(
      value.lte,
      value.gte
    );
  }
  return (
    <View>
      <InputSelect
        label="Tiempo de entrega"
        value={deliveryTimeText}
        icon="clock"
        errors={errors}
        onPress={inputPressHandler}
      />
      {isVisible && (
        <ModalManageDeliveryTime
          deliveryTime={value}
          onSave={saveHandler}
          onRequestClose={requestCloseHandler}
        />
      )}
    </View>
  );
};
