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
// constants
import { defaultOpeningHours } from '../../constants';
// components
import Text from '../../../components/text';
import LoadingOverlay, {
  ILoadingOverlay,
  LoadingStatus,
} from '../../../components/loading-overlay';
import Button from '../../../components/buttons/button';
import Toast, { IToast } from '../../../components/toast';
import InputImages from '../../../components/inputs/input-images';
// clients
import userClient from '../../../clients/user-client';
import storeClient from '../../../clients/store-client';
// cache
import userCache from '../../../cache/user';
import storeCache from '../../../cache/store';
// libs
import validate from '../../../lib/validate';
import { capture } from '../../../lib/sentry';
import { v4 as uuidv4 } from '../../../lib/uuid';
// types
import { Place, Store, User } from '../../../types';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

// instaces outside component
const prefix = '[create store wizzard set delivery area screen]';

type ChangeValueAction = {
  type: 'change_value';
  images: string[];
};
type ValidateValueAction = {
  type: 'validate_value';
  images: string[];
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
    images: string[];
    reference: string;

    snapshot: string[];
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
          images: action.images,
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
  const user = userCache.getData();
  const [state, dispatch] = useReducer(reducer, {
    form: {
      images: [],
      reference: `${`${user?.id as string}`.substring(0, 6)}-${uuidv4()}`,

      snapshot: [],
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
      const address = userCache.getAddress() as Place;
      const newStore = {
        enabled: true,
        user: user.id,
        phone: user.phone,
        name: route.params.name,
        images: state.form.images,
        reference: state.form.reference,
        opening_hours: defaultOpeningHours,
        delivery_time: {
          gte: 10,
          lte: 40,
        },
        delivery_area: {
          center: address,
          radius: '50m',
          geometry: {
            type: 'circle',
            radius: '50m',
            coordinates: [address.location.lon, address.location.lat],
          },
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

  const changeHandler = (images: string[]) => {
    dispatch({ type: 'change_value', images });
    dispatch({ type: 'validate_value', images });
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

    const address = userCache.getAddress();
    if (address) {
      createStore();
    } else {
      navigation.navigate('CreateStoreWizzardSetDeliveryArea', {
        name: route.params.name,
        images: state.form.images,
        reference: state.form.reference,
      });
    }
  };

  useEffect(() => {
    const changed = !isEqual(state.form.images, state.form.snapshot);
    dispatch({ type: 'set_changed', changed });
  }, [state.form.images]);

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
          Logo de la tienda
        </Text>
        <Text
          level={5}
          weight="light"
          style={{ marginBottom: 60, lineHeight: 23 }}
        >
          Agrega el logo o imagen que representa tu tienda.
        </Text>
        <InputImages
          size={1}
          label="Logo de la tienda"
          path={`beast/${Constants.manifest.extra.BEAST_ENVIRONMENT}/stores/${
            state.form.reference
          }/${new Date().getTime()}-\${}`}
          value={state.form.images}
          errors={state.form.errors?.images}
          onChange={(images) => {
            changeHandler(images);
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
