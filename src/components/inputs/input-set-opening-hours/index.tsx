import React, { useState, useCallback } from 'react';
import { View } from 'react-native';

// components
import InputSelect from '../input-select';
import ModalSetOpeningHours from '../../modals/modal-set-openning-hours';
// types
import { OpeningHours } from '../../../types';

export interface InputSetOpeningHoursProps {
  value?: OpeningHours;
  errors?: string[];
  onChange?: (openingHours: OpeningHours) => void;
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
  const saveHandler = (openingHours: OpeningHours) => {
    onChange(openingHours);
    setIsVisible((prevIsVisible) => !prevIsVisible);
  };

  // render logic
  let openingHoursText = '';
  if (value) {
    openingHoursText = `Horario de atención configurado`;
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
          openingHours={value}
          onSave={saveHandler}
          onRequestClose={requestCloseHandler}
        />
      )}
    </View>
  );
};
