import React, { useEffect, useReducer, useRef } from 'react';
import {
  GestureResponderEvent,
  Keyboard,
  ScrollView,
  Vibration,
  View,
} from 'react-native';
import isEqual from 'lodash.isequal';

// constraints
import constraints from './constraints';
// screen components
import AddressInput from '../../components/address-input';
// components
import LoadingOverlay, {
  ILoadingOverlay,
  LoadingStatus,
} from '../../../components/loading-overlay';
import Button from '../../../components/buttons/button';
import Toast, { IToast } from '../../../components/toast';
import InputSelectOptions from '../../../components/inputs/input-select-options';
// clients
import storeClient from '../../../clients/store-client';
// cache
import storeCache from '../../../cache/store';
// libs
import validate from '../../../lib/validate';
import { capture } from '../../../lib/sentry';
// types
import { Circle, Place } from '../../../types';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

// instances outside component
const prefix = '[edit store set delivery area screen]';
const toCircle = (center: Place, radius: string): Circle => {
  return {
    type: 'circle',
    coordinates: [center.location.lon, center.location.lat],
    radius,
  };
};
const availableRadius = [
  {
    key: '50m',
    title: '50m (Venta en el edificio)',
  },
  {
    key: '100m',
    title: '100m',
  },
  {
    key: '200m',
    title: '200m',
  },
  {
    key: '300m',
    title: '300m',
  },
  {
    key: '400m',
    title: '400m',
  },
  {
    key: '500m',
    title: '500m',
  },
  {
    key: '1000m',
    title: '1km',
  },
  {
    key: '2000m',
    title: '2km',
  },
  {
    key: '3000m',
    title: '3km',
  },
  {
    key: '4000m',
    title: '4km',
  },
  {
    key: '5000m',
    title: '5km',
  },
];

type ChangeValueAction = {
  type: 'change_value';
  attribute: string;
  value: any;
};
type ValidateValueAction = {
  type: 'validate_value';
};
type SetFormSubmittedAction = {
  type: 'set_form_submitted';
};
type SetFormErrorsAction = {
  type: 'set_form_errors';
  errors: { [key: string]: string[] };
};
type SetChangedAction = {
  type: 'set_changed';
  changed: boolean;
};
type Action =
  | ChangeValueAction
  | ValidateValueAction
  | SetFormSubmittedAction
  | SetFormErrorsAction
  | SetChangedAction;
type State = {
  form: {
    // fields
    center?: Place;
    radius?: string;

    // other state
    changed: boolean;
    submitted: boolean;
    errors?: { [key: string]: string[] };
  };
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_value':
      return {
        ...state,
        form: {
          ...state.form,
          [action.attribute]: action.value,
        },
      };
    case 'validate_value':
      if (!state.form.submitted) return state;

      return {
        ...state,
        form: {
          ...state.form,
          errors: validate(state.form, constraints),
        },
      };
    case 'set_form_submitted':
      return { ...state, form: { ...state.form, submitted: true } };
    case 'set_form_errors':
      return { ...state, form: { ...state.form, errors: action.errors } };
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
      center: route.params.delivery_area?.center,
      radius: route.params.delivery_area?.radius,

      // other state
      changed: false,
      submitted: false,
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
          delivery_area: {
            center: state.form.center,
            radius: state.form.radius,
            geometry: toCircle(
              state.form.center as Place,
              state.form.radius as string
            ),
          },
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
    dispatch({ type: 'set_form_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      return;
    }

    updateStore();
  };

  const changeHandler = (attribute: string, value: any) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value' });
  };

  const pressSaveHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    Keyboard.dismiss();
    submit();
  };

  useEffect(() => {
    const changed = !isEqual(route.params.delivery_area, {
      center: state.form.center,
      radius: state.form.radius,
      geometry: toCircle(
        state.form.center as Place,
        state.form.radius as string
      ),
    });
    dispatch({ type: 'set_changed', changed });
  }, [state.form.center, state.form.radius]);

  // render logic
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white }]}>
      <ScrollView
        style={[globalStyles.withPadding, { flex: 1, paddingTop: 15 }]}
      >
        <InputSelectOptions
          label="Radio de entrega"
          placeholder="Seleccione radio de entrega"
          value={state.form.radius}
          errors={state.form.errors?.radius}
          modalTitle="Selecciona radio de entrega"
          options={availableRadius}
          onChange={(key) => {
            changeHandler('radius', key);
          }}
        />
        <AddressInput
          label="Dirección"
          value={state.form.center}
          errors={state.form.errors?.center}
          placeholder="Jose Manuel Rodríguez 927"
          onChange={(place) => {
            changeHandler('center', place);
          }}
        />
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
