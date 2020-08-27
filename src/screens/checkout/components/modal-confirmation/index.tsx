import React, { useReducer } from 'react';
import { View, TextInput, Image } from 'react-native';
import validate from 'validate.js';

// components
import Modal, { ModalProps } from '../../../../components/modals/modal';
import Button from '../../../../components/buttons/button';
import Text from '../../../../components/text';
// types
import { Card } from '../../../../types';
// constraints
import constraints from './constraints';
// styles
import globalStyles from '../../../../styles';
import colors from '../../../../styles/colors';

// instances outside component
const securityCodeHintImage = require('../../../../../assets/sercurity_code_hint.png');

type ChangeSecurityCodeAction = {
  type: 'change_security_code';
  securityCode: string;
};
type ValidateSecurityCodeAction = {
  type: 'validate_security_code';
  securityCode: string;
};
type SetFormSubmittedAction = {
  type: 'set_form_submitted';
};
type SetFormErrorsAction = {
  type: 'set_form_errors';
  errors: { [key: string]: string[] };
};
type Action =
  | ChangeSecurityCodeAction
  | ValidateSecurityCodeAction
  | SetFormSubmittedAction
  | SetFormErrorsAction;
type State = {
  form: {
    // fields
    securityCode: string;
    // other states
    submitted: boolean;
    errors?: { [key: string]: string[] };
  };
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_security_code':
      return {
        ...state,
        form: { ...state.form, securityCode: action.securityCode },
      };
    case 'validate_security_code':
      if (!state.form.submitted) return state;

      return {
        ...state,
        form: {
          ...state.form,
          errors: validate.single(
            state.form.securityCode,
            constraints.securityCode
          ),
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

export interface ModalSecurityCodeProps extends ModalProps {
  card?: Card;
  onConfirm: (securityCode?: string) => void;
}

export default ({
  card,
  onConfirm = () => null,
  ...otherProps
}: ModalSecurityCodeProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    form: {
      securityCode: '',
      submitted: false,
    },
  });

  // event handlers
  const changeSecurityCodeHandler = (securityCode: string) => {
    dispatch({ type: 'change_security_code', securityCode });
    dispatch({ type: 'validate_security_code', securityCode });
  };
  const confirmHandler = () => {
    if (!card) {
      onConfirm();
      return;
    }
    dispatch({ type: 'set_form_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      return;
    }
    onConfirm(state.form.securityCode);
  };

  // render logic
  let title = 'Confirma tu compra';
  let content = (
    <Text
      level={6}
      numberOfLines={2}
      style={{ lineHeight: 23, marginBottom: 40 }}
    >
      El vendedor te contactará para convenir el medio de pago
    </Text>
  );
  if (card) {
    title = 'Confirma con tu código';
    content = (
      <>
        <Text
          level={6}
          numberOfLines={2}
          style={{ lineHeight: 23, marginBottom: 20 }}
        >
          Agrega el código de seguridad para la{' '}
          <Text level={6} weight="bold">
            {`Tarjeta de Crédito ${card.paymentMethod.name} terminada ${card.lastFourDigits}`}
          </Text>
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 30,
          }}
        >
          <View>
            <TextInput
              placeholder="CVV"
              value={state.form.securityCode}
              onChangeText={changeSecurityCodeHandler}
              keyboardType="numeric"
              autoFocus
              style={{
                borderWidth: 1,
                borderColor: colors.blackLight3,
                height: 30,
                width: 60,
                paddingHorizontal: 5,
                borderRadius: 5,
              }}
            />
            {!!state.form.errors?.securityCode && (
              <Text
                level={8}
                color={colors.red}
                style={{ marginTop: 3, marginLeft: 4 }}
              >
                {state.form.errors?.securityCode}
              </Text>
            )}
          </View>
          <Image
            source={securityCodeHintImage}
            style={{ marginLeft: 20, width: 30, height: 20 }}
          />
        </View>
      </>
    );
  }
  return (
    <Modal {...otherProps} title={title}>
      <View style={[globalStyles.withMargin]}>
        {content}
        <Button
          title="Confirmar"
          onPress={confirmHandler}
          style={globalStyles.withMainActionAir}
        />
      </View>
    </Modal>
  );
};
