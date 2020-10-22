import React, { useState } from 'react';
import { View } from 'react-native';

// upsert store components
import FakeInput from '../fake-input';
// components
import ModalSetOpeningHours from '../../../../components/modals/modal-set-openning-hours';
// types
import { OpeningHours } from '../../../../types';
// lib
import * as utils from '../../../../lib/utils';

// instances outside component
const humanizeOpeningHoursText = (schedule: OpeningHours) => {
  let humanizedText = 'Tienda cerrada';
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
    if (day.open || day.close) {
      openDays.push(daysShortNames[Number(day.day) - 1]);
      humanizedText =
        humanizedText === 'Tienda cerrada'
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
  return humanizedText;
};

interface ComponentProps {
  value?: OpeningHours;
  errors?: string[];
  onChange?: (openingHours: OpeningHours) => void;
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

  const saveHandler = (openingHours: OpeningHours) => {
    onChange(openingHours);
    setIsVisible((prevIsVisible) => !prevIsVisible);
  };

  // render logic
  let openingHoursText = '';
  if (value) {
    openingHoursText = humanizeOpeningHoursText(value);
  }
  let suffix = 'chevron-down';
  if (isVisible) {
    suffix = 'chevron-up';
  }

  return (
    <View>
      <FakeInput
        required
        label="Horario de atención"
        placeholder="Agrega horario de atención"
        suffix={suffix}
        value={openingHoursText}
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
