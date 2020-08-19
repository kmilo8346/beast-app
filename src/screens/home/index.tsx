import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// components
import { Text } from '../../components';
// cache
import userCache from '../../cache/user';
// types
import { LoggedUser } from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component
const prefix = '[home screen]';

export interface Props {
  navigation: any;
}

export default ({ navigation }: Props) => {
  // state
  const user = userCache.getData();
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  if (!user.current_address || !user.addresses.length) {
    throw new Error(`${prefix} User address info must be defined`);
  }
  const insets = useSafeAreaInsets();

  // render logic
  let message = '¡Hola!';
  if (userCache.isLogged()) {
    const logged = user as LoggedUser;
    message = `¡Hola ${logged.first_name}!`;
  }
  return (
    <View
      style={[
        { flex: 1, backgroundColor: colors.white, paddingTop: insets.top },
        globalStyles.withPadding,
      ]}
    >
      <Text level={2} weight="bold">
        {message}
      </Text>
    </View>
  );
};
