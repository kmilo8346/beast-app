import React from 'react';
import { View } from 'react-native';

// components
import Modal from '../../../../components/modals/modal';
// local components
import DayItem from './components/day-item';
// types
import globalStyles from '../../../../styles';
import { OpeningHours } from '../../../../types';

interface ComponentProps {
  value: OpeningHours;
  onClose: () => void;
}

export default ({ value, onClose }: ComponentProps) => {
  // event handlers
  const requestCloseHandler = () => {
    onClose();
  };
  // render logic
  const today = new Date().getDay();
  const reorderWeek = (week: OpeningHours) => {
    const firstDay: OpeningHours = [];
    const beforeDays: OpeningHours = [];
    const afterDays: OpeningHours = [];
    week.forEach((day) => {
      if (Number(day.day) - today === 0 || Number(day.day) - today === 7) {
        firstDay.push(day);
      } else if (Number(day.day) - today < 0) {
        beforeDays.push(day);
      } else {
        afterDays.push(day);
      }
    });
    return firstDay.concat(afterDays).concat(beforeDays);
  };
  return (
    <Modal onRequestClose={requestCloseHandler} title="Horario de atención">
      <View style={globalStyles.modalSubtitleSpace} />
      <View style={{ marginHorizontal: 30 }}>
        {reorderWeek(value).map((day) => (
          <DayItem {...day} relevantDay={today} key={day.day} />
        ))}
      </View>
    </Modal>
  );
};
