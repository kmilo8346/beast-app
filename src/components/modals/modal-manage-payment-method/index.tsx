import React, { useReducer } from 'react';
import { View } from 'react-native';

import { Payment } from '../../../types';
import { AddPaymentForm } from './components';
import Button from '../../buttons/button';
import Modal, { ModalProps } from '../modal';
import SelectFriendly from '../../select-friendly';

import globalStyle from '../../../styles';

type AddPaymentAction = { type: 'add_payment'; payment: Payment };
type SelectPaymentAction = { type: 'select_payment'; key: string };
type DeletePaymentAction = { type: 'delete_payment'; key: string };
type SetShowAddAction = { type: 'set_show_add_card'; showAddCard: boolean };
type Action =
  | AddPaymentAction
  | SelectPaymentAction
  | DeletePaymentAction
  | SetShowAddAction;

type State = {
  currentPayment: Payment;
  payments: Payment[];
  showAddCard: boolean;
};

const reducer = (state: State, action: Action): State => {
  let currentPayment: Payment | undefined;
  let payments;
  let found = false;
  switch (action.type) {
    case 'add_payment':
      currentPayment = state.currentPayment;
      payments = [...state.payments];
      payments = payments.map((payment) => {
        if (payment.id === action.payment.id) {
          found = true;
          if (currentPayment?.id === action.payment.id) {
            // replace current address
            currentPayment = action.payment;
          }
          // replace in addresses
          return action.payment;
        }
        return payment;
      });
      if (!found) {
        payments.push(action.payment);
      }
      return {
        ...state,
        currentPayment,
        payments,
      };
    case 'select_payment':
      currentPayment = state.payments.find(
        (payment) => payment.id === action.key
      );
      if (currentPayment) {
        return { ...state, currentPayment };
      }
      return state;
    case 'delete_payment':
      payments = state.payments.filter((payment) => payment.id !== action.key);
      [currentPayment] = payments;
      return { ...state, currentPayment, payments };
    case 'set_show_add_card':
      return { ...state, showAddCard: action.showAddCard };
    default:
      return state;
  }
};

export interface ModalManagePaymentProps extends ModalProps {
  currentPayment: Payment;
  payments: Payment[];
  onSave: (currentPayment: Payment, payments: Payment[]) => void;
}

export default ({
  payments,
  currentPayment,
  onSave,
  ...modalProps
}: ModalManagePaymentProps) => {
  const [state, dispatch] = useReducer(reducer, {
    payments,
    currentPayment,
    showAddCard: true,
  });

  const addHandler = (payment: Payment) => {
    try {
      if (!state.payments?.length) {
        onSave(payment, [payment]);
      } else {
        dispatch({ type: 'add_payment', payment });
      }
    } catch (error) {
      //
    } finally {
      dispatch({ type: 'set_show_add_card', showAddCard: false });
    }
  };

  const saveHandler = () => {
    onSave(state.currentPayment, state.payments);
  };

  let title = 'Agrega tarjeta de crédito';
  let content = <AddPaymentForm onAdd={addHandler} />;

  if (state.payments?.length && !state.showAddCard) {
    title = 'Selecciona un medio de pago';

    const options = state.payments.map((payment) => ({
      key: payment.id,
      title:
        payment.type === 'Efectivo' ? 'Efectivo' : `Tarjeta de ${payment.type}`,
      subtitle:
        payment.type === 'Efectivo'
          ? 'Paga al recibir el pedido'
          : `Terminada en ${payment.cardNumber.slice(-4)}`,
    }));
    content = (
      <View>
        <SelectFriendly
          dontDeleteOne
          value={state.currentPayment.id}
          options={options}
          addMessage="Agrega otro medio de pago"
          onSelect={(key) => {
            dispatch({ type: 'select_payment', key });
          }}
          onDelete={(key) => {
            dispatch({ type: 'delete_payment', key });
          }}
          onAdd={() => {
            dispatch({ type: 'set_show_add_card', showAddCard: true });
          }}
          style={{ marginBottom: 20 }}
        />
        <Button
          title="Guardar"
          onPress={saveHandler}
          style={globalStyle.withMainActionAir}
        />
      </View>
    );
  }
  return (
    <Modal {...modalProps} title={title}>
      <View style={[globalStyle.withMargin]}>{content}</View>
    </Modal>
  );
};
