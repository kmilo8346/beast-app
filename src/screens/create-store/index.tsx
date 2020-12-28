import React, { useEffect, useReducer, useRef } from 'react';
import {
  GestureResponderEvent,
  Keyboard,
  ScrollView,
  Vibration,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import isEqual from 'lodash.isequal';

// constraints
import constraints from './constraints';
// components
import Input from '../../components/inputs/input';
import InputImages from '../../components/inputs/input-images';
import Button from '../../components/buttons/button';
import LoadingOverlay, {
  ILoadingOverlay,
  LoadingStatus,
} from '../../components/loading-overlay';
import Toast, { IToast } from '../../components/toast';
import { defaultOpeningHours } from '../../components/modals/modal-set-openning-hours';
// local components
import SetDeliveryAreaInput from './components/set-delivery-area-input';
// clients
import userClient from '../../clients/user-client';
import storeClient from '../../clients/store-client';
// cache
import userCache from '../../cache/user';
import storeCache from '../../cache/store';
// libs
import validate from '../../lib/validate';
import { v4 as uuidv4 } from '../../lib/uuid';
import { capture } from '../../lib/sentry';
// types
import { Store } from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component
const prefix = '[upsert store screen]';

type ChangeValueAction = {
  type: 'change_value';
  attribute: string;
  value: any;
};
type ValidateValueAction = {
  type: 'validate_value';
  attribute: string;
  value: any;
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
    store: Store;

    snapshot: Store;
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
          store: { ...state.form.store, [action.attribute]: action.value },
        },
      };
    case 'validate_value':
      if (!state.form.submitted) return state;

      return {
        ...state,
        form: {
          ...state.form,
          errors: validate(state.form.store, constraints),
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
}

export default ({ navigation }: ScreenProps) => {
  // state
  const user = userCache.getData();
  const [state, dispatch] = useReducer(
    reducer,
    (() => {
      const store = ({
        reference: `${`${user?.id as string}`.substring(0, 6)}-${uuidv4()}`,
        images: [],
        name: '',
        phone: user?.phone as string,
        user: user?.id as string,
        delivery_area: (() => {
          const address = userCache.getAddress();
          return address
            ? {
                center: address,
                radius: '50m',
                geometry: {
                  type: 'circle',
                  radius: '50m',
                  coordinates: [address.location.lon, address.location.lat],
                },
              }
            : undefined;
        })(),
        delivery_time: {
          gte: 10,
          lte: 40,
        },
        opening_hours: defaultOpeningHours,
        enabled: true,
      } as unknown) as Store;

      return {
        form: {
          store,

          snapshot: store,
          changed: false,
          submitted: false,
        },
      };
    })()
  );
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);
  const toastRef = useRef<IToast>(null);

  // event handlers
  const createStore = async () => {
    try {
      await loadingOverlayRef.current?.show();
      const storeCreated = await storeClient.create({
        body: state.form.store,
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
        navigation.replace('EditStore');
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
    dispatch({ type: 'validate_value', attribute, value });
  };

  const pressCreateStoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    Keyboard.dismiss();
    dispatch({ type: 'set_form_submitted' });
    // validate
    const errors = validate(state.form.store, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      toastRef.current?.show({
        message: 'Revise formulario, por favor',
        type: 'ERROR',
        expiration: 3,
      });
      return;
    }

    createStore();
  };

  useEffect(() => {
    const changed = !isEqual(state.form.store, state.form.snapshot);
    dispatch({ type: 'set_changed', changed });
  }, [state.form.store]);

  // render logic
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white }]}>
      <ScrollView style={[globalStyles.withPadding, { flex: 1 }]}>
        <InputImages
          size={1}
          label="Imagen"
          path={`beast/${Constants.manifest.extra.BEAST_ENVIRONMENT}/stores/${
            state.form.store?.reference
          }/${new Date().getTime()}-\${}`}
          value={state.form.store?.images}
          errors={state.form.errors?.images}
          onChange={(images) => {
            changeHandler('images', images);
          }}
        />
        <Input
          label="Nombre"
          lengthCounter
          maxLength={30}
          placeholder="Colaciones express"
          value={state.form.store?.name}
          errors={state.form.errors?.name}
          onChangeText={(text) => {
            changeHandler('name', text);
          }}
        />

        <SetDeliveryAreaInput
          value={state.form.store?.delivery_area}
          errors={state.form.errors?.delivery_area}
          onChange={(delivery_area) => {
            changeHandler('delivery_area', delivery_area);
          }}
        />

        <View style={globalStyles.withScreenAir} />
      </ScrollView>
      <View style={[globalStyles.withMargin]}>
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        <Button
          title="Crear tienda"
          disabled={!state.form.changed}
          style={globalStyles.withMainActionAir}
          onPress={pressCreateStoreHandler}
        />
      </View>
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
