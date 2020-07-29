import React, { useReducer, useRef } from 'react';
import { View, TextInput, Vibration, ScrollView } from 'react-native';
import validate from 'validate.js';
import { CommonActions } from '@react-navigation/native';

// components
import { Input, Button, Text, InputPlaceAutocomplete } from '../../components';
// containers
import UserProvider from '../../containers/user';
// types
import { Place } from '../../types';
// constraints
import constraints from './constraints';
// styles
import globalStyles from '../../styles';
import colors from '../../styles/colors';

type SetAddressView = 'FORM' | 'AUTOCOMPLETE';

type ChangeValueAction = {
  type: 'change_value';
  attribute: string;
  value: any;
};
type ValidateValueAction = {
  type: 'validate_value';
};
type ChangeViewAction = {
  type: 'change_view';
  view: SetAddressView;
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
  | ChangeViewAction
  | SetSubmittedAction
  | SetFormErrorsAction;

type State = {
  view: SetAddressView;
  form: {
    // fields
    address?: Place | undefined;
    apartment: string;

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
        form: {
          ...state.form,
          [action.attribute]: action.value,
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
    case 'change_view':
      return { ...state, view: action.view };
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
    view: 'FORM',
    form: {
      // fields
      address: undefined,
      apartment: '',

      // other states
      submitted: false,
    },
  });

  const userContainer = UserProvider.useContainer();
  const apartmentInput = useRef<TextInput>(null);

  // event handlers
  const changeHandler = (attribute: string, value: any) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value' });
  };
  const openAutomcompleteHandler = () => {
    dispatch({ type: 'change_view', view: 'AUTOCOMPLETE' });
    // TODO: Dejar solo el input
  };
  const closeAutomcompleteHandler = () => {
    dispatch({ type: 'change_view', view: 'FORM' });
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
    userContainer.addAddress({
      ...state.form.address,
      apartment: state.form.apartment,
    } as Place);
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: 'MainTab' }],
      })
    );
  };

  // render logic
  let text = null;
  let apartment = null;

  if (state.view === 'FORM') {
    text = (
      <Text
        level={5}
        style={{ marginBottom: 30, marginTop: 0, lineHeight: 25 }}
      >
        Usaremos tu dirección para mostrarte todo lo que hay cerca tuyo. Te
        sorprendería saber lo que se vende en tu edificio
      </Text>
    );
    apartment = (
      <Input
        ref={apartmentInput}
        placeholder="1009"
        label="Departamento"
        returnKeyType="done"
        onSubmitEditing={pressContinueHandler}
        value={state.form.apartment}
        onChangeText={(text) => {
          changeHandler('apartment', text);
        }}
      />
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView style={[{ flex: 1 }, globalStyles.withPadding]}>
        {text}
        <InputPlaceAutocomplete
          label="Dirección"
          placeholder="Jose Pedro Alessandri 927"
          value={state.form.address}
          onChange={(address) => {
            changeHandler('address', address);
          }}
          onOpen={openAutomcompleteHandler}
          onClose={closeAutomcompleteHandler}
          errors={state.form.errors?.address}
        />
        {apartment}
      </ScrollView>
      <View style={globalStyles.withMargin}>
        <Button
          title="Continuar"
          onPress={pressContinueHandler}
          style={globalStyles.withMainActionAir}
        />
      </View>
    </View>
  );
};
