import React, { ReactNode, useState, useRef } from 'react';
import {
  View,
  TextInputProps,
  TextInput,
  StyleProp,
  ViewStyle,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  GestureResponderEvent,
} from 'react-native';

// components
import Icon from '../../icon';
import Button from '../../buttons/button';
import Text from '../../text';
// libs
import * as utils from '../../../lib/utils';
// styles
import colors from '../../../styles/colors';

export interface SearchProps extends TextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
  onActivated?: () => void;
  onDeactivated?: () => void;
}

export default ({
  containerStyle,
  onActivated = utils.noop,
  onDeactivated = utils.noop,
  ...otherProps
}: SearchProps) => {
  // state
  const [activated, setActivated] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // event handlers
  const focusHandler = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    otherProps.onFocus && otherProps.onFocus(e);
    setActivated(true);
    onActivated();
  };

  const pressCancelHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    otherProps.onChangeText && otherProps.onChangeText('');
    setActivated(false);
    onDeactivated();
  };

  // render logic
  let cancelButton: ReactNode | null = null;
  if (activated) {
    cancelButton = (
      <Button
        type="link"
        title={
          <Text level={7} weight="bold" color={colors.blue}>
            Cancelar
          </Text>
        }
        onPress={pressCancelHandler}
        style={{ paddingHorizontal: 0, paddingLeft: 10 }}
      />
    );
  }
  return (
    <View style={[{ flexDirection: 'row' }, containerStyle]}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.blackLight6,
          borderRadius: 13,
          paddingHorizontal: 10,
          paddingVertical: 10,
        }}
      >
        <Icon name="search" color={colors.blackLight3} />
        <TextInput
          {...otherProps}
          clearButtonMode="always"
          ref={inputRef}
          onFocus={focusHandler}
          style={[{ flex: 1, marginLeft: 10 }, otherProps.style]}
        />
      </View>
      {cancelButton}
    </View>
  );
};
