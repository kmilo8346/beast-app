import React, { useRef } from 'react';
import { View } from 'react-native';

// components
import {
  Container,
  Text,
  Button,
  InputSelectDeliveryTime,
  Toast,
  IToast,
} from '../../../components';
// styles
import globalStyles from '../../../styles';

export interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // state
  const toastRef = useRef<IToast>(null);
  // event handlers
  const pressContinueHandler = () => {};
  // render logic
  return (
    <Container withPadding>
      <Text level={2} weight="bold" style={{ marginBottom: 10 }}>
        Información de despacho
      </Text>
      <InputSelectDeliveryTime />
      <View
        style={[
          { position: 'absolute', left: 0, right: 0, bottom: 0 },
          globalStyles.withMargin,
        ]}
      >
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        <Button
          title="Continuar"
          onPress={pressContinueHandler}
          style={globalStyles.withMainActionAir}
        />
      </View>
    </Container>
  );
};
