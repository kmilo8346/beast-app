import React, { useState, useCallback } from 'react';
import { View } from 'react-native';

// components
import InputSelect from '../input-select';
import ModalSetOpeningHours from '../../modals/modal-set-openning-hours';
// types
import { OpenHours } from '../../../types';

export interface InputSetOpeningHoursProps {
  value?: OpenHours[];
  errors?: string[];
  onChange?: (openingHours: OpenHours[]) => void;
}

export default ({
  value,
  errors,
  onChange = () => null,
}: InputSetOpeningHoursProps) => {
  // state
  const [isVisible, setIsVisible] = useState(false);

  // event handlers
  const inputPressHandler = useCallback(() => {
    setIsVisible(true);
  }, []);
  const requestCloseHandler = useCallback(() => {
    setIsVisible((prevIsVisible) => !prevIsVisible);
  }, []);
  const saveHandler = (openingHours: OpenHours[]) => {
    // save data to userContainer
    console.log('Sending data from modal...', openingHours);
    // onChange(openingHours);
    setIsVisible((prevIsVisible) => !prevIsVisible);
  };

  // render logic
  let openingHoursText = '';
  if (value) {
    openingHoursText = `Toda la semana de 8:00 a 19:00`;
  }
  return (
    <View>
      <InputSelect
        label="Horario de atención"
        value={openingHoursText}
        icon="clock"
        errors={errors}
        onPress={inputPressHandler}
      />
      {isVisible && (
        <ModalSetOpeningHours
          deliveryTime={value}
          onSave={saveHandler}
          onRequestClose={requestCloseHandler}
        />
      )}
    </View>
  );
};
