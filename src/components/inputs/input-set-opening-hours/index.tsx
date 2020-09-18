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

// instances outside component
const humanizeOpeningHoursText = (schedule: OpeningHours) => {
  let humanizedText = '';
  const daysShortNames: string[] = [
    'Lun',
    'Mar',
    'Mie',
    'Jue',
    'Vie',
    'Sab',
    'Dom',
  ];
  const openDays: string[] = [];
  schedule.forEach((day) => {
    if (day.open) {
      openDays.push(daysShortNames[Number(day.day) - 1]);
      humanizedText =
        humanizedText === ''
          ? daysShortNames[Number(day.day) - 1]
          : `${humanizedText}. ${daysShortNames[Number(day.day) - 1]}`;
    }
  });
  if (
    openDays[0] === 'Lun' &&
    openDays[1] &&
    openDays[2] &&
    openDays[3] &&
    openDays[4] === 'Vie' &&
    !openDays[5] &&
    !openDays[6]
  ) {
    humanizedText = 'Entre semana';
  }
  if (openDays.length === 7) {
    humanizedText = 'Todos los días';
  }
  humanizedText += '.';
  return humanizedText;
};

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
    openingHoursText = humanizeOpeningHoursText(value);
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
