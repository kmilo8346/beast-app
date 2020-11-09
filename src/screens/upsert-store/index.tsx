import React, { useLayoutEffect, useReducer, useRef } from 'react';
import {
  GestureResponderEvent,
  Keyboard,
  ScrollView,
  Vibration,
  View,
} from 'react-native';
import Constants from 'expo-constants';

// constraints
import constraints from './constraints';
// components
import Input from '../../components/inputs/input';
import InputImages from '../../components/inputs/input-images';
import Text from '../../components/text';
import Button from '../../components/buttons/button';
import LoadingOverlay, {
  ILoadingOverlay,
} from '../../components/loading-overlay';
import Toast, { IToast } from '../../components/toast';
import Switch from '../../components/switch';
import { defaultOpeningHours } from '../../components/modals/modal-set-openning-hours';
// local components
import SetDeliveryAreaInput from './components/set-delivery-area-input';
import SetDeliveryTimeInput from './components/set-delivery-time-input';
import SetOpeningHoursInput from './components/set-opening-hours-input';
import SetPaymentProviderInput from './components/set-payment-provider-input';
// clients
import storeClient from '../../clients/store-client';
import userClient from '../../clients/user-client';
// cache
import userCache from '../../cache/user';
import storeCache from '../../cache/store';
// libs
import validate from '../../lib/validate';
import { v4 as uuidv4 } from '../../lib/uuid';
import stringFormatter from '../../lib/formatters/string-formatter';
import stringParser from '../../lib/parsers/string-parser';
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
type Action =
  | ChangeValueAction
  | ValidateValueAction
  | SetFormSubmittedAction
  | SetFormErrorsAction;
type State = {
  form: {
    store: Store;

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
  const user = userCache.getData();
  const [state, dispatch] = useReducer(reducer, {
    form: {
      store:
        route.params?.store ||
        (({
          reference: `${`${user?.id as string}`.substring(0, 6)}-${uuidv4()}`,
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
        } as unknown) as Store),

      submitted: false,
    },
  });
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);
  const toastRef = useRef<IToast>(null);

  // event handlers
  const createStore = async () => {
    try {
      loadingOverlayRef.current?.show();
      const created = await storeClient.create({
        body: state.form.store,
      });
      await userClient.update({
        pathVars: {
          id: user?.id as string,
        },
        body: {
          current_store: created.id,
        },
      });
      storeCache.setData(created);
      userCache.updateData({ current_store: created.id });
      navigation.navigate('MyStore');
    } catch (error) {
      capture(prefix, 'Create store error', error);

      Vibration.vibrate(400);
      toastRef.current?.show({
        message: 'No se puedo crear, reintenta por favor',
        type: 'ERROR',
        expiration: 3,
      });
    } finally {
      loadingOverlayRef.current?.hide();
    }
  };

  const updateStore = async () => {
    try {
      loadingOverlayRef.current?.show();
      await storeClient.update({
        pathVars: { id: state.form.store.id },
        body: state.form.store,
      });
      storeCache.setData(state.form.store);
      navigation.navigate('MyStore');
    } catch (error) {
      capture(prefix, 'Update store error', error);

      Vibration.vibrate(400);
      toastRef.current?.show({
        message: 'No se pudo actualizar, reintenta por favor',
        type: 'ERROR',
        expiration: 3,
      });
    } finally {
      loadingOverlayRef.current?.hide();
    }
  };

  const changeHandler = (attribute: string, value: any) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
  };

  const pressSaveHandler = (event: GestureResponderEvent) => {
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

    if (!state.form.store.id) {
      createStore();
    } else {
      updateStore();
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params?.store ? 'Editar tienda' : 'Crear tienda',
    });
  }, [route.params?.store]);

  // render logic
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white }]}>
      <ScrollView style={[globalStyles.withPadding, { flex: 1 }]}>
        <InputImages
          size={1}
          label="Imagen"
          required
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
          required
          lengthCounter
          maxLength={30}
          placeholder="Colaciones express"
          value={state.form.store?.name}
          errors={state.form.errors?.name}
          onChangeText={(text) => {
            changeHandler('name', text);
          }}
        />
        <Input
          label="Descripción"
          multiline
          lengthCounter
          maxLength={200}
          placeholder="Servicio de colaciones a domicilio"
          value={state.form.store?.description}
          errors={state.form.errors?.description}
          onChangeText={(text) => {
            changeHandler('description', text);
          }}
        />
        <Input
          label="Teléfono"
          required
          keyboardType="phone-pad"
          placeholder="Teléfono móvil"
          format={stringFormatter.toPhone}
          parse={stringParser.fromPhone}
          prefix={
            <Text level={6} style={{ color: colors.black, marginLeft: 10 }}>
              +56
            </Text>
          }
          value={state.form.store?.phone}
          errors={state.form.errors?.phone}
          onChangeText={(text) => {
            changeHandler('phone', text);
          }}
        />
        <SetDeliveryAreaInput
          value={state.form.store?.delivery_area}
          errors={state.form.errors?.delivery_area}
          onChange={(delivery_area) => {
            changeHandler('delivery_area', delivery_area);
          }}
        />
        <SetDeliveryTimeInput
          value={state.form.store?.delivery_time}
          errors={state.form.errors?.delivery_time}
          onChange={(delivery_time) => {
            changeHandler('delivery_time', delivery_time);
          }}
        />
        <SetOpeningHoursInput
          value={state.form.store?.opening_hours}
          errors={state.form.errors?.opening_hours}
          onChange={(opening_hours) => {
            changeHandler('opening_hours', opening_hours);
          }}
        />
        <SetPaymentProviderInput
          value={state.form.store?.payment_provider}
          errors={state.form.errors?.payment_provider}
          onChange={(payment_provider) => {
            changeHandler('payment_provider', payment_provider);
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text level={6}>Visibilidad</Text>
          <View style={{ flex: 1 }} />
          <Text level={6} weight="light" style={{ marginRight: 5 }}>
            {state.form.store.enabled ? 'Visible' : 'No visible'}
          </Text>
          <Switch
            defaultValue
            value={state.form.store.enabled}
            onValueChange={(value) => {
              changeHandler('enabled', value);
            }}
          />
        </View>
        <View style={globalStyles.withScreenAir} />
      </ScrollView>
      <View style={[globalStyles.withMargin]}>
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        <Button
          title="Guardar"
          style={globalStyles.withMainActionAir}
          onPress={pressSaveHandler}
        />
      </View>
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
