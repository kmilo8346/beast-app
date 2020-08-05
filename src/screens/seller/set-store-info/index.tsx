import React, { useReducer, useRef, useEffect } from 'react';
import { View, ScrollView, Vibration } from 'react-native';

// components
import {
  Container,
  Text,
  Input,
  Button,
  Toast,
  IToast,
  InputImages,
} from '../../../components';
// clients
import userClient from '../../../clients/user-client';
// containers
import UserProvider from '../../../containers/user';
// libs
import { generatePushID } from '../../../lib/uuid';
import validate from '../../../lib/validate';
// constraints
import constraints from './constraints';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

// instances outside component
const prefix = '[set store info screen]';

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
  const [state, dispatch] = useReducer(reducer, {
    form: {
      // fields
      name: '',
      images: [],
      // other form states
      submitted: false,
    },
  });
  const toastRef = useRef<IToast>(null);
  const userContainer = UserProvider.useContainer();
  const user = userContainer.get();
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const store = user.store;

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
        'store.version': new Date().getTime(),
      },
      version
    );
    // mark end of submit
    dispatch({ type: 'set_submit_op_id', opId: version });
  };

  useEffect(() => {
    // if not store initilized, initialized one with default values
    if (!store) {
      userClient.update(
        user.id,
        {
          'store.id': generatePushID(),
          'store.phone': user.phone,
          'store.version': new Date().getTime(),
        },
        new Date().getTime()
      );
    }
  }, []);

  useEffect(() => {
    if (
      state.form.submitOpId === user.version &&
      store &&
      store.name &&
      store.images
    ) {
      navigation.navigate('SetStoreDeliveryInfo');
    }
  }, [state.form.submitOpId, store, store?.name, store?.images]);

  // render logic
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView style={[{ flex: 1 }, globalStyles.withPadding]}>
        <Text level={2} weight="bold" style={{ marginBottom: 10 }}>
          Información de tienda
        </Text>
        <Text level={5} style={{ marginBottom: 30, lineHeight: 23 }}>
          Te pediremos algúnos datos necesarios para crear tu tienda
        </Text>
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
          tip="Agrega la imagen de tu tienda para que tus clientes te identifiquen."
          path={`stores/${store?.id}/images/\${}`}
          value={store?.images}
          errors={state.form.errors?.images}
          onChange={(images) => {
            changeHandler('images', images);
          }}
        />
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
    </View>
  );
};
