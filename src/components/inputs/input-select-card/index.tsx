import React, { useState, useCallback } from 'react';
import { View } from 'react-native';

// components
import InputSelect from '../input-select';
import ModalManagePayment from '../../modals/modal-manage-cards';
// containers
import UserProvider from '../../../containers/user';

export interface InputSelectCardProps {
  errors?: string[];
}

export default ({ errors }: InputSelectCardProps) => {
  // state
  const [isVisible, setIsVisible] = useState(false);
  const userContainer = UserProvider.useContainer();
  const currentCardId = userContainer.getCurrentCardId();
  const cards = userContainer.getCards();
  const currentCard = cards.find((card) => card.id === currentCardId);

  // event handlers
  const pressHandler = useCallback(() => {
    setIsVisible(true);
  }, []);
  const requestCloseHandler = useCallback(() => {
    setIsVisible((prevIsVisible) => !prevIsVisible);
  }, []);

  // render logic
  let text = '';
  if (currentCardId === null) {
    text = 'A convenir con el vendedor';
  } else if (currentCard) {
    text = `Tarjeta de Crédito terminada en ${currentCard.lastFourDigits}`;
  }
  return (
    <View>
      <InputSelect
        label="Selecciona un medio de pago"
        value={text}
        onPress={pressHandler}
        errors={errors}
      />
      {isVisible && <ModalManagePayment onRequestClose={requestCloseHandler} />}
    </View>
  );
};
