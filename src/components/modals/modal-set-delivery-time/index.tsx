import React, { useReducer } from 'react';
import { View, GestureResponderEvent } from 'react-native';

// components
import Modal, { ModalProps } from '../modal';
import Button from '../../buttons/button';
import Input from '../../inputs/input';
import Text from '../../text';
// types
import { IntegerRange } from '../../../types';
// libs
import validate from '../../../lib/validate';
import stringFormatter from '../../../lib/formatters/string-formatter';
// constraints
import constraints from './constraints';
// styles
import globalStyle from '../../../styles';

// extending validate validators
validate.validators.lessThanMax = (
  _value: any,
  _options: any,
  _key: any,
  attributes: { [key: string]: any }
) => {
  if (parseInt(attributes.gte, 10) < parseInt(attributes.lte, 10)) {
    return null;
  }
  return '^Mínimo debe ser menor que el máximo';
};

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
  const saveHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
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
        <Text
          level={5}
          weight="light"
          style={{ marginBottom: 30, lineHeight: 23 }}
        >
          Agrega el rango de tiempo en{' '}
          <Text level={5} weight="bold">
            minutos
          </Text>{' '}
          que puedes tardar al hacer una entrega.
        </Text>
        <Input
          label="Tiempo mínimo"
          placeholder="ej: 10"
          keyboardType="number-pad"
          value={state.form.gte}
          errors={state.form.errors?.gte}
          onChangeText={(text) => {
            if (text.length < 4) {
              changeHandler('gte', text);
            }
          }}
        />
        <Input
          label="Tiempo máximo"
          placeholder="ej: 40"
          keyboardType="number-pad"
          value={state.form.lte}
          format={stringFormatter.toNumber}
          errors={state.form.errors?.lte}
          onChangeText={(text) => {
            if (text.length < 4) {
              changeHandler('lte', text);
            }
          }}
        />

        <Button
          title="Continuar"
          onPress={saveHandler}
          style={globalStyle.withMainActionAir}
        />
      </View>
    </Modal>
  );
};
