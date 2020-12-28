import React, { useState } from 'react';
import { View } from 'react-native';
import { Place } from '../../../types';

// local components
import AddressInputModal from './components/address-input-modal';
// screen components
import FakeInput from '../fake-input';
// lib
import * as utils from '../../../lib/utils';

interface ComponentProps {
  label: string;
  placeholder: string;
  value?: Place;
  errors?: string[];
  onChange: (value: Place) => void;
}

export default ({
  label,
  placeholder,
  value,
  errors,
  onChange,
}: ComponentProps) => {
  // state
  const [isVisible, setIsVisible] = useState(false);

  const inputPressHandler = () => {
    setIsVisible(true);
  };

  const changeHandler = (value: Place) => {
    setIsVisible(false);
    onChange(value);
  };

  const closeHandler = () => {
    setIsVisible(false);
  };

  // render logic
  let suffix = 'chevron-down';
  if (isVisible) {
    suffix = 'chevron-up';
  }
  let formattedAddress = '';
  if (value) {
    formattedAddress = utils.formatPlace(value);
  }
  return (
    <View>
      <FakeInput
        required={false}
        label={label}
        placeholder={placeholder}
        suffix={suffix}
        value={formattedAddress}
        errors={errors}
        onPress={inputPressHandler}
      />
      {isVisible && (
        <AddressInputModal onChange={changeHandler} onClose={closeHandler} />
      )}
    </View>
  );
};
