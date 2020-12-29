import React, { useEffect, useReducer, useRef } from 'react';
import {
  GestureResponderEvent,
  ScrollView,
  Vibration,
  View,
} from 'react-native';
import isEqual from 'lodash.isequal';

// components
import Icon from '../../../components/icon';
import Text from '../../../components/text';
import LoadingOverlay, {
  ILoadingOverlay,
  LoadingStatus,
} from '../../../components/loading-overlay';
import Divider from '../../../components/divider';
import Touchable from '../../../components/touchable';
import Button from '../../../components/buttons/button';
import Toast, { IToast } from '../../../components/toast';
// clients
import storeClient from '../../../clients/store-client';
// cache
import storeCache from '../../../cache/store';
// libs
import { capture } from '../../../lib/sentry';
import { eventEmitter } from '../../../lib/event-emitter';
import numberFormatter from '../../../lib/formatters/number-formatter';
import stringFormatter from '../../../lib/formatters/string-formatter';
// types
import { DayOpeningHours, OpeningHours } from '../../../types';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

// instances outside component
const prefix = '[edit store set opening hours screen]';

type UpdateDayOpeningHours = {
  type: 'update_day_opening_hours';
  day_opening_hours: DayOpeningHours;
};
type SetChangedAction = {
  type: 'set_changed';
  changed: boolean;
};
type Action = UpdateDayOpeningHours | SetChangedAction;
type State = {
  form: {
    // fields
    opening_hours: OpeningHours;

    // other state
    changed: boolean;
  };
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'update_day_opening_hours':
      return {
        ...state,
        form: {
          ...state.form,
          opening_hours: state.form.opening_hours.map((day_opening_hours) => {
            if (day_opening_hours.day === action.day_opening_hours.day) {
              return { ...action.day_opening_hours };
            }
            return day_opening_hours;
          }),
        },
      };
    case 'set_changed':
      return { ...state, form: { ...state.form, changed: action.changed } };
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
    form: {
      // fields
      opening_hours: route.params.opening_hours,

      // other state
      changed: false,
    },
  });
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);
  const toastRef = useRef<IToast>(null);

  // event handlers
  const updateStore = async () => {
    try {
      await loadingOverlayRef.current?.show();
      const storeUpdated = await storeClient.update({
        pathVars: {
          id: route.params.id,
        },
        body: {
          opening_hours: state.form.opening_hours,
        },
      });
      storeCache.updateData(storeUpdated);
      loadingOverlayRef.current?.status(LoadingStatus.OK);
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      capture(prefix, 'Update store error', error);

      Vibration.vibrate(400);
      toastRef.current?.show({
        message: 'No se puedo actualizar, reintenta por favor',
        type: 'ERROR',
        expiration: 3,
      });
    } finally {
      await loadingOverlayRef.current?.hide();
    }
  };

  const submit = () => {
    updateStore();
  };

  const pressSaveHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    submit();
  };

  useEffect(() => {
    const removeListener = eventEmitter.on(
      'day-opening-hours.updated',
      (day_opening_hours: DayOpeningHours) => {
        dispatch({ type: 'update_day_opening_hours', day_opening_hours });
      }
    );

    return () => {
      removeListener();
    };
  }, []);

  useEffect(() => {
    const changed = !isEqual(
      route.params.opening_hours,
      state.form.opening_hours
    );
    dispatch({ type: 'set_changed', changed });
  }, [state.form.opening_hours]);

  // render logic
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white }]}>
      <ScrollView style={{ flex: 1, paddingTop: 15 }}>
        {/* <Divider /> */}
        {state.form.opening_hours.map((day_opening_hours, index) => {
          return (
            <Touchable
              key={`${day_opening_hours.day}-${index}`}
              onPress={(event: GestureResponderEvent) => {
                event.stopPropagation();
                navigation.navigate('EditStoreSetDayOpeningHours', {
                  day_opening_hours,
                });
              }}
            >
              <View style={{ marginLeft: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1, marginTop: 15, marginBottom: 15 }}>
                    <Text level={6} style={{ marginBottom: 5 }}>
                      {stringFormatter.toWeekDay(day_opening_hours.day, {
                        capitalize: true,
                      })}
                    </Text>
                    {(day_opening_hours.hours || []).map((hours, index) => {
                      return (
                        <Text
                          key={`${index}`}
                          level={6}
                          color={colors.blackLight3}
                        >{`${numberFormatter.humanizeTime(
                          hours.open
                        )} a ${numberFormatter.humanizeTime(
                          hours.close
                        )}`}</Text>
                      );
                    })}
                    {!(day_opening_hours.hours || []).length && (
                      <Text level={6} color={colors.blackLight3}>
                        Cerrado
                      </Text>
                    )}
                  </View>
                  <Icon
                    name="chevron-right"
                    color={colors.blackLight4}
                    style={{ marginRight: 20 }}
                  />
                </View>
                <Divider />
              </View>
            </Touchable>
          );
        })}
        {/* <Divider /> */}

        <View style={globalStyles.withScreenAir} />
      </ScrollView>
      <View style={[globalStyles.withMargin]}>
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        <Button
          title="Guardar"
          disabled={!state.form.changed}
          style={globalStyles.withMainActionAir}
          onPress={pressSaveHandler}
        />
      </View>
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
