import React, { useReducer } from 'react';
import { View } from 'react-native';

// components
import Modal, { ModalProps } from '../modal';
import Button from '../../buttons/button';
import Input from '../../inputs/input';
import Text from '../../text';
// types
import { IntegerRange } from '../../../types';
// libs
import validate from '../../../lib/validate';
// constraints
import constraints from './constraints';
// styles
import globalStyle from '../../../styles';

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
type SetError = {
  type: 'set_error';
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
  | SetError
  | SetSubmittedAction
  | SetFormErrorsAction;
type State = {
  form: {
    // fields
    lte: string;
    gte: string;

    // other states
    submitted: boolean;
    errors: { [key: string]: string[] };
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
    default:
      return state;
  }
};

// TODO: validate min < max
// TODO: format to avoid text

export interface ModalManageDeliveryTimeProps extends ModalProps {
  deliveryTime?: IntegerRange;
  onSave: (deliveryTime: IntegerRange) => void;
}

export default ({
  deliveryTime,
  onSave = () => null,
  ...otherProps
}: ModalManageDeliveryTimeProps) => {
  // state

  const [state, dispatch] = useReducer(reducer, {
    form: {
      // fields
      lte: deliveryTime ? `${deliveryTime.lte}` : '',
      gte: deliveryTime ? `${deliveryTime.gte}` : '',

      // other form states
      submitted: false,
      errors: {},
    },
  });

  // event handlers
  const changeHandler = (attribute: string, value: string) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
  };
  const saveHandler = () => {
    // set submitted
    dispatch({ type: 'set_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      return;
    }

    onSave({
      lte: parseInt(state.form.lte, 10),
      gte: parseInt(state.form.gte, 10),
    });
  };

  // render logic
  return (
    <Modal {...otherProps} title="Tiempo de entrega">
      <View style={[globalStyle.withMargin]}>
        <Text level={5} style={{ marginBottom: 20 }}>
          Agrega el tiempo mínimo y maximo que puedes llegar a tardar al momento
          de entregar una venta.
        </Text>
        <Input
          placeholder="Tiempo mínimo"
          keyboardType="number-pad"
          value={state.form.lte}
          errors={state.form.errors?.lte}
          onChangeText={(text) => {
            changeHandler('lte', text);
          }}
        />
        <Input
          placeholder="Tiempo máximo"
          keyboardType="number-pad"
          value={state.form.gte}
          errors={state.form.errors?.gte}
          onChangeText={(text) => {
            changeHandler('gte', text);
          }}
        />
        <Button
          title="Guardar"
          onPress={saveHandler}
          style={globalStyle.withMainActionAir}
        />
      </View>
    </Modal>
  );
};
