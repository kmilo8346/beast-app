import React, { useState } from 'react';
import { View } from 'react-native';

// components
import InputSelect from '../input-select';
import ModalManagePayment from '../../modals/modal-manage-payment';
// containers
import UserProvider from '../../../containers/user';

export default () => {
  const [isVisible, setIsVisible] = useState(false);
  const userContainer = UserProvider.useContainer();

  const currentPayment = userContainer.getCurrentPayment();
  const payments = userContainer.getPayments();

  let text = 'Selecciona un medio de pago';
  if (currentPayment) {
    text = currentPayment.type === 'Efectivo' ? 'Paga en efectivo al recibir o añade tarjeta' :
      `Tarjeta de ${currentPayment.type} terminada en ${currentPayment.cardNumber.slice(-4)}`;
  }
  return (
    <View>
      <InputSelect
        text={text}
        onPress={() => {
          setIsVisible(true);
        }}
      />
      {isVisible && (
        <ModalManagePayment
          currentPayment={currentPayment}
          payments={payments}
          onSave={(currentPayment, payments) => {
            userContainer.setCurrentPayment(currentPayment);
            userContainer.setPayments(payments);
            setIsVisible((prevIsVisible) => !prevIsVisible);
          }}
          onRequestClose={() => {
            setIsVisible((prevIsVisible) => !prevIsVisible);
          }}
        />
      )}
    </View>
  );
};
