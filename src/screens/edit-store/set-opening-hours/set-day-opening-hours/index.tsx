import React, { useEffect, useLayoutEffect, useReducer } from 'react';
import { GestureResponderEvent, ScrollView, View } from 'react-native';

// constants
import { defaultOpen, defaultClose } from '../../../constants';
// local components
import TimePicker from './components/time-picker';
// components
import Text from '../../../../components/text';
import Divider from '../../../../components/divider';
import Touchable from '../../../../components/touchable';
// lib
import { eventEmitter } from '../../../../lib/event-emitter';
// types
import { DayOpeningHours } from '../../../../types';
// styles
import globalStyles from '../../../../styles';
import colors from '../../../../styles/colors';
import stringFormatter from '../../../../lib/formatters/string-formatter';
import numberFormatter from '../../../../lib/formatters/number-formatter';

// instances outside component
const prefix = '[edit store set day opening hours screen]';
const getOpenAndClose = (
  hours: { open: number; close: number }[]
): { open: number; close: number } => {
  if (!hours.length) {
    return {
      open: 0,
      close: 0,
    };
  }
  return hours.reduce(
    (calculated, hours) => {
      const result = { ...calculated };
      if (hours.open < result.open) {
        result.open = hours.open;
      }
      if (hours.close > result.close) {
        result.close = hours.close;
      }
      return result;
    },
    {
      open: 2359,
      close: 0,
    }
  );
};
const toTime = (date: Date): number => {
  const czDate = new Date(date);
  const minutes = (czDate.getMinutes() < 10 ? '0' : '') + czDate.getMinutes();
  return parseInt(`${czDate.getHours()}${minutes}`, 10);
};
const toDate = (time: number): Date => {
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

type BusinessAction = 'open' | 'close';
type AddHoursAction = {
  type: 'add_hours';
};
type DeleteHoursAction = {
  type: 'delete_hours';
  position: number;
};
type UpdateHoursAction = {
  type: 'update_hours';
  position: number;
  action: BusinessAction;
  time: number;
};
type SetExpandedAction = {
  type: 'set_expanded';
  expanded: { position: number; action: BusinessAction } | null;
};
type SetDateAction = {
  type: 'set_date';
  date: Date;
};
type Action =
  | AddHoursAction
  | DeleteHoursAction
  | UpdateHoursAction
  | SetExpandedAction
  | SetDateAction;
type State = {
  day_opening_hours: DayOpeningHours;
  expanded: { position: number; action: BusinessAction } | null;
  date: Date;
};
const reducer = (state: State, action: Action): State => {
  let newHours: { open: number; close: number }[];
  switch (action.type) {
    case 'add_hours':
      newHours = [
        ...(state.day_opening_hours.hours || []),
        { open: defaultOpen, close: defaultClose },
      ];
      return {
        ...state,
        day_opening_hours: {
          ...state.day_opening_hours,
          ...getOpenAndClose(newHours),
          hours: newHours,
        },
      };
    case 'delete_hours':
      newHours = (state.day_opening_hours.hours || []).filter(
        (h, index) => index !== action.position
      );
      return {
        ...state,
        day_opening_hours: {
          ...state.day_opening_hours,
          ...getOpenAndClose(newHours),
          hours: newHours,
        },
      };
    case 'update_hours':
      newHours = (state.day_opening_hours?.hours || []).map((hours, index) => {
        if (index === action.position) {
          const t = { ...hours };
          if (action.action === 'open') {
            t.open = action.time;
            if (action.time > t.close) {
              t.close = action.time;
            }
          } else {
            t.close = action.time;
            if (action.time < t.open) {
              t.open = action.time;
            }
          }
          return t;
        }
        return hours;
      });
      return {
        ...state,
        day_opening_hours: {
          ...state.day_opening_hours,
          ...getOpenAndClose(newHours),
          hours: newHours,
        },
      };
    case 'set_expanded':
      return {
        ...state,
        expanded: action.expanded,
      };
    case 'set_date':
      return {
        ...state,
        date: action.date,
      };
    default:
      return state;
  }
};

interface ScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    day_opening_hours: route.params.day_opening_hours,
    expanded: null,
    date: new Date(),
  });

  // event handlers

  useLayoutEffect(() => {
    navigation.setOptions({
      title: stringFormatter.toWeekDay(route.params.day_opening_hours.day, {
        capitalize: true,
      }),
    });
  }, [route.params.day_opening_hours.day]);

  useEffect(() => {
    eventEmitter.emit('day-opening-hours.updated', state.day_opening_hours);
  }, [state.day_opening_hours]);

  // render logic
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white }]}>
      <ScrollView style={{ flex: 1, paddingTop: 15 }}>
        {(state.day_opening_hours.hours || []).map((hours, index) => {
          const open =
            state.expanded &&
            state.expanded.position === index &&
            state.expanded.action === 'open';
          const close =
            state.expanded &&
            state.expanded.position === index &&
            state.expanded.action === 'close';
          return (
            <View key={`${index}`} style={{ marginBottom: 30 }}>
              <Divider />

              {/* open */}
              <Touchable
                style={[
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: open ? colors.blackLight9 : colors.white,
                    paddingVertical: 15,
                  },
                  globalStyles.withPadding,
                ]}
                onPress={(event: GestureResponderEvent) => {
                  event.stopPropagation();
                  if (!open) {
                    dispatch({
                      type: 'set_date',
                      date: toDate(hours.open),
                    });
                  }
                  dispatch({
                    type: 'set_expanded',
                    expanded: open ? null : { action: 'open', position: index },
                  });
                }}
              >
                <Text level={6} style={{ flex: 1 }}>
                  Desde
                </Text>
                <Text level={6} color={colors.blue}>
                  {numberFormatter.humanizeTime(hours.open)}
                </Text>
              </Touchable>
              {open && (
                <TimePicker
                  value={state.date}
                  onChange={(date) => {
                    dispatch({ type: 'set_expanded', expanded: null });
                    dispatch({
                      type: 'set_date',
                      date,
                    });

                    const time = toTime(date);
                    dispatch({
                      type: 'update_hours',
                      position: index,
                      action: 'open',
                      time,
                    });
                  }}
                  onDismiss={() => {
                    dispatch({ type: 'set_expanded', expanded: null });
                  }}
                />
              )}
              <Divider style={{ marginLeft: 20 }} />

              {/* close */}
              <Touchable
                style={[
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: close ? colors.blackLight9 : colors.white,
                    paddingVertical: 15,
                  },
                  globalStyles.withPadding,
                ]}
                onPress={(event: GestureResponderEvent) => {
                  event.stopPropagation();
                  if (!close) {
                    dispatch({
                      type: 'set_date',
                      date: toDate(hours.close),
                    });
                  }
                  dispatch({
                    type: 'set_expanded',
                    expanded: close
                      ? null
                      : { action: 'close', position: index },
                  });
                }}
              >
                <Text level={6} style={{ flex: 1 }}>
                  Hasta
                </Text>
                <Text level={6} color={colors.blue}>
                  {numberFormatter.humanizeTime(hours.close)}
                </Text>
              </Touchable>
              {close && (
                <TimePicker
                  value={state.date}
                  onChange={(date) => {
                    dispatch({ type: 'set_expanded', expanded: null });

                    dispatch({
                      type: 'set_date',
                      date,
                    });

                    const time = toTime(date);
                    dispatch({
                      type: 'update_hours',
                      position: index,
                      action: 'close',
                      time,
                    });
                  }}
                  onDismiss={() => {
                    dispatch({ type: 'set_expanded', expanded: null });
                  }}
                />
              )}
              <Divider style={{ marginLeft: 20 }} />

              {/* delete section */}
              <Touchable
                style={{ alignItems: 'center', paddingVertical: 15 }}
                onPress={(event: GestureResponderEvent) => {
                  event.stopPropagation();
                  dispatch({ type: 'delete_hours', position: index });
                }}
              >
                <Text level={6} color={colors.red}>
                  Eliminar
                </Text>
              </Touchable>

              {/* <Divider /> */}
            </View>
          );
        })}
        {(state.day_opening_hours.hours || []).length < 2 && (
          <Touchable
            style={{ marginBottom: 30 }}
            onPress={(event: GestureResponderEvent) => {
              event.stopPropagation();
              dispatch({ type: 'add_hours' });
            }}
          >
            <Divider />
            <Text
              level={6}
              color={colors.blue}
              style={{ marginVertical: 15, alignSelf: 'center' }}
            >
              Añadir horarios
            </Text>
            <Divider />
          </Touchable>
        )}

        <View style={globalStyles.withScreenAir} />
      </ScrollView>
    </View>
  );
};
