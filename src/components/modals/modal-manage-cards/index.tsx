import React, { useState } from 'react';
import { View } from 'react-native';

// components
import Modal, { ModalProps } from '../modal';
import SelectFriendly, { Option } from '../../select-friendly';
// local components
import { AddPaymentForm } from './components';
// containers
import UserProvider from '../../../containers/user';
// types
import { Card } from '../../../types';
// styles
import globalStyle from '../../../styles';

export default (props: ModalProps) => {
  // state
  const [isFormVisible, setIsFormVisible] = useState(false);
  const userContainer = UserProvider.useContainer();
  const cards = userContainer.getCards();
  const currentCard = userContainer.getCurrentCard();
  let currentKey = currentCard ? currentCard.id : currentCard;
  if (currentKey === null) {
    currentKey = 'TO_AGREE';
  }
  // event handlers
  const addHandler = (card: Card) => {
    userContainer.addCard(card);
    userContainer.setCurrentCard(card);
    setIsFormVisible(false);
  };
  const selectHandler = (key: string) => {
    if (key === 'TO_AGREE') {
      userContainer.setCurrentCard(null);
      return;
    }
    const match = userContainer.getCards().find((card) => card.id === key);
    userContainer.setCurrentCard(match as Card);
  };
  const deleteHandler = (key: string) => {
    userContainer.deleteCard(key);
    userContainer.setCurrentCard(null);
  };
  const addOptionHandler = () => {
    setIsFormVisible(true);
  };

  // render logic
  let title = 'Selecciona un medio de pago';
  const options: Option[] = [
    {
      key: 'TO_AGREE',
      title: 'A convenir',
      subtitle: 'El vendedor se comunicará contigo',
      readonly: true,
    },
  ];
  cards.forEach((card) => {
    options.push({
      key: card.id,
      title: 'Tarjeta de crédito',
      subtitle: `Terminada en ${card.lastFourDigits}`,
    });
  });
  let content = (
    <View>
      <SelectFriendly
        value={currentKey}
        options={options}
        addMessage="Agrega otro medio de pago"
        onSelect={selectHandler}
        onDelete={deleteHandler}
        onAdd={addOptionHandler}
        style={{ marginBottom: 20 }}
      />
    </View>
  );

  if (isFormVisible) {
    content = <AddPaymentForm onAdd={addHandler} />;
    title = 'Agrega tarjeta de crédito';
  }

  return (
    <Modal {...props} title={title}>
      <View style={[globalStyle.withMargin]}>{content}</View>
    </Modal>
  );
};
