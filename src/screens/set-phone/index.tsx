import React, { useReducer } from 'react';
import { View, Vibration, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// components
import Text from '../../components/text';
import Input from '../../components/inputs/input';
import Button from '../../components/buttons/button';
// libs
import validate from '../../lib/validate';
// cache
import userCache from '../../cache/user';
// constraints
import constraints from './constraints';
// styles
import globalStyles from '../../styles';
import colors from '../../styles/colors';

// instances outside component
const prefix = '[set phone screen]';

type ChangePhoneAction = { type: 'change_phone'; phone: string };
type ValidatePhoneAction = {
  type: 'validate_phone';
  phone: string;
};
type SetFormSubmittedAction = {
  type: 'set_form_submitted';
};
type SetFormErrorsAction = {
  type: 'set_form_errors';
  errors: { [key: string]: string[] };
};
type Action =
  | ChangePhoneAction
  | ValidatePhoneAction
  | SetFormSubmittedAction
  | SetFormErrorsAction;
type State = {
  form: {
    // fields
    phone: string;
    // other states
    submitted: boolean;
    errors?: { [key: string]: string[] };
  };
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_phone':
      return {
        ...state,
        form: { ...state.form, phone: action.phone },
      };
    case 'validate_phone':
      if (!state.form.submitted) return state;

      return {
        ...state,
        form: {
          ...state.form,
          errors: validate.single(state.form.phone, constraints.phone),
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
  const insets = useSafeAreaInsets();
  // state
  const [state, dispatch] = useReducer(reducer, {
    form: {
      phone: '',
      submitted: false,
    },
  });
  const user = userCache.getData();
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }

  // event handlers
  const changePhoneHandler = (phone: string) => {
    dispatch({ type: 'change_phone', phone });
    dispatch({ type: 'validate_phone', phone });
  };

  const submitHandler = async () => {
    dispatch({ type: 'set_form_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      Vibration.vibrate(400);
      dispatch({ type: 'set_form_errors', errors });
      return;
    }
    navigation.navigate('VerifyPhone', {
      ...route.params,
      phone: `+56${state.form.phone}`,
    });
  };

  // render logic
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView style={[{ flex: 1 }, globalStyles.withPadding]}>
        <Text level={2} weight="bold" style={{ marginBottom: 10 }}>
          Teléfono móvil
        </Text>
        <Text level={5} style={{ marginBottom: 60 }}>
          Ingresa tu número de teléfono
        </Text>
        <Input
          placeholder="Número de teléfono móvil"
          label=""
          keyboardType="phone-pad"
          returnKeyType="done"
          autoFocus
          format={(text: string | undefined): string | undefined => {
            if (!text) return undefined;

            let result = text;
            // space 1
            if (result.length > 1)
              result = [result.slice(0, 1), ' ', result.slice(1)].join('');

            // space 2
            if (result.length > 6)
              result = [result.slice(0, 6), ' ', result.slice(6)].join('');
            return result;
          }}
          parse={(text: string): string => text.replace(/ /g, '')}
          prefix={
            <Text level={6} style={{ color: colors.black, marginLeft: 10 }}>
              +56
            </Text>
          }
          value={state.form.phone}
          errors={state.form.errors?.phone}
          onChangeText={changePhoneHandler}
          containerStyle={{ marginBottom: 30 }}
          onSubmitEditing={submitHandler}
        />
      </ScrollView>
      <View
        style={[
          { position: 'absolute', left: 0, right: 0, bottom: 0 },
          globalStyles.withMargin,
          { paddingBottom: insets.bottom },
        ]}
      >
        <Button
          title="Continuar"
          style={globalStyles.withMainActionAir}
          onPress={submitHandler}
        />
      </View>
    </View>
  );
};
