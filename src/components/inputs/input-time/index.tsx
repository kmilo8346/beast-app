import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

// components
import Input from '../input';
// libs
import stringFormatter from '../../../lib/formatters/string-formatter';

type State = {
  form: {
    value: string;
    placeHolder: string;
    minTime: string;
  };
};

export interface InputTimeProps {
  value: string;
  placeHolder: string;
  minTime: string;
  onChange?: (value: string) => void;
}
export default ({
  value,
  placeHolder = '09:00',
  minTime = '10:00',
  onChange = () => null,
}: InputTimeProps) => {
  // state
  const [defaultDate, setDefaultDate] = useState(new Date());
  const [state, setState] = useState({
    value,
    placeHolder,
    minTime,
  });
  const [showPicker, setShowPicker] = useState(false);

  // event handlers
  const changeHandler = (date: Date | undefined) => {
    const rawDate = date || new Date();
    const value = `${rawDate.getHours()}:${rawDate.getMinutes()}`;
    onChange(value);
  };

  // crear defaultDate con el minTime

  return (
    <>
      <Input
        placeholder={placeHolder}
        format={(text) => stringFormatter.toHours(text)}
        value={state.value}
        onFocus={() => setShowPicker(true)}
        onBlur={() => setShowPicker(false)}
      />
      {showPicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={defaultDate}
          mode="time"
          display="default"
          onChange={(e, date) => changeHandler(date)}
        />
      )}
    </>
  );
};
