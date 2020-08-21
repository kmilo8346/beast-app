import React, { useReducer } from 'react';
import { GestureResponderEvent, Vibration } from 'react-native';
import validate from 'validate.js';

// components
import Button from '../../../../../../components/buttons/button';
import Input from '../../../../../../components/inputs/input';
import InputPlaceAutocomplete from '../../../../../../components/inputs/input-place-autocomplete';
// types
import { Place } from '../../../../../../types';
// constraints
import constraints from './constraints';
// styles
import globalStyle from '../../../../../../styles';

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
  view: 'FORM' | 'AUTOCOMPLETE';
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
  view: 'FORM' | 'AUTOCOMPLETE';
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

export interface AddAddressFormProps {
  onAdd: (address: Place) => void;
}

export default ({ onAdd }: AddAddressFormProps) => {
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

  // event handlers
  const changeHandler = (attribute: string, value: any) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value' });
  };
  const openAutomcompleteHandler = () => {
    dispatch({ type: 'change_view', view: 'AUTOCOMPLETE' });
  };
  const closeAutomcompleteHandler = () => {
    dispatch({ type: 'change_view', view: 'FORM' });
  };
  const saveHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    // set submitted
    dispatch({ type: 'set_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      return;
    }
    onAdd({ ...state.form.address, apartment: state.form.apartment } as Place);
  };

  // render logic
  let apartment = null;
  let button = null;

  if (state.view === 'FORM') {
    apartment = (
      <Input
        placeholder="1009"
        label="Departamento"
        value={state.form.apartment}
        onChangeText={(text) => {
          changeHandler('apartment', text);
        }}
      />
    );
    button = (
      <Button
        title="Agregar"
        onPress={saveHandler}
        style={globalStyle.withMainActionAir}
      />
    );
  }

  return (
    <>
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
      {button}
    </>
  );
};
