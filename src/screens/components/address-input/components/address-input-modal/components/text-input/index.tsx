import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';

// components
import Icon from '../../../../../../../components/icon';
import Touchable from '../../../../../../../components/touchable';
import MapPinShadedBlueIcon from '../../../../../../../components/svgs/icons/map-pin-shaded-blue';
// styles
import colors from '../../../../../../../styles/colors';

interface ComponentProps {
  value?: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  onChange: (value: string) => void;
  onSubmit: (value?: string) => void;
}

export default ({
  value,
  loading,
  style,
  onChange,
  onSubmit,
}: ComponentProps) => {
  // event handlers
  const changeTextHandler = (text: string) => {
    onChange(text);
  };

  const pressClearHandler = () => {
    onChange('');
  };

  const submitHandler = () => {
    onSubmit(value);
  };

  // render logic
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      <View style={{ marginLeft: 5 }}>
        <MapPinShadedBlueIcon width={30} height={30} />
      </View>

      <TextInput
        autoFocus
        value={value}
        returnKeyType="search"
        placeholder="Ingresa nueva dirección"
        placeholderTextColor={colors.blackLight4}
        style={{
          flex: 1,
          alignSelf: 'center',
          marginLeft: 10,
          fontSize: 14,
          fontFamily: 'MonserratNormal',
        }}
        onChangeText={changeTextHandler}
        onSubmitEditing={submitHandler}
      />

      {!!loading && (
        <ActivityIndicator
          color={colors.blackLight3}
          style={{ alignSelf: 'center' }}
        />
      )}
      {!!value && !loading && (
        <Touchable style={{ alignSelf: 'center' }} onPress={pressClearHandler}>
          <Icon name="x-circle" color={colors.blackLight4} size={14} />
        </Touchable>
      )}
    </View>
  );
};
