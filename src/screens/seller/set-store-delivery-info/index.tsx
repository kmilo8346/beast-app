import React, { useReducer, useRef } from 'react';
import { View, Vibration } from 'react-native';

// components
import {
  Container,
  Text,
  Button,
  InputSetDeliveryArea,
  InputSetDeliveryTime,
  InputSetOpeningHours,
  Toast,
  IToast,
} from '../../../components';
// libs
import validate from '../../../lib/validate';
// containers
import UserProvider from '../../../containers/user';
// cache
import storeCache from '../../../cache/store';
// constraints
import constraints from './constraints';
// styles
import globalStyles from '../../../styles';
import { IntegerRange, OpeningHours, DeliveryArea } from '../../../types';
import colors from '../../../styles/colors';

// instances outside component
const prefix = '[set store delivery info screen]';

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
type SetSubmittedAction = {
  type: 'set_submitted';
};
type SetFormErrorsAction = {
  type: 'set_form_errors';
  errors: { [key: string]: string[] };
};
type Action =
  | ChangeValueAction
  | ValidateValueAction
  | SetSubmittedAction
  | SetFormErrorsAction;
type State = {
  form: {
    // fields;
    delivery_area?: DeliveryArea;
    delivery_time?: IntegerRange;
    opening_hours?: OpeningHours;
    // hidden field

    // other states
    submitted: boolean;
    errors?: { [key: string]: string[] };
  };
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_value':
      return {
        ...state,
        form: { ...state.form, [action.attribute]: action.value },
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
    case 'set_submitted':
      return { ...state, form: { ...state.form, submitted: true } };
    case 'set_form_errors':
      return { ...state, form: { ...state.form, errors: action.errors } };
    default:
      return state;
  }
};

export interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    form: {
      // other form states
      submitted: false,
    },
  });

  const userContainer = UserProvider.useContainer();
  const user = userContainer.get();
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const store = storeCache.getData();
  if (!store || !store.name || !store.images || !store.images.length) {
    throw new Error(
      `${prefix} Store must be initialized and must have name and images`
    );
  }
  const toastRef = useRef<IToast>(null);

  // event handlers
  const changeHandler = (attribute: string, value: any) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
  };
  const pressContinueHandler = async () => {
    // set submitted
    dispatch({ type: 'set_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      return;
    }
    // update store cache
    storeCache.updateData({
      delivery_area: state.form.delivery_area,
      delivery_time: state.form.delivery_time,
      opening_hours: state.form.opening_hours,
    });
    navigation.navigate('MercadoPagoSignIn');
  };
  // render logic
  return (
    <View
      style={[
        { flex: 1, backgroundColor: colors.white },
        globalStyles.withPadding,
      ]}
    >
      <Text level={2} weight="bold" style={{ marginBottom: 10 }}>
        Información de despacho
      </Text>
      <View style={{ marginTop: 20 }}>
        <InputSetDeliveryArea
          value={state.form.delivery_area}
          errors={state.form.errors?.delivery_area}
          onChange={(delivery_area) => {
            changeHandler('delivery_area', delivery_area);
          }}
        />
        <InputSetDeliveryTime
          value={state.form.delivery_time}
          errors={state.form.errors?.delivery_time}
          onChange={(delivery_time) => {
            changeHandler('delivery_time', delivery_time);
          }}
        />
        <InputSetOpeningHours
          value={state.form.opening_hours}
          errors={state.form.errors?.opening_hours}
          onChange={(opening_hours) => {
            changeHandler('opening_hours', opening_hours);
          }}
        />
      </View>

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
    </View>
  );
};
