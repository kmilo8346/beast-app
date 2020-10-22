import React, { ReactNode } from 'react';
import { View, GestureResponderEvent, ActivityIndicator } from 'react-native';

// components
import Touchable from '../../../../../components/touchable';
import Icon from '../../../../../components/icon';
import Text from '../../../../../components/text';
import Divider from '../../../../../components/divider';
// styles
import styles from './styles';
import colors from '../../../../../styles/colors';

export interface Props {
  name: string;
  description?: string;
  processing?: boolean;
  onPress: (event: GestureResponderEvent) => void;
}

export default ({
  name,
  description = '',
  processing = false,
  onPress,
}: Props) => {
  // render logic
  let descriptionComponent: ReactNode | null = null;
  if (description) {
    descriptionComponent = (
      <Text level={6} color={colors.blackLight3} style={styles.description}>
        {description}
      </Text>
    );
  }
  let iconComponent = <Icon name="chevron-right" />;
  if (processing) {
    iconComponent = <ActivityIndicator size="small" color={colors.black} />;
  }
  return (
    <Touchable
      style={{ borderWidth: 0, height: 85, justifyContent: 'center' }}
      onPress={onPress}
    >
      <View
        style={{
          borderWidth: 0,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text level={4} style={styles.name}>
            {name}
          </Text>
          {descriptionComponent}
        </View>
        <View style={styles.iconContainer}>{iconComponent}</View>
      </View>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <Divider />
      </View>
    </Touchable>
  );
};
