import React, { useCallback, useReducer, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';

// navigation
import HomeStackScreen from './home-stack';
import SellerStackScreen from './seller-stack';
import MenuStackScreen from './menu-stack';
// components
import Icon from '../components/icon';
import Text from '../components/text';
// cache
import userCache from '../cache/user';
import OrdersInProgressCache, {
  OrdersInProgressCacheData,
} from '../cache/orders-in-progress-cache';
import ordersInProgressCacheManager from '../cache/orders-in-progress-cache-manager';
// libs
import * as utils from '../lib/utils';
// types
import { User } from '../types';
// styles
import colors from '../styles/colors';
import { TextStyle } from 'react-native';

type SetUserAction = {
  type: 'set_user';
  user: User;
};
type SetOrdersInProgressCacheAction = {
  type: 'set_orders_in_progress_cache';
  cache: OrdersInProgressCache;
};
type SetSalesInProgressQtyAction = {
  type: 'set_sales_in_progress_qty';
  qty: number;
};
type Action =
  | SetUserAction
  | SetOrdersInProgressCacheAction
  | SetSalesInProgressQtyAction;
type State = {
  user: User;
  orders_in_progress_cache?: OrdersInProgressCache;
  sales_in_progress_qty?: number;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_user':
      return { ...state, user: action.user };
    case 'set_orders_in_progress_cache':
      return { ...state, orders_in_progress_cache: action.cache };
    case 'set_sales_in_progress_qty':
      return { ...state, sales_in_progress_qty: action.qty };
    default:
      return state;
  }
};
const MainTab = createBottomTabNavigator();

export default () => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    user: userCache.getData() as User,
  });

  // event handlers
  const instanceOrdersInProgressCache = async (user: string) => {
    const cache = await ordersInProgressCacheManager.get(user);
    dispatch({ type: 'set_orders_in_progress_cache', cache });
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = userCache.onChange((user) => {
        dispatch({ type: 'set_user', user: user as User });
      });
      return () => {
        unsubscribe();
      };
    }, [])
  );

  useEffect(() => {
    if (state.user.id) {
      instanceOrdersInProgressCache(state.user.id);
    }
  }, [state.user.id]);

  useFocusEffect(
    useCallback(() => {
      let unsubscribe: () => void = utils.noop;
      if (state.orders_in_progress_cache) {
        unsubscribe = state.orders_in_progress_cache.onChange(
          (data: OrdersInProgressCacheData | undefined) => {
            if (data) {
              dispatch({
                type: 'set_sales_in_progress_qty',
                qty: data.orders.reduce((qty, order) => {
                  if (order.transaction.store.user === data.user) {
                    return qty + 1;
                  }
                  return qty;
                }, 0),
              });
            }
          }
        );
      }
      return () => {
        unsubscribe();
      };
    }, [state.orders_in_progress_cache])
  );

  // render logic
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => {
        return {
          tabBarIcon: ({ color, size }) => {
            let name;
            switch (route.name) {
              case 'SellerStack':
                name = 'tag';
                break;
              case 'MenuStack':
                name = 'menu';
                break;
              default:
                name = 'home';
                break;
            }
            return <Icon name={name} size={size} color={color} />;
          },
          tabBarLabel: ({ position }) => {
            let text;
            switch (route.name) {
              case 'SellerStack':
                text = 'Vender';
                break;
              case 'MenuStack':
                text = 'Más';
                break;
              default:
                text = 'Inicio';
                break;
            }

            let style: TextStyle = {};
            if (position === 'beside-icon') {
              style = { marginLeft: 20, marginTop: 3 };
            }

            return (
              <Text level={8} style={style}>
                {text}
              </Text>
            );
          },
        };
      }}
      tabBarOptions={{
        activeTintColor: colors.blue,
        inactiveTintColor: colors.black,
        style: { paddingTop: 2 },
      }}
      initialRouteName="HomeStack"
    >
      <MainTab.Screen name="HomeStack" component={HomeStackScreen} />
      <MainTab.Screen
        name="SellerStack"
        component={SellerStackScreen}
        options={{
          tabBarBadge:
            state.sales_in_progress_qty && state.sales_in_progress_qty > 0
              ? state.sales_in_progress_qty
              : undefined,
        }}
      />
      <MainTab.Screen name="MenuStack" component={MenuStackScreen} />
    </MainTab.Navigator>
  );
};
