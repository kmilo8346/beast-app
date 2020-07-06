import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

export interface DateTimePicker {
  mode?: 'date' | 'time' | 'countdown';
  onSelect: (date: Date) => void;
}

export default ({ mode = 'date', onSelect }: DateTimePicker) => {
  const [date, setDate] = useState(new Date(1598051730000));

  const onChangeHandler = (event: Event, selectedDate: Date): void => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    onSelect(currentDate);
  };

  return (
    <DateTimePicker
      testID="dateTimePicker"
      value={date}
      mode={mode}
      display="default"
      onChange={onChangeHandler}
    />
  );
};
