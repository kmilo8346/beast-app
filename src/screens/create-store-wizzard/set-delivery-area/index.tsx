import React, { useEffect, useReducer, useRef } from 'react';
import {
  GestureResponderEvent,
  Keyboard,
  ScrollView,
  Vibration,
  View,
} from 'react-native';

// constraints
import constraints from './constraints';
// constants
import { defaultOpeningHours } from '../../constants';
// screen components
import AddressInput from '../../components/address-input';
// components
import Text from '../../../components/text';
import LoadingOverlay, {
  ILoadingOverlay,
  LoadingStatus,
} from '../../../components/loading-overlay';
import Button from '../../../components/buttons/button';
import Toast, { IToast } from '../../../components/toast';
import InputSelectOptions from '../../../components/inputs/input-select-options';
// clients
import userClient from '../../../clients/user-client';
import storeClient from '../../../clients/store-client';
// cache
import userCache from '../../../cache/user';
import storeCache from '../../../cache/store';
// libs
import validate from '../../../lib/validate';
import { capture } from '../../../lib/sentry';
// types
import { Circle, Place, Store, User } from '../../../types';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

// instaces outside component
const prefix = '[create store wizzard set delivery area screen]';
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
const toCircle = (center: Place, radius: string): Circle => {
  return {
    type: 'circle',
    coordinates: [center.location.lon, center.location.lat],
    radius,
  };
};

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

    // other states
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
      changed: false,
      submitted: false,
    },
  });
  const toastRef = useRef<IToast>(null);
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);

  // event handlers
  const createStore = async () => {
    try {
      await loadingOverlayRef.current?.show();
      // store data
      const user = userCache.getData() as User;
      const newStore = {
        enabled: true,
        user: user.id,
        phone: user.phone,
        name: route.params.name,
        images: route.params.images,
        reference: route.params.reference,
        opening_hours: defaultOpeningHours,
        delivery_time: {
          gte: 10,
          lte: 40,
        },
        delivery_area: {
          center: state.form.center,
          radius: state.form.radius,
          geometry: toCircle(
            state.form.center as Place,
            state.form.radius as string
          ),
        },
      } as Store;

      const storeCreated = await storeClient.create({
        body: newStore,
      });
      const userUpdated = await userClient.update({
        pathVars: {
          id: user?.id as string,
        },
        body: {
          current_store: storeCreated.id,
        },
        source: ['updated_at'],
      });
      storeCache.setData(storeCreated);
      userCache.updateData({
        current_store: storeCreated.id,
        ...userUpdated,
      });
      loadingOverlayRef.current?.status(LoadingStatus.OK);
      setTimeout(() => {
        navigation.navigate('MyStore');
      }, 1000);
    } catch (error) {
      capture(prefix, 'Create store error', error);

      Vibration.vibrate(400);
      toastRef.current?.show({
        message: 'No se puedo crear, reintenta por favor',
        type: 'ERROR',
        expiration: 3,
      });
    } finally {
      await loadingOverlayRef.current?.hide();
    }
  };

  const changeHandler = (attribute: string, value: any) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value' });
  };

  const pressContinueHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    Keyboard.dismiss();
    dispatch({ type: 'set_form_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      return;
    }

    createStore();
  };

  useEffect(() => {
    const changed = !!state.form.center || !!state.form.radius;
    dispatch({ type: 'set_changed', changed });
  }, [state.form.center, state.form.radius]);

  // render logic
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white }]}>
      <ScrollView style={[globalStyles.withPadding, { flex: 1 }]}>
        <Text
          level={2}
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginBottom: 10 }}
        >
          Área de despacho
        </Text>
        <Text
          level={5}
          weight="light"
          style={{ marginBottom: 60, lineHeight: 23 }}
        >
          Agrega un área de despacho que se acomode a tu negocio.
        </Text>
        <AddressInput
          label="Dirección"
          value={state.form.center}
          errors={state.form.errors?.center}
          placeholder="Jose Manuel Rodríguez 927"
          onChange={(place) => {
            changeHandler('center', place);
          }}
        />
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

        <View style={globalStyles.withScreenAir} />
      </ScrollView>
      <View style={[globalStyles.withMargin]}>
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        <Button
          title="Continuar"
          disabled={!state.form.changed}
          style={globalStyles.withMainActionAir}
          onPress={pressContinueHandler}
        />
      </View>
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
