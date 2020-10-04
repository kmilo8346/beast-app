import React, { useReducer } from 'react';
import {
  View,
  ScrollView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Vibration,
  Platform,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// components
import Modal, { ModalProps } from '../modal';
import Button from '../../buttons/button';
import Text from '../../text';
import Touchable from '../../touchable';
import Switch from '../../switch';
// types
import { OpeningHours } from '../../../types';
// libs
import validate from '../../../lib/validate';
// constraints
import constraints from './constraints';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

// instances outside component
const prefix = '[modal set opening hours]';
const defaultOpen = 900;
const defaultClose = 1730;
const defaultOpeningHours: OpeningHours = [
  {
    day: '1',
    open: defaultOpen,
    close: defaultClose,
  },
  {
    day: '2',
    open: defaultOpen,
    close: defaultClose,
  },
  {
    day: '3',
    open: defaultOpen,
    close: defaultClose,
  },
  {
    day: '4',
    open: defaultOpen,
    close: defaultClose,
  },
  {
    day: '5',
    open: defaultOpen,
    close: defaultClose,
  },
  {
    day: '6',
    open: defaultOpen,
    close: defaultClose,
  },
  {
    day: '7',
    open: defaultOpen,
    close: defaultClose,
  },
];
const toIntegerTime = (date: Date): number => {
  const czDate = new Date(date);
  const minutes = (czDate.getMinutes() < 10 ? '0' : '') + czDate.getMinutes();
  return parseInt(`${czDate.getHours()}${minutes}`, 10);
};
const fromIntegerTime = (time: number): Date => {
  let sTime = `${time}`;
  if (sTime.length < 1 || sTime.length > 4) {
    throw new Error(`${prefix} Invalid integer time`);
  }
  sTime = sTime.padStart(4, '0');

  const date = new Date();
  date.setHours(parseInt(sTime.substring(0, 2), 10));
  date.setMinutes(parseInt(sTime.substring(2, 4), 10));
  return date;
};
const formatIntegerTime = (time: number): string => {
  let sTime = `${time}`;
  if (sTime.length < 1 || sTime.length > 4) {
    throw new Error(`${prefix} Invalid integer time`);
  }
  sTime = sTime.padStart(4, '0');
  return `${sTime.substring(0, 2)}:${sTime.substring(2, 4)} hrs.`;
};
const formatDay = (day: string): string => {
  switch (day) {
    case '1':
      return 'Lunes';
    case '2':
      return 'Martes';
    case '3':
      return 'Miércoles';
    case '4':
      return 'Jueves';
    case '5':
      return 'Viernes';
    case '6':
      return 'Sábado';
    case '7':
      return 'Domingo';
    default:
      throw new Error(`${prefix} Invalid day ${day}`);
  }
};
const businessWork = (hours: { open: number; close: number }) => {
  return !(hours.open === 0 && hours.close === 0);
};
type Moment = 'open' | 'close';
type PickerInfo = { day: string; moment: Moment } | null;
type SetPickerInfoAction = {
  type: 'set_picker_info';
  pickerInfo: PickerInfo;
};
type ChangeTimeAction = {
  type: 'change_time';
  day: string;
  moment: Moment;
  time: Date;
};
type HidePickerAction = {
  type: 'hide_picker';
};
type ValidateAction = {
  type: 'validate';
};
type ToogleAction = {
  type: 'toogle_switch';
  checked: boolean;
  day: string;
};
type SetFormErrorsAction = {
  type: 'set_form_errors';
  errors: { [key: string]: string[] };
};
type Action =
  | SetPickerInfoAction
  | ChangeTimeAction
  | HidePickerAction
  | ValidateAction
  | ToogleAction
  | SetFormErrorsAction;
type State = {
  form: {
    // fields
    openingHours: OpeningHours;
    // other states
    errors?: { [key: string]: string[] };
  };
  pickerInfo: PickerInfo;
};

const reducer = (state: State, action: Action): State => {
  let info;
  switch (action.type) {
    case 'set_picker_info':
      info = action.pickerInfo;
      // hide if touch again
      if (
        state.pickerInfo &&
        action.pickerInfo &&
        state.pickerInfo.day === action.pickerInfo.day &&
        state.pickerInfo.moment === action.pickerInfo.moment
      ) {
        info = null;
      }
      return {
        ...state,
        pickerInfo: info,
      };
    case 'change_time':
      return {
        ...state,
        form: {
          ...state.form,
          openingHours: state.form.openingHours.map((dayHours) => {
            if (dayHours.day === action.day) {
              const newDayHours = { ...dayHours };
              if (action.moment === 'open') {
                newDayHours.open = toIntegerTime(action.time);
              } else {
                newDayHours.close = toIntegerTime(action.time);
              }
              return newDayHours;
            }
            return dayHours;
          }),
        },
        pickerInfo: Platform.OS === 'android' ? null : state.pickerInfo,
      };
    case 'hide_picker':
      return {
        ...state,
        pickerInfo: null,
      };
    case 'validate':
      return {
        ...state,
        form: {
          ...state.form,
          errors: validate(state.form, constraints),
        },
      };
    case 'toogle_switch':
      return {
        ...state,
        form: {
          ...state.form,
          openingHours: state.form.openingHours.map((dayHours) => {
            if (dayHours.day === action.day) {
              const newDayHours = { ...dayHours };
              // set default values
              if (action.checked) {
                newDayHours.open = defaultOpen;
                newDayHours.close = defaultClose;
              } else {
                newDayHours.open = 0;
                newDayHours.close = 0;
              }
              return newDayHours;
            }
            return dayHours;
          }),
        },
      };
    case 'set_form_errors':
      return { ...state, form: { ...state.form, errors: action.errors } };
    default:
      return state;
  }
};

export interface ModalManageOpeningHoursProps extends ModalProps {
  openingHours?: OpeningHours;
  onSave?: (openingHours: OpeningHours) => void;
}

/**
 * @site https://github.com/react-native-community/react-native-modal/issues/109#issuecomment-425106461
 */
export default ({
  openingHours,
  onSave = () => null,
  ...otherProps
}: ModalManageOpeningHoursProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    form: {
      // fields
      openingHours: openingHours || defaultOpeningHours,
    },
    pickerInfo: null,
  });
  const insets = useSafeAreaInsets();

  // event handlers
  const changeTimeHandler = (day: string, moment: Moment, date: Date) => {
    dispatch({ type: 'change_time', day, moment, time: date });
    dispatch({ type: 'validate' });
  };
  const changeSwitch = (checked: boolean, day: string) => {
    dispatch({
      type: 'toogle_switch',
      checked,
      day,
    });
    dispatch({ type: 'validate' });
  };
  const saveHandler = () => {
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      return;
    }
    // // save data
    onSave(state.form.openingHours);
  };

  // render logic
  const error = state.form.errors ? state.form.errors.openingHours[0] : '';

  return (
    <Modal {...otherProps} title="Horario de atención">
      <ScrollView
        style={[
          globalStyles.withPadding,
          { height: Dimensions.get('window').height * 0.65 },
        ]}
      >
        <View style={globalStyles.modalSubtitleSpace} />
        <TouchableOpacity>
          <TouchableWithoutFeedback>
            <View>
              {state.form.openingHours.map((dayHours, index) => {
                let picker = null;
                let openActive = false;
                let closeActive = false;
                let inputs = null;
                const isBusinessWork = businessWork(dayHours);
                if (state.pickerInfo && state.pickerInfo.day === dayHours.day) {
                  let date: Date | null = null;
                  if (state.pickerInfo.moment === 'open') {
                    openActive = true;
                    date = fromIntegerTime(dayHours.open);
                  } else {
                    closeActive = true;
                    date = fromIntegerTime(dayHours.close);
                  }
                  if (isBusinessWork) {
                    picker = (
                      <DateTimePicker
                        value={date}
                        mode="time"
                        display="clock"
                        is24Hour={false}
                        onChange={(event, selectedDate) => {
                          if (
                            Platform.OS === 'android' &&
                            event.type === 'dismissed'
                          ) {
                            dispatch({ type: 'hide_picker' });
                            return;
                          }

                          if (selectedDate && state.pickerInfo) {
                            changeTimeHandler(
                              state.pickerInfo.day,
                              state.pickerInfo.moment,
                              selectedDate
                            );
                          }
                        }}
                      />
                    );
                  }
                }
                if (isBusinessWork) {
                  inputs = (
                    <View style={{ flexDirection: 'row' }}>
                      <Touchable
                        style={{ flex: 1 }}
                        onPress={() => {
                          dispatch({
                            type: 'set_picker_info',
                            pickerInfo: {
                              day: dayHours.day,
                              moment: 'open',
                            },
                          });
                        }}
                      >
                        <View
                          style={{
                            height: 30,
                            borderBottomWidth: 1,
                            borderBottomColor: openActive
                              ? colors.blue
                              : colors.blackLight6,
                          }}
                        >
                          <Text
                            level={5}
                            style={{
                              color: openActive ? colors.blue : colors.black,
                            }}
                          >
                            {formatIntegerTime(dayHours.open)}
                          </Text>
                        </View>
                      </Touchable>
                      <View style={{ width: 20 }} />
                      <Touchable
                        style={{ flex: 1 }}
                        onPress={() => {
                          dispatch({
                            type: 'set_picker_info',
                            pickerInfo: {
                              day: dayHours.day,
                              moment: 'close',
                            },
                          });
                        }}
                      >
                        <View
                          style={{
                            height: 30,
                            borderBottomWidth: 1,
                            borderBottomColor: closeActive
                              ? colors.blue
                              : colors.blackLight6,
                          }}
                        >
                          <Text
                            level={5}
                            style={{
                              color: closeActive ? colors.blue : colors.black,
                            }}
                          >
                            {formatIntegerTime(dayHours.close)}
                          </Text>
                        </View>
                      </Touchable>
                    </View>
                  );
                }
                return (
                  <View key={`${index}`} style={{ marginBottom: 20 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text level={5} weight="bold">
                        {formatDay(dayHours.day)}
                      </Text>
                      <Switch
                        value={businessWork(dayHours)}
                        onValueChange={(checked) => {
                          changeSwitch(checked, dayHours.day);
                        }}
                      />
                    </View>
                    {inputs}
                    {picker}
                  </View>
                );
              })}
              <View style={globalStyles.withScreenAir} />
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </ScrollView>

      <View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.white,
            marginBottom: insets.bottom,
          },
          globalStyles.withMargin,
        ]}
      >
        {!!error && (
          <Text
            level={7}
            color={colors.red}
            style={{ marginTop: 10, textAlign: 'center' }}
          >
            {error}
          </Text>
        )}
        <Button
          title="Guardar"
          onPress={saveHandler}
          style={[globalStyles.withMainActionAir, { marginTop: 10 }]}
        />
      </View>
    </Modal>
  );
};
