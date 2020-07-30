import React, { useReducer, useRef, useEffect } from 'react';
import { View, ScrollView, Vibration } from 'react-native';
import validate from 'validate.js';

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
// containers
import UserProvider from '../../../containers/user';
// libs
import { generatePushID } from '../../../lib/uuid';
// constraints
import constraints from './constraints';
// styles
import globalStyles from '../../../styles';

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
  const user = userContainer.getUser();
  const store = userContainer.getStore();

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
    userContainer.updateStore({
      name: state.form.name,
      images: state.form.images,
    });
    // mark end of submit
    dispatch({ type: 'set_submit_op_id' });
  };

  useEffect(() => {
    // if not store initilized, initialized one with default values
    if (!store) {
      userContainer.updateStore({
        id: generatePushID(),
        phone: user?.phone,
      });
    }
  }, []);

  useEffect(() => {
    if (state.form.submitOpId && store && store.name && store.images) {
      navigation.navigate('SetStoreDeliveryInfo');
    }
  }, [state.form.submitOpId, store, store?.name, store?.images]);

  // render logic

  return (
    <Container>
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
          label="Imágen"
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
    </Container>
  );
};
