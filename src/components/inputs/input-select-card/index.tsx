import React, { useState, useCallback } from 'react';
import { View } from 'react-native';

// components
import InputSelect from '../input-select';
import ModalManagePayment from '../../modals/modal-manage-cards';
// containers
import UserProvider from '../../../containers/user';

export default () => {
  // state
  const [isVisible, setIsVisible] = useState(false);
  const userContainer = UserProvider.useContainer();
  const currentCardId = userContainer.getCurrentCard();
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
  let text = 'Selecciona un medio de pago';
  if (currentCardId === null) {
    text = 'El pago será convenir con el vendedor';
  } else if (currentCard) {
    text = `Tarjeta de Crédito terminada en ${currentCard.lastFourDigits}`;
  }
  return (
    <View>
      <InputSelect text={text} onPress={pressHandler} />
      {isVisible && <ModalManagePayment onRequestClose={requestCloseHandler} />}
    </View>
  );
};
