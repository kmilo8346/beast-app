import React, { useState, useEffect } from 'react';
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
  let key = currentCard;
  if (key === null) {
    key = 'TO_AGREE';
  }

  // event handlers
  const addHandler = (card: Card) => {
    userContainer.addCard(card);
    setIsFormVisible(false);
  };
  const selectHandler = (key: string) => {
    if (key === 'TO_AGREE') {
      userContainer.setCurrentCard(null);
      return;
    }
    userContainer.setCurrentCard(key);
  };
  const deleteHandler = (key: string) => {
    userContainer.deleteCard(key);
  };
  const addOptionHandler = () => {
    setIsFormVisible(true);
  };
  useEffect(() => {
    if (typeof key === 'undefined') {
      userContainer.setCurrentCard(null);
    }
  }, [key]);

  // render logic
  let title = 'Agrega tarjeta de crédito';
  let content = <AddPaymentForm onAdd={addHandler} />;

  if (!isFormVisible && currentCard) {
    title = 'Selecciona un medio de pago';
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
    content = (
      <View>
        <SelectFriendly
          value={currentCard}
          options={options}
          addMessage="Agrega otro medio de pago"
          onSelect={selectHandler}
          onDelete={deleteHandler}
          onAdd={addOptionHandler}
          style={{ marginBottom: 20 }}
        />
      </View>
    );
  }

  return (
    <Modal {...props} title={title}>
      <View style={[globalStyle.withMargin]}>{content}</View>
    </Modal>
  );
};
