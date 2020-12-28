import React, { useEffect, useReducer } from 'react';
import {
  GestureResponderEvent,
  Keyboard,
  ScrollView,
  Vibration,
  View,
} from 'react-native';

// constraints
import constraints from './constraints';
// components
import Text from '../../../components/text';
import Input from '../../../components/inputs/input';
import Button from '../../../components/buttons/button';
// libs
import validate from '../../../lib/validate';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

type ChangeValueAction = {
  type: 'change_value';
  name: string;
};
type ValidateValueAction = {
  type: 'validate_value';
  name: string;
};
type SetFormSubmittedAction = {
  type: 'set_form_submitted';
};
type SetFormErrorsAction = {
  type: 'set_form_errors';
  errors: { [key: string]: string[] };
};
type SetChangedAction = {
  type: 'set_changed';
  changed: boolean;
};
type Action =
  | ChangeValueAction
  | ValidateValueAction
  | SetFormSubmittedAction
  | SetFormErrorsAction
  | SetChangedAction;
type State = {
  form: {
    name: string;

    snapshot: string;
    changed: boolean;
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
          name: action.name,
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
    case 'set_form_submitted':
      return { ...state, form: { ...state.form, submitted: true } };
    case 'set_form_errors':
      return { ...state, form: { ...state.form, errors: action.errors } };
    case 'set_changed':
      return { ...state, form: { ...state.form, changed: action.changed } };
    default:
      return state;
  }
};

interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    form: {
      name: '',

      snapshot: '',
      changed: false,
      submitted: false,
    },
  });

  // event handlers
  const changeHandler = (name: string) => {
    dispatch({ type: 'change_value', name });
    dispatch({ type: 'validate_value', name });
  };

  const submit = () => {
    dispatch({ type: 'set_form_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      return;
    }

    navigation.navigate('CreateStoreWizzardSetImage', {
      name: state.form.name,
    });
  };

  const pressContinueHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    Keyboard.dismiss();
    submit();
  };

  const submitEditingHandler = () => {
    submit();
  };

  useEffect(() => {
    const changed = state.form.name !== state.form.snapshot;
    dispatch({ type: 'set_changed', changed });
  }, [state.form.name]);

  // render logic
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white }]}>
      <ScrollView style={[globalStyles.withPadding, { flex: 1 }]}>
        <Text
          level={2}
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginBottom: 10 }}
        >
          Nombre de la tienda
        </Text>
        <Text
          level={5}
          weight="light"
          style={{ marginBottom: 60, lineHeight: 23 }}
        >
          Agrega el nombre que indentifica a tu tienda.
        </Text>
        <Input
          autoFocus
          label="Nombre de la tienda"
          lengthCounter
          maxLength={30}
          placeholder="Colaciones express"
          value={state.form.name}
          errors={state.form.errors?.name}
          onChangeText={(text: string) => {
            changeHandler(text);
          }}
          onSubmitEditing={submitEditingHandler}
        />

        <View style={globalStyles.withScreenAir} />
      </ScrollView>
      <View style={[globalStyles.withMargin]}>
        <Button
          title="Continuar"
          disabled={!state.form.changed}
          style={globalStyles.withMainActionAir}
          onPress={pressContinueHandler}
        />
      </View>
    </View>
  );
};
