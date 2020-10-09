import React, {
  useReducer,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react';
import {
  View,
  FlatList,
  GestureResponderEvent,
  Image,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios, { CancelTokenSource } from 'axios';
import Constants from 'expo-constants';

// components
import Text from '../../components/text';
import Touchable from '../../components/touchable';
import Button from '../../components/buttons/button';
import SleepingCatImage from '../../components/svgs/images/sleeping-cat';
import Bone from '../../components/bone';
// screen components
import ShoppingCartIcon from '../components/shopping-cart-icon';
// clients
import storeClient from '../../clients/store-client';
// libs
import { capture } from '../../lib/sentry';
import durationFormatter from '../../lib/formatters/duration-formatter';
import cloudinary from '../../lib/cloudinary';
// cache
import userCache from '../../cache/user';
// types
import { User, Place, SearchResponse, Store } from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component
const prefix = '[stores screen]';
let fetchRequestSource: CancelTokenSource;
const defaultSize = 10;

type SetUserAction = {
  type: 'set_user';
  user: User;
};
type ResetAction = {
  type: 'reset';
};
type SetStoresAction = {
  type: 'set_stores';
  stores: SearchResponse<Store>;
};
type SetErrorAction = {
  type: 'set_error';
  error: Error;
};
type SetRefreshingAction = {
  type: 'set_refreshing';
  refreshing: boolean;
};
type SetFetchingMoreAction = {
  type: 'set_fetching_more';
  fetching_more: boolean;
};
type Action =
  | SetUserAction
  | ResetAction
  | SetStoresAction
  | SetErrorAction
  | SetRefreshingAction
  | SetFetchingMoreAction;
type State = {
  user: User;
  stores?: SearchResponse<Store>;
  error?: Error;
  refreshing: boolean;
  fetching_more: false;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_user':
      return { ...state, user: action.user };
    case 'reset':
      return { ...state, stores: undefined, error: undefined };
    case 'set_stores':
      return { ...state, stores: action.stores };
    case 'set_error':
      return { ...state, error: action.error };
    case 'set_refreshing':
      return { ...state, refreshing: action.refreshing };
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
    user: userCache.getData() as User,
    refreshing: false,
    fetching_more: false,
  });
  if (!state.user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const address = userCache.getAddress();
  let addressInfo;
  if (state.user.current_address && state.user.addresses?.length) {
    addressInfo = {
      current_address: state.user.current_address,
      addresses: state.user.addresses,
    };
  }

  // event handlers
  const fetch = async (
    filters?: { [key: string]: any },
    from = 0,
    size = defaultSize
  ) => {
    if (fetchRequestSource) {
      fetchRequestSource.cancel();
    }
    fetchRequestSource = axios.CancelToken.source();
    const response = await storeClient.search(
      {
        filters,
        from,
        size,
      },
      fetchRequestSource.token
    );
    return response;
  };

  const load = async () => {
    try {
      dispatch({ type: 'reset' });
      const response = await fetch({
        location: (address as Place).geometry.location,
      });
      dispatch({
        type: 'set_stores',
        stores: {
          ...response,
          from: response.from + response.hits.length,
        },
      });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Load error', error);

        dispatch({ type: 'set_error', error });
      }
    }
  };

  const refresh = async () => {
    try {
      dispatch({ type: 'set_refreshing', refreshing: true });
      const response = await fetch({
        location: (address as Place).geometry.location,
      });
      dispatch({
        type: 'set_stores',
        stores: {
          ...response,
          from: response.from + response.hits.length,
        },
      });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Refresh error', error);

        dispatch({ type: 'set_error', error });
      }
    } finally {
      dispatch({ type: 'set_refreshing', refreshing: false });
    }
  };

  const fetchMore = async () => {
    if (!state.stores) {
      throw new Error(`${prefix} To fetch more must be state stores`);
    }
    try {
      dispatch({ type: 'set_fetching_more', fetching_more: true });
      const response = await fetch(
        state.stores.filters,
        state.stores.from,
        state.stores.size
      );
      dispatch({
        type: 'set_stores',
        stores: {
          ...response,
          from: response.from + response.hits.length,
          hits: [...state.stores.hits, ...response.hits],
        },
      });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Fetch more error', error);

        dispatch({ type: 'set_error', error });
      }
    } finally {
      dispatch({ type: 'set_fetching_more', fetching_more: false });
    }
  };

  const pressCreateStoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('SellerStack');
  };

  const pressItemHandler = (store: Store) => {
    navigation.navigate('StoreV2', { store });
  };

  const retryHandler = () => {
    if (!state.stores) {
      load();
    } else {
      fetchMore();
    }
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
    if (state.user.current_address && state.user.addresses?.length) {
      load();
    }
  }, [state.user.current_address, state.user.addresses]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <ShoppingCartIcon style={{ marginRight: 20 }} />,
    });
  }, []);

  // render logic

  // error
  if (state.error) {
    return (
      <View
        style={[
          {
            flex: 1,
            backgroundColor: colors.white,
            justifyContent: 'center',
            alignItems: 'center',
          },
          globalStyles.withPadding,
        ]}
      >
        <Text level={6} weight="bold" style={{ marginBottom: 15 }}>
          Ocurrió un error inesperado
        </Text>
        <Text level={6} style={{ marginBottom: 10 }}>
          El error fue registrado para su solución
        </Text>
        <Button title="Reintentar" type="link" onPress={retryHandler} />
      </View>
    );
  }

  // loading
  if (!state.stores) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.white }}>
        <View style={globalStyles.withMargin}>
          <Bone height={200} borderRadius={20} marginBottom={15} />
          <Bone width={200} marginLeft={15} marginBottom={12} />
          <Bone width={168} marginLeft={15} marginBottom={15} />
        </View>
        <View style={globalStyles.withMargin}>
          <Bone height={200} borderRadius={20} marginBottom={15} />
          <Bone width={200} marginLeft={15} marginBottom={12} />
          <Bone width={168} marginLeft={15} marginBottom={15} />
        </View>
      </View>
    );
  }

  // not data
  if (!state.stores?.hits.length) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.white,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <SleepingCatImage />
        <Text
          level={6}
          style={{
            marginTop: 20,
            marginBottom: 20,
            textAlign: 'center',
            width: 320,
          }}
        >
          En este momento no hay tiendas{' '}
          <Text level={6} weight="bold">
            {' '}
            abiertas
          </Text>{' '}
          en tu zona.
        </Text>
        <Text
          level={5}
          weight="bold"
          style={{ marginBottom: 40, textAlign: 'center' }}
        >
          ¡Inténtalo de nuevo más tarde!
        </Text>
        <Button
          title="¡O, crea tu tienda hoy!"
          type="link"
          onPress={pressCreateStoreHandler}
        />
      </View>
    );
  }

  // data
  return (
    <FlatList
      data={state.stores.hits}
      refreshing={state.refreshing}
      ListHeaderComponent={
        <Image
          source={{
            uri: Constants.manifest.extra.ASSET_BANNER,
          }}
          style={{
            width: '100%',
            height: 67,
            borderRadius: 8,
            marginBottom: 15,
          }}
        />
      }
      keyExtractor={(item: Store) => item.id}
      renderItem={({ item }) => {
        const image = item.images[0];
        const imageSize = Dimensions.get('window').width - 40;
        const timeText = durationFormatter.humanizeDurationRange(
          item.delivery_time.gte,
          item.delivery_time.lte
        );
        return (
          <Touchable
            style={{
              backgroundColor: colors.white,
              borderRadius: 20,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.18,
              shadowRadius: 1.0,

              elevation: 1,
            }}
            onPress={() => {
              pressItemHandler(item);
            }}
          >
            <Image
              source={{ uri: cloudinary.dynamicUrl(image, 'h_500') }}
              style={{
                width: imageSize,
                height: 200,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}
            />
            <View
              style={{
                paddingLeft: 15,
                paddingTop: 15,
                paddingBottom: 15,
                paddingRight: 15,
              }}
            >
              <Text
                level={4}
                weight="bold"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ flex: 1, marginBottom: 2 }}
              >
                {item.name}
              </Text>
              <Text
                level={6}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ flex: 1, marginBottom: 2 }}
              >
                {timeText}
              </Text>
            </View>
          </Touchable>
        );
      }}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      ListFooterComponent={<View style={globalStyles.withScreenAir} />}
      onRefresh={refresh}
      onEndReached={() => {
        if (state.stores && state.stores.from < state.stores.total) {
          fetchMore();
        }
      }}
      style={[
        { flex: 1, backgroundColor: colors.white, paddingTop: 7 },
        globalStyles.withPadding,
      ]}
    />
  );
};
