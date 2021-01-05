import React, { useEffect, useReducer, ReactNode } from 'react';
import { View, ScrollView, Image } from 'react-native';

// components
import Input from '../components/input';

import BagHeadImage from '../../components/svgs/images/bag-head';
// cache
import userCache from '../../cache/user';
// types
import { User } from '../../types';
// styles
import globalStyles from '../../styles';
import colors from '../../styles/colors';

// instances outside component

type SetUserAction = {
  type: 'set_user';
  user: User;
};
type Action = SetUserAction;
type State = {
  user: User;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_user':
      return { ...state, user: action.user };
    default:
      return state;
  }
};

interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(
    reducer,
    (() => {
      const user = userCache.getData() as User;
      return {
        user,
      };
    })()
  );

  // event handlers
  const pressPhotoHandler = () => {
    navigation.navigate('SetUserPhoto', {
      id: state.user.id,
      photo_url: state.user.photo_url,
    });
  };

  const pressNameHandler = () => {
    navigation.navigate('SetUserFirstName', {
      id: state.user.id,
      first_name: state.user.first_name,
    });
  };

  const pressLastNameHandler = () => {
    navigation.navigate('SetUserLastName', {
      id: state.user.id,
      last_name: state.user.last_name,
    });
  };

  const pressEmailHandler = () => {
    navigation.navigate('SetUserEmail', {
      id: state.user.id,
      email: state.user.email,
    });
  };

  useEffect(() => {
    const unsubscribe = userCache.onChange((user) => {
      dispatch({ type: 'set_user', user: user as User });
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // render logic
  const images = state.user.photo_url ? [state.user.photo_url] : [];
  let photoComponent: ReactNode = <BagHeadImage />;
  if (state.user.photo_url) {
    photoComponent = (
      <Image
        source={{ uri: images[0] }}
        style={{ width: 107, height: 107, borderRadius: 10 }}
      />
    );
  }
  return (
    <ScrollView
      style={[
        { flex: 1, backgroundColor: colors.white, paddingTop: 15 },
        globalStyles.withPadding,
      ]}
    >
      <Input
        label="Perfil"
        value={photoComponent}
        placeholder="Añadir foto"
        onPress={pressPhotoHandler}
      />
      <Input
        label="Nombre"
        value={state.user.first_name}
        placeholder="Añadir nombre"
        onPress={pressNameHandler}
      />
      <Input
        label="Apellido"
        value={state.user.last_name}
        placeholder="Tu apellido"
        onPress={pressLastNameHandler}
      />
      <Input
        label="Email"
        value={state.user.email}
        placeholder="Añadir email"
        onPress={pressEmailHandler}
      />

      <View style={globalStyles.withScreenAir} />
    </ScrollView>
  );
};
