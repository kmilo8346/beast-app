import React, { useState, ReactNode } from 'react';
import {
  View,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';

// components
import Touchable from '../../../../components/touchable';
import Text from '../../../../components/text';
import Icon from '../../../../components/icon';
// home components
import ModalManageAddress from '../modal-manage-address';
// types
import { AddressInfo } from '../../../../types';
import colors from '../../../../styles/colors';

// instances outside component
const prefix = '[select address component]';

interface ComponentProps {
  value: AddressInfo;
  processing?: boolean;
  style?: StyleProp<ViewStyle>;
  onChange: (value: AddressInfo) => void;
}

export default ({
  value,
  processing = false,
  style,
  onChange,
}: ComponentProps) => {
  // state
  const [isVisible, setIsVisible] = useState(false);
  const address = value.addresses.find(
    (address) => address.id === value.current_address
  );
  if (!address) {
    throw new Error(
      `${prefix} Current address not match any address, current: ${value.current_address}`
    );
  }

  // event handlers
  const pressSelectHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    setIsVisible(true);
  };

  const modalChangeHandler = (value: AddressInfo) => {
    setIsVisible(false);
    onChange(value);
  };

  // render logic
  let text = `Enviar a ${address.route.short_name} ${address.street_number.short_name}`;
  if (address.apartment) {
    text += ` · ${address.apartment}`;
  }
  let icon: ReactNode = <Icon name="chevron-down" />;
  if (processing) {
    icon = <ActivityIndicator size="small" color={colors.black} />;
  }
  return (
    <View style={style}>
      <Touchable
        style={{ flexDirection: 'row', alignItems: 'center' }}
        onPress={pressSelectHandler}
      >
        <Text
          level={7}
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginRight: 5 }}
        >
          {text}
        </Text>
        {icon}
      </Touchable>
      {isVisible && (
        <ModalManageAddress value={value} onChange={modalChangeHandler} />
      )}
    </View>
  );
};
