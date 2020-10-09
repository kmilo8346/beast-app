import React, { useState } from 'react';
import { Vibration, View } from 'react-native';

// constraints
import constraints from './constraints';
// components
import Modal from '../../../../../components/modals/modal';
import Text from '../../../../../components/text';
import Input from '../../../../../components/inputs/input';
import Button from '../../../../../components/buttons/button';
// libs
import stringFormatter from '../../../../../lib/formatters/string-formatter';
import stringParser from '../../../../../lib/parsers/string-parser';
import validate from '../../../../../lib/validate';
// types
import colors from '../../../../../styles/colors';
import globalStyles from '../../../../../styles';

interface ComponentProps {
  value?: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

export default ({ value, onChange, onClose }: ComponentProps) => {
  // state
  const [phone, setPhone] = useState<string | undefined>(value);
  const [errors, setErrors] = useState<string[]>([]);
  const [submited, setSubmited] = useState(false);

  // event handlers
  const submit = () => {
    setSubmited(true);
    // validate
    const errors = validate.single(phone, constraints.phone);
    if (errors) {
      Vibration.vibrate(400);
      setErrors(errors);
      return;
    }

    onChange(phone as string);
  };

  const requestCloseHandler = () => {
    onClose();
  };

  const changePhoneHandler = (phone: string) => {
    setPhone(phone);
    if (submited) {
      setErrors(validate.single(phone, constraints.phone));
    }
  };

  const submitEditingHandler = () => {
    submit();
  };

  const pressSaveHandler = () => {
    submit();
  };

  return (
    <Modal onRequestClose={requestCloseHandler} title="Teléfono móvil">
      <View style={globalStyles.withMargin}>
        <Text
          level={5}
          weight="light"
          style={{ lineHeight: 23, marginBottom: 30 }}
        >
          Ingresa tu número de teléfono, puede que el vendedor necesite
          comunicarse.
        </Text>
        <Input
          autoFocus
          returnKeyType="done"
          keyboardType="phone-pad"
          placeholder="Número de teléfono móvil"
          format={stringFormatter.toPhone}
          parse={stringParser.fromPhone}
          prefix={
            <Text level={6} style={{ color: colors.black, marginLeft: 10 }}>
              +56
            </Text>
          }
          value={phone}
          errors={errors}
          onChangeText={changePhoneHandler}
          containerStyle={{ marginBottom: 30 }}
          onSubmitEditing={submitEditingHandler}
        />
        <Button
          title="Guardar"
          style={globalStyles.withMainActionAir}
          onPress={pressSaveHandler}
        />
      </View>
    </Modal>
  );
};
