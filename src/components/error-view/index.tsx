import React from 'react';
import { View } from 'react-native';

// components
import Text from '../text';
import Button from '../buttons/button';
import ManWithBokenPhoneImage from '../svgs/images/man-with-broken-phone';
// styles
import globalStyles from '../../styles/index';

export interface ErrorProps {
  onRetry?: () => void;
}

export default ({ onRetry = () => null }: ErrorProps) => {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ flex: 1 }} />
      <ManWithBokenPhoneImage />
      <Text level={6} weight="bold" style={{ marginBottom: 15, marginTop: 40 }}>
        Ocurrió un error inesperado
      </Text>
      <Text level={6} style={{ marginBottom: 10 }}>
        El error fue registrado para su solución
      </Text>
      <View style={{ flex: 1 }} />
      <View
        style={[
          {
            left: 0,
            right: 0,
            bottom: 0,
          },
          globalStyles.withMargin,
        ]}
      >
        <Button
          title="Reintentar"
          type="link"
          style={globalStyles.withMainActionAir}
          onPress={onRetry}
        />
      </View>
    </View>
  );
};
