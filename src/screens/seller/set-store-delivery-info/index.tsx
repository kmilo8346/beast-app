import React, { useReducer, useRef, useEffect } from 'react';
import { View } from 'react-native';

// components
import {
  Container,
  Text,
  Button,
  InputSetDeliveryArea,
  InputSetDeliveryTime,
  Toast,
  IToast,
} from '../../../components';
// libs
import validate from '../../../lib/validate';
// containers
import UserProvider from '../../../containers/user';
// constraints
import constraints from './constraints';
// styles
import globalStyles from '../../../styles';
import { Circle, IntegerRange } from '../../../types';

// instances outside component
const PREFIX = '[set store delivery info screen]';

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
    deliveryArea?: Circle;
    deliveryTime?: IntegerRange;
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
        form: { ...state.form, submitOpId: new Date().getTime() },
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
  const store = userContainer.getStore();
  const [state, dispatch] = useReducer(reducer, {
    form: {
      // fields
      deliveryArea: store?.deliveryArea,
      deliveryTime: store?.deliveryTime,
      // hidden fields

      // other form states
      submitted: false,
    },
  });
  const toastRef = useRef<IToast>(null);
  // precondition
  if (!store || !store.name || !store.images) {
    throw new Error(
      `${PREFIX} Store must be initialized and must have name and images`
    );
  }

  // event handlers
  const changeHandler = (attribute: string, value: any) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
    userContainer.updateStore({
      [attribute]: value,
    });
  };
  const pressContinueHandler = () => {
    // set submitted
    dispatch({ type: 'set_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      return;
    }
    // update store
    userContainer.updateStore({
      deliveryArea: state.form.deliveryArea,
      deliveryTime: state.form.deliveryTime,
      // TODO: add opening hours
    });
    // mark end of submit
    dispatch({ type: 'set_submit_op_id' });
  };
  useEffect(() => {
    // TODO: add opening hours
    if (state.form.submitOpId && store.deliveryArea && store.deliveryTime) {
      navigation.navigate('MercadoPagoInfoBeforeSignIn');
    }
  }, [state.form.submitOpId, store.deliveryTime, store.deliveryTime]);
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
