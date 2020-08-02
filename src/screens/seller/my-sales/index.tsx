import React, { useReducer, useEffect } from 'react';
import {
  View,
  TextStyle,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';

// components
import { Touchable, Text, Badge } from '../../../components';
// local components
import { InProgressList, HistoricalList } from './components';
// types
import { SearchResponse, Order } from '../../../types';
// styles
import colors from '../../../styles/colors';
import { navigate } from '../../../lib/root-navigation';

// instances outside component
const prefix = '[my sales component]';
type MySalesView = 'IN_PROGRESS' | 'HISTORICAL';
const views: MySalesView[] = ['IN_PROGRESS', 'HISTORICAL'];
type ChangeViewAction = {
  type: 'change_view';
  view: MySalesView;
};
type SetInProgressOrders = {
  type: 'set_in_progress_orders';
  inProgressOrders?: SearchResponse<Order>;
};
type SetHistoricalOrders = {
  type: 'set_historical_orders';
  historicalOrders?: SearchResponse<Order>;
};
type Action = ChangeViewAction | SetInProgressOrders | SetHistoricalOrders;
type State = {
  view: MySalesView;
  inProgressOrders?: SearchResponse<Order>;
  historicalOrders?: SearchResponse<Order>;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_view':
      return { ...state, view: action.view };
    case 'set_in_progress_orders':
      return { ...state, inProgressOrders: action.inProgressOrders };
    case 'set_historical_orders':
      return { ...state, historicalOrders: action.historicalOrders };
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
  const reload = route.params.reload;
  const isFocused = useIsFocused();
  // precondition
  if (views.indexOf(state.view) === -1) {
    throw new Error(`${prefix} View not mapped, view: ${state.view}`);
  }

  // event handlers
  const pressTabHandler = (view: MySalesView) => {
    dispatch({ type: 'change_view', view });
  };
  const pressInProgressItemHandler = (order: Order) => {
    navigation.navigate('SaleDetails', {
      sale: order,
    });
  };
  useEffect(() => {
    if (isFocused && reload) {
      dispatch({ type: 'set_in_progress_orders', inProgressOrders: undefined });
      dispatch({ type: 'set_historical_orders', historicalOrders: undefined });
    }
  }, [isFocused, reload]);

  // render logic
  let content = (
    <HistoricalList
      orders={state.historicalOrders}
      onChange={(historicalOrders: SearchResponse<Order>) => {
        dispatch({
          type: 'set_historical_orders',
          historicalOrders,
        });
      }}
      onPressItem={pressInProgressItemHandler}
    />
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
        onPressItem={pressInProgressItemHandler}
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
          if (key === 'HISTORICAL') {
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
