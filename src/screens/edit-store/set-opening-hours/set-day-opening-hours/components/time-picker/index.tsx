import React, { useState } from 'react';
import {
  Platform,
  Modal,
  TouchableWithoutFeedback,
  GestureResponderEvent,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { Event } from '@react-native-community/datetimepicker';

// components
import Text from '../../../../../../components/text';
import Divider from '../../../../../../components/divider';
import Button from '../../../../../../components/buttons/button';
// styles
import globalStyles from '../../../../../../styles';
import colors from '../../../../../../styles/colors';

interface ComponentProps {
  value: Date;
  onChange: (value: Date) => void;
  onDismiss: () => void;
}

export default ({ value, onChange, onDismiss }: ComponentProps) => {
  const [visible, setVisible] = useState(true);
  const [date, setDate] = useState(value);

  // event handlers
  const androidChangeHandler = (event: Event, date?: Date | undefined) => {
    setVisible(false);
    if (event.type === 'dismissed') {
      onDismiss();
      return;
    }

    if (date) {
      onChange(date);
    }
  };

  const iosChangeHandler = (event: Event, date?: Date | undefined) => {
    if (date) {
      setDate(date);
    }
  };

  const requestCloseHandler = () => {
    setVisible(false);
    onDismiss();
  };

  const pressBackDropHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    setVisible(false);
    onDismiss();
  };

  const pressCancelHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    setVisible(false);
    onDismiss();
  };

  const pressOkHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    setVisible(false);
    onChange(date);
  };

  // render logic
  if (!visible) {
    return null;
  }

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        mode="time"
        display="spinner"
        value={value}
        is24Hour={false}
        onChange={androidChangeHandler}
      />
    );
  }

  return (
    <Modal
      animationType="slide"
      transparent
      visible
      onRequestClose={requestCloseHandler}
    >
      <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback
          style={{
            flex: 1,
          }}
          onPress={pressBackDropHandler}
        >
          <SafeAreaView
            style={{
              backgroundColor: colors.modalBackdrop,
              flex: 1,
              justifyContent: 'flex-end',
            }}
          >
            <View style={globalStyles.withMargin}>
              <View
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              >
                <DateTimePicker
                  mode="time"
                  display="spinner"
                  value={date}
                  onChange={iosChangeHandler}
                />
                <Divider />
                <Button
                  type="secondary"
                  title={
                    <Text
                      level={5}
                      weight="bold"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      Listo
                    </Text>
                  }
                  style={{ borderWidth: 0 }}
                  onPress={pressOkHandler}
                />
              </View>
              <Button
                type="secondary"
                title="Cancelar"
                style={{ borderWidth: 0 }}
                onPress={pressCancelHandler}
              />
            </View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};
