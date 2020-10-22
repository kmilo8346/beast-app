import React, { useReducer } from 'react';
import { View } from 'react-native';

// components
import Text from '../../../components/text';
// styles
import colors from '../../../styles/colors';
import globalStyles from '../../../styles';

// instances outside component
const prefix = '[sales screen]';

type SetSomenthingAction = {
  type: 'set_something';
  something: string;
};
type Action = SetSomenthingAction;
type State = {
  something: string;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_something':
      return { ...state, something: action.something };
    default:
      return state;
  }
};

interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    something: 'My sales',
  });

  // event handlers

  // render logic
  return (
    <View
      style={[
        { flex: 1, backgroundColor: colors.white },
        globalStyles.withMargin,
      ]}
    >
      <Text>{state.something}</Text>
    </View>
  );
};
