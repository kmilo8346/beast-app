import React, { useReducer } from 'react';
import {
  View,
  TextStyle,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';

// components
import { Touchable, Text, Badge } from '../../../components';
// local components
import { InProgressList } from './components';
// types
import { SearchResponse, Order } from '../../../types';
// styles
import colors from '../../../styles/colors';
import globalStyles from '../../../styles';

// instances outside component
const prefix = '[my sales component]';
type MySalesView = 'IN_PROGRESS' | 'HISTORIC';
const views: MySalesView[] = ['IN_PROGRESS', 'HISTORIC'];
type ChangeViewAction = {
  type: 'change_view';
  view: MySalesView;
};
type SetInProgressOrders = {
  type: 'set_in_progress_orders';
  inProgressOrders: SearchResponse<Order>;
};
type Action = ChangeViewAction | SetInProgressOrders;
type State = {
  view: MySalesView;
  inProgressOrders?: SearchResponse<Order>;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_view':
      return { ...state, view: action.view };
    case 'set_in_progress_orders':
      return { ...state, inProgressOrders: action.inProgressOrders };
    default:
      return state;
  }
};

export interface MySalesProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: MySalesProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    view: route.params.view || 'IN_PROGRESS',
  });
  // precondition
  if (views.indexOf(state.view) === -1) {
    throw new Error(`${prefix} View not mapped, view: ${state.view}`);
  }

  // event handlers
  const pressTabHandler = (view: MySalesView) => {
    dispatch({ type: 'change_view', view });
  };

  // render logic
  let content = (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text level={5} weight="bold">
        Not implemented yet
      </Text>
    </View>
  );
  if (state.view === 'IN_PROGRESS') {
    content = (
      <InProgressList
        orders={state.inProgressOrders}
        onChange={(inProgressOrders: SearchResponse<Order>) => {
          dispatch({
            type: 'set_in_progress_orders',
            inProgressOrders,
          });
        }}
      />
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={{ flexDirection: 'row' }}>
        {views.map((key) => {
          let text = 'En Curso';
          const textSyle: StyleProp<TextStyle> = {
            color: colors.blackLight5,
          };
          const tabStyle: StyleProp<ViewStyle> = {};
          let badge = null;
          const badgeStyle: StyleProp<ViewStyle> = {
            marginLeft: 5,
            backgroundColor: colors.blackLight4,
          };
          if (key === 'HISTORIC') {
            text = 'Historial';
          }
          if (key === state.view) {
            textSyle.fontWeight = 'bold';
            textSyle.color = colors.black;

            tabStyle.borderBottomWidth = 3;
            tabStyle.borderBottomColor = colors.blue;

            badgeStyle.backgroundColor = colors.blue;
          }
          if (key === 'IN_PROGRESS' && state.inProgressOrders) {
            badge = (
              <Badge count={state.inProgressOrders.total} style={badgeStyle} />
            );
          }

          return (
            <Touchable
              key={key}
              onPress={(event: GestureResponderEvent) => {
                event.stopPropagation();
                pressTabHandler(key);
              }}
              style={[
                {
                  flex: 1,
                  paddingHorizontal: 10,
                  paddingVertical: 15,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                tabStyle,
              ]}
            >
              <Text level={5} style={textSyle}>
                {text}
              </Text>
              {badge}
            </Touchable>
          );
        })}
      </View>
      {content}
    </View>
  );
};
