import React, { useReducer, useCallback, useEffect } from 'react';
import { ScrollView, View, Image, GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';

// components
import Touchable from '../../../components/touchable';
import Text from '../../../components/text';
import ButtonIcon from '../../../components/buttons/button-icon';
import TagImage from '../../../components/svgs/images/tag-blue';
import MoneyHandlingImage from '../../../components/svgs/images/handling-money';
import AddCircleBlueIcon from '../../../components/svgs/icons/add-circle-blue';
import StopwatchIcon from '../../../components/svgs/icons/stopwatch';
// seller components
import DashboardShorcut from '../components/shortcut';
// local components
import DashboardLink from './components/link';
import MercadopagoLink from './components/link-mercadopago';
// libs
import cloudinary from '../../../lib/cloudinary';
import * as utils from '../../../lib/utils';
// types
import { LoggedUser } from '../../../types';
// cache
import userCache from '../../../cache/user';
import storeCache from '../../../cache/store';
import OrdersInProgressCache, {
  OrdersInProgressCacheData,
} from '../../../cache/orders-in-progress-cache';
import ordersInProgressCacheManager from '../../../cache/orders-in-progress-cache-manager';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

// instances outside component
const prefix = '[seller dashboard screen]';

type SetUserAction = {
  type: 'set_user';
  user: LoggedUser;
};
type SetOrdersInProgressCacheAction = {
  type: 'set_orders_in_progress_cache';
  cache: OrdersInProgressCache;
};
type SetInProgressQtyAction = {
  type: 'set_in_progress_qty';
  qty: number;
};
type Action =
  | SetUserAction
  | SetOrdersInProgressCacheAction
  | SetInProgressQtyAction;
type State = {
  user: LoggedUser;
  orders_in_progress_cache?: OrdersInProgressCache;
  in_progress_qty?: number;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_user':
      return { ...state, user: action.user };
    case 'set_orders_in_progress_cache':
      return { ...state, orders_in_progress_cache: action.cache };
    case 'set_in_progress_qty':
      return { ...state, in_progress_qty: action.qty };
    default:
      return state;
  }
};

export interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    user: userCache.getData() as LoggedUser,
  });
  if (!state.user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const store = storeCache.getData();
  if (!store) {
    throw new Error(`${prefix} Store must be defined`);
  }
  if (!store.images) {
    throw new Error(`${prefix} Store images must be defined`);
  }
  const insets = useSafeAreaInsets();

  // event handlers
  const instanceOrdersInProgressCache = async (user: string) => {
    const cache = await ordersInProgressCacheManager.get(user);
    dispatch({ type: 'set_orders_in_progress_cache', cache });
  };

  const pressAddProductHandler = () => {
    navigation.navigate('CreateOrUpdateProduct');
  };

  const pressSelectOrCreateStoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('SelectOrCreateStore');
  };

  const requestNotificationPermisions = async () => {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      console.log(
        `${prefix} Notification permision current status, status ${existingStatus}`
      );
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );
        console.log(
          `${prefix} Notification permision status after request the user, status ${status}`
        );
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = userCache.onChange((user) => {
        dispatch({ type: 'set_user', user: user as LoggedUser });
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
                type: 'set_in_progress_qty',
                qty: data.orders.reduce((qty, order) => {
                  if (
                    order.transaction.store.user === data.user &&
                    order.transaction.store.id === store.id
                  ) {
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

  useEffect(() => {
    requestNotificationPermisions();
  }, []);

  // render logic
  const image = store.images[0];
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.white,
        paddingTop: insets.top,
      }}
    >
      <ScrollView style={[globalStyles.withPadding]}>
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 10,
          }}
        >
          <Touchable
            style={{
              flexDirection: 'row',
              flex: 1,
            }}
            onPress={() => {
              navigation.navigate('UpdateStoreInfo');
            }}
          >
            <Image
              source={{
                uri: cloudinary.dynamicUrl(image, 'w_50,h_50,c_scale'),
              }}
              style={{
                height: 50,
                width: 50,
                borderRadius: 30,
              }}
            />
            <View
              style={{
                marginLeft: 15,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                }}
              >
                <Text
                  level={2}
                  weight="bold"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ marginBottom: 2, marginRight: 3 }}
                >
                  {store.name}
                </Text>
              </View>
              <Text level={5} color={colors.blackLight2}>
                Editar datos de tienda
              </Text>
            </View>
          </Touchable>
          <ButtonIcon
            icon="list"
            style={{ alignSelf: 'center' }}
            onPress={pressSelectOrCreateStoreHandler}
          />
        </View>

        <MercadopagoLink />

        <DashboardLink
          image={<TagImage />}
          title="Mis productos"
          onPress={() => {
            navigation.navigate('MyProducts', { type: 'product' });
          }}
        />
        <DashboardLink
          image={<MoneyHandlingImage />}
          title="Mis ventas"
          onPress={() => {
            navigation.navigate('MySales', { view: 'HISTORICAL' });
          }}
        />
      </ScrollView>
      <View
        style={[
          { position: 'absolute', left: 0, right: 0, bottom: 0 },
          globalStyles.withMargin,
        ]}
      >
        <DashboardShorcut
          // image={addProductOrServiceImage}
          image={<AddCircleBlueIcon />}
          title="Agregar producto"
          onPress={pressAddProductHandler}
          style={{ marginBottom: 12 }}
        />
        <DashboardShorcut
          // image={salesInProgressImage}
          image={<StopwatchIcon />}
          title="Ventas en curso"
          counter={state.in_progress_qty}
          style={{ marginBottom: 12 }}
          onPress={() => {
            navigation.navigate('MySales', { view: 'IN_PROGRESS' });
          }}
        />
      </View>
    </View>
  );
};
