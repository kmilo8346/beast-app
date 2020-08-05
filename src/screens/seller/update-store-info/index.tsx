import React, { useReducer, useEffect } from 'react';
import { View, ScrollView, Vibration } from 'react-native';

// components
import {
  Input,
  InputImages,
  Button,
  InputSetDeliveryArea,
  InputSetDeliveryTime,
  InputSetOpeningHours,
} from '../../../components';
// clients
import userClient from '../../../clients/user-client';
// containers
import UserProvider from '../../../containers/user';
// libs
import validate from '../../../lib/validate';
// constraints
import constraints from './constraints';
// types
import { IntegerRange, OpeningHours, DeliveryArea } from '../../../types';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';
// instances outside component

const prefix = '[update store info screen]';

type ChangeValueAction = {
  type: 'change_value';
  attribute: string;
  value: string;
};
type ValidateValueAction = {
  type: 'validate_value';
  attribute: string;
  value: string;
};
type SetFormSubmittedAction = {
  type: 'set_form_submitted';
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
  | SetFormSubmittedAction
  | SetFormErrorsAction
  | SetSubmitOpIdAction;
type State = {
  form: {
    // fields
    name: string;
    images: string[];
    deliveryArea?: DeliveryArea;
    deliveryTime?: IntegerRange;
    openingHours?: OpeningHours;
    // other form states
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
    case 'set_form_submitted':
      return {
        ...state,
        form: {
          ...state.form,
          submitted: true,
        },
      };
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
  if (
    !store ||
    !store.name ||
    !store.images ||
    !store.deliveryArea ||
    !store.deliveryTime ||
    !store.openingHours
  ) {
    throw new Error(`${prefix} Store must be defined`);
  }

  const [state, dispatch] = useReducer(reducer, {
    form: {
      // fields
      name: store.name,
      images: store.images,
      deliveryArea: store.deliveryArea,
      deliveryTime: store.deliveryTime,
      openingHours: store.openingHours,

      // other form states
      submitted: false,
    },
  });

  // events handlers
  const changeHandler = (attribute: string, value: any) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
  };

  const pressContinueHandler = () => {
    dispatch({ type: 'set_form_submitted' });
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
        'store.name': state.form.name,
        'store.images': state.form.images,
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
    if (state.form.submitOpId === user.version) {
      navigation.navigate('SellerDashboard');
    }
  }, [
    state.form.submitOpId,
    store.name,
    store.images,
    store.deliveryArea,
    store.deliveryTime,
    store.openingHours,
  ]);

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
          value={state.form.name}
          errors={state.form.errors?.name}
          onChangeText={(text) => {
            changeHandler('name', text);
          }}
        />
        <InputImages
          size={1}
          label="Imagen"
          path={`stores/${store?.id}/images/\${}`}
          value={state.form.images}
          errors={state.form.errors?.images}
          onChange={(images) => {
            changeHandler('images', images);
          }}
        />
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
        <View style={globalStyles.withScreenAir} />
      </ScrollView>
      <View
        style={[
          { position: 'absolute', left: 0, right: 0, bottom: 0 },
          globalStyles.withMargin,
        ]}
      >
        <Button
          title="Continuar"
          onPress={pressContinueHandler}
          style={globalStyles.withMainActionAir}
        />
      </View>
    </View>
  );
};
