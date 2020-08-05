import React, { useReducer, useRef, useEffect } from 'react';
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
// clients
import userClient from '../../../clients/user-client';
// libs
import validate from '../../../lib/validate';
// containers
import UserProvider from '../../../containers/user';
// constraints
import constraints from './constraints';
// styles
import globalStyles from '../../../styles';
import { IntegerRange, OpeningHours, DeliveryArea } from '../../../types';

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
type SetSubmitOpIdAction = {
  type: 'set_submit_op_id';
  opId: number;
};
type Action =
  | ChangeValueAction
  | ValidateValueAction
  | SetSubmittedAction
  | SetFormErrorsAction
  | SetSubmitOpIdAction;
type State = {
  form: {
    // fields;
    deliveryArea?: DeliveryArea;
    deliveryTime?: IntegerRange;
    openingHours?: OpeningHours;
    // hidden field

    // other states
    submitted: boolean;
    // identify the submit
    submitOpId?: number;
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
    case 'set_submit_op_id':
      return {
        ...state,
        form: { ...state.form, submitOpId: action.opId },
      };
    default:
      return state;
  }
};

export interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // state
  const userContainer = UserProvider.useContainer();
  const user = userContainer.get();
  // preconditions
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const store = user.store;
  if (!store || !store.name || !store.images) {
    throw new Error(
      `${prefix} Store must be initialized and must have name and images`
    );
  }
  const [state, dispatch] = useReducer(reducer, {
    form: {
      // fields
      deliveryArea: store?.deliveryArea,
      deliveryTime: store?.deliveryTime,
      openingHours: store?.openingHours,
      // hidden fields

      // other form states
      submitted: false,
    },
  });
  const toastRef = useRef<IToast>(null);

  // event handlers
  const changeHandler = (attribute: string, value: any) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
  };
  const pressContinueHandler = () => {
    // set submitted
    dispatch({ type: 'set_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      return;
    }
    // update store
    const version = new Date().getTime();
    userClient.update(
      user.id,
      {
        'store.deliveryArea': state.form.deliveryArea,
        'store.deliveryTime': state.form.deliveryTime,
        'store.openingHours': state.form.openingHours,
        'store.version': new Date().getTime(),
      },
      version
    );
    // mark end of submit
    dispatch({ type: 'set_submit_op_id', opId: version });
  };
  useEffect(() => {
    if (
      state.form.submitOpId === user.version &&
      store.deliveryArea &&
      store.deliveryTime &&
      store.openingHours
    ) {
      navigation.navigate('MercadoPagoSignIn');
    }
  }, [
    state.form.submitOpId,
    store.deliveryArea,
    store.deliveryTime,
    store.openingHours,
  ]);
  // render logic
  return (
    <Container withPadding>
      <Text level={2} weight="bold" style={{ marginBottom: 10 }}>
        Información de despacho
      </Text>
      <View style={{ marginTop: 20 }}>
        <InputSetDeliveryArea
          value={state.form.deliveryArea}
          errors={state.form.errors?.deliveryArea}
          onChange={(deliveryArea) => {
            changeHandler('deliveryArea', deliveryArea);
          }}
        />
        <InputSetDeliveryTime
          value={state.form.deliveryTime}
          errors={state.form.errors?.deliveryTime}
          onChange={(deliveryTime) => {
            changeHandler('deliveryTime', deliveryTime);
          }}
        />
        <InputSetOpeningHours
          value={state.form.openingHours}
          errors={state.form.errors?.openingHours}
          onChange={(openingHours) => {
            changeHandler('openingHours', openingHours);
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
    </Container>
  );
};
