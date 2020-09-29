import React, { useReducer, useRef } from 'react';
import { View, ScrollView, Vibration } from 'react-native';
import Constants from 'expo-constants';

// components
import Text from '../../../components/text';
import Input from '../../../components/inputs/input';
import Button from '../../../components/buttons/button';
import Toast, { IToast } from '../../../components/toast';
import InputImages from '../../../components/inputs/input-images';
// cache
import userCache from '../../../cache/user';
import storeCache from '../../../cache/store';
// libs
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
type Action =
  | ChangeValueAction
  | ValidateValueAction
  | SetFormSubmittedAction
  | SetFormErrorsAction;
type State = {
  form: {
    // fields
    name?: string;
    images?: string[];
    // other form states
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
  const toastRef = useRef<IToast>(null);
  const user = userCache.getData();
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const store = storeCache.getData();
  if (!store) {
    throw new Error(`${prefix} Store must be in cache`);
  }

  // events handlers
  const changeHandler = (attribute: string, value: any) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
  };

  const pressContinueHandler = async () => {
    dispatch({ type: 'set_form_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      return;
    }
    // update store cache
    storeCache.updateData({
      name: state.form.name,
      images: state.form.images,
    });
    navigation.navigate('SetStoreDeliveryInfo');
  };

  // render logic
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView style={[{ flex: 1 }, globalStyles.withPadding]}>
        <Text level={2} weight="bold" style={{ marginBottom: 10 }}>
          Información de tienda
        </Text>
        <Text level={5} style={{ marginBottom: 30, lineHeight: 23 }}>
          Te pediremos algunos datos necesarios para crear tu tienda
        </Text>
        <Input
          placeholder="Minimarket Don Juan"
          label="Nombre de tienda"
          value={state.form.name}
          errors={state.form.errors?.name}
          lengthCounter
          maxLength={30}
          onChangeText={(text) => {
            changeHandler('name', text);
          }}
        />
        <InputImages
          size={1}
          label="Imagen"
          tip="Agrega la imagen de tu tienda para que tus clientes te identifiquen."
          path={`beast/${Constants.manifest.extra.BEAST_ENVIRONMENT}/stores/${store.reference}/\${}`}
          value={state.form.images}
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
