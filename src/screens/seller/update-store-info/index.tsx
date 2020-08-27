import React, { useReducer, useRef } from 'react';
import { View, ScrollView, Vibration } from 'react-native';

// components
import Input from '../../../components/inputs/input';
import InputImages from '../../../components/inputs/input-images';
import Button from '../../../components/buttons/button';
import InputSetDeliveryArea from '../../../components/inputs/input-set-delivery-area';
import InputSetDeliveryTime from '../../../components/inputs/input-set-delivery-time';
import InputSetOpeningHours from '../../../components/inputs/input-set-opening-hours';
import LoadingOverlay, {
  ILoadingOverlay,
} from '../../../components/loading-overlay';
import Toast, { IToast } from '../../../components/toast';
// clients
import storeClient from '../../../clients/store-client';
// cache
import userCache from '../../../cache/user';
import storeCache from '../../../cache/store';
// libs
import validate from '../../../lib/validate';
// constraints
import constraints from './constraints';
// types
import { Store } from '../../../types';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

// instances outside component
const prefix = '[update store info screen]';

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
  // fields
  store: Store;
  // other form states
  submitted: boolean;
  errors?: { [key: string]: string[] };
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_value':
      return {
        ...state,
        store: { ...state.store, [action.attribute]: action.value },
      };
    case 'validate_value':
      if (!state.submitted) return state;

      return {
        ...state,
        errors: validate(state.store, constraints),
      };
    case 'set_form_submitted':
      return {
        ...state,
        submitted: true,
      };
    case 'set_form_errors':
      return { ...state, errors: action.errors };
    default:
      return state;
  }
};

export interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // state
  const user = userCache.getData();
  // preconditions
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const store = storeCache.getData();
  if (!store) {
    throw new Error(`${prefix} Store must be defined`);
  }
  const [state, dispatch] = useReducer(reducer, {
    store,
    submitted: false,
  });
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);
  const toastRef = useRef<IToast>(null);

  // events handlers
  const changeHandler = (attribute: string, value: any) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
  };

  const pressContinueHandler = async () => {
    dispatch({ type: 'set_form_submitted' });
    // validate
    const errors = validate(state.store, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      return;
    }
    try {
      loadingOverlayRef.current?.show();
      const { id, ...store } = state.store;
      await storeClient.update({
        pathVars: { id },
        body: store,
      });
      // set updated store in cache
      storeCache.setData(state.store);
      navigation.navigate('SellerDashboard');
    } catch (error) {
      // TODO: log error
      console.log(error);

      toastRef.current?.show({
        message: 'Ocurrió un error inesperado',
        type: 'ERROR',
        expiration: 3,
      });
    } finally {
      loadingOverlayRef.current?.hide();
    }
  };

  // render logic
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.white,
      }}
    >
      <ScrollView
        style={[{ flex: 1, paddingTop: 15 }, globalStyles.withPadding]}
      >
        <Input
          placeholder="Minimarket Don Juan"
          label="Nombre de tienda"
          value={state.store.name}
          errors={state.errors?.name}
          onChangeText={(text) => {
            changeHandler('name', text);
          }}
        />
        <InputImages
          size={1}
          label="Imagen"
          path={`stores/${store.id}/images/\${}`}
          value={state.store.images}
          errors={state.errors?.images}
          onChange={(images) => {
            changeHandler('images', images);
          }}
        />
        <InputSetDeliveryArea
          value={state.store.delivery_area}
          errors={state.errors?.delivery_area}
          onChange={(delivery_area) => {
            changeHandler('delivery_area', delivery_area);
          }}
        />
        <InputSetDeliveryTime
          value={state.store.delivery_time}
          errors={state.errors?.delivery_time}
          onChange={(delivery_time) => {
            changeHandler('delivery_time', delivery_time);
          }}
        />
        <InputSetOpeningHours
          value={state.store.opening_hours}
          errors={state.errors?.opening_hours}
          onChange={(opening_hours) => {
            changeHandler('opening_hours', opening_hours);
          }}
        />
        <View style={globalStyles.withScreenAir} />
      </ScrollView>
      <View
        style={[
          { position: 'absolute', left: 0, right: 0, bottom: 0 },
          globalStyles.withMargin,
        ]}
      >
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        <Button
          title="Continuar"
          onPress={pressContinueHandler}
          style={globalStyles.withMainActionAir}
        />
      </View>
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
