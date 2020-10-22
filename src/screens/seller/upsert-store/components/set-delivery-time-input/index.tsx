import React, { useState } from 'react';
import { View } from 'react-native';

// upsert store components
import FakeInput from '../fake-input';
// components
import ModalManageDeliveryTime from '../../../../../components/modals/modal-set-delivery-time';
// types
import { IntegerRange } from '../../../../../types';
// lib
import * as utils from '../../../../../lib/utils';
import DurationFormatter from '../../../../../lib/formatters/duration-formatter';

interface ComponentProps {
  value?: IntegerRange;
  errors?: string[];
  onChange?: (deliveryTime: IntegerRange) => void;
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

  const saveHandler = (deliveryTime: IntegerRange) => {
    onChange(deliveryTime);
    setIsVisible((prevIsVisible) => !prevIsVisible);
  };

  // render logic
  let deliveryTimeText = '';
  if (value) {
    deliveryTimeText = DurationFormatter.humanizeDurationRange(
      value.gte,
      value.lte
    );
  }
  let suffix = 'chevron-down';
  if (isVisible) {
    suffix = 'chevron-up';
  }

  return (
    <View>
      <FakeInput
        required
        label="Tiempo de entrega"
        placeholder="Agrega tiempo de entrega"
        suffix={suffix}
        value={deliveryTimeText}
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
