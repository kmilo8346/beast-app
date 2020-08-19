import React, { useReducer, useEffect } from 'react';
import { View, GestureResponderEvent } from 'react-native';
import axios, { CancelTokenSource } from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';

// components
import {
  ErrorView,
  Loading,
  Text,
  Button,
  FlatList,
} from '../../../components';
// local components
import { StoreItem } from './components';
// seller components
import { Shortcut } from '../components';
// clients
import storeClient from '../../../clients/store-client';
import userClient from '../../../clients/user-client-v2';
// cache
import userCache from '../../../cache/user';
import storeCache from '../../../cache/store';
// types
import {
  PaymentProvider,
  DispatchProvider,
  SearchResponse,
  Store,
  LoggedUser,
} from '../../../types';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

const addImage = require('../../../../assets/icons/plus.png');

// instances outside component
const prefix = '[select or create store screen]';
const defaultSize = 10;
let fetchRequestSource: CancelTokenSource;

type SetStoresAction = {
  type: 'set_stores';
  stores: SearchResponse<Store>;
};
type SetErrorAction = {
  type: 'set_error';
  error: Error;
};
type SetFetchingMoreAction = {
  type: 'set_fetching_more';
  fetching_more: boolean;
};
type Action = SetStoresAction | SetErrorAction | SetFetchingMoreAction;
type State = {
  stores?: SearchResponse<Store>;
  error?: Error;
  fetching_more: boolean;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_stores':
      return {
        ...state,
        error: undefined,
        stores: action.stores,
      };
    case 'set_fetching_more':
      return {
        ...state,
        fetching_more: action.fetching_more,
      };
    default:
      return state;
  }
};

interface SelectStoreProps {
  navigation: any;
}

export default ({ navigation }: SelectStoreProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    fetching_more: false,
  });

  const user = userCache.getData() as LoggedUser;
  if (!user) {
    throw new Error(`${prefix} user must be defined`);
  }

  // event handlers
  const fetch = async (from = 0, size = defaultSize) => {
    if (fetchRequestSource) {
      fetchRequestSource.cancel();
    }
    fetchRequestSource = axios.CancelToken.source();
    const stores = await storeClient.search(
      {
        filters: {
          user: user.id,
        },
        from,
        size,
      },
      fetchRequestSource.token
    );
    return stores;
  };
  const load = async () => {
    try {
      const stores = await fetch();
      dispatch({
        type: 'set_stores',
        stores: {
          ...stores,
          from: stores.from + stores.hits.length,
        },
      });
    } catch (error) {
      if (!axios.isCancel(error)) {
        // TODO: Log error
        console.log(error);

        dispatch({ type: 'set_error', error });
      }
    }
  };
  const fetchMore = async () => {
    // precondition
    if (!state.stores) {
      console.warn(`${prefix} Cant call fetch more with stores undefined`);
      return;
    }
    try {
      dispatch({ type: 'set_fetching_more', fetching_more: true });
      const stores = await fetch(state.stores.from);
      dispatch({
        type: 'set_stores',
        stores: {
          ...stores,
          from: stores.from + stores.hits.length,
          hits: [...state.stores.hits, ...stores.hits],
        },
      });
    } catch (error) {
      if (!axios.isCancel(error)) {
        // TODO: Log error
        console.log(error);

        dispatch({ type: 'set_error', error });
      }
    } finally {
      dispatch({ type: 'set_fetching_more', fetching_more: false });
    }
  };
  const retryHandler = () => {
    if (!state.stores) {
      load();
    } else {
      fetchMore();
    }
  };
  const createStoreHandler = async () => {
    storeCache.replaceData({
      user: user.id,
      phone: user.phone as string,
      payment_provider: PaymentProvider.MERCADOPAGO,
      dispatch_provider: DispatchProvider.OWNER,
    });
    navigation.navigate('SetStoreInfo');
  };
  const pressItemHandler = async (store: Store) => {
    // TODO: handler error
    await userClient.update({
      pathVars: { id: user.id },
      body: {
        current_store: store.id,
      },
    });
    storeCache.setData(store);
    navigation.replace('SellerDashboard');
  };
  useEffect(() => {
    load();
  }, []);

  // render logic
  if (state.error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.white,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ErrorView onRetry={retryHandler} />
      </View>
    );
  }

  if (!state.stores) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.white,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Loading message="Cargando..." />
      </View>
    );
  }

  if (!state.stores.hits.length) {
    return (
      <View
        style={[
          {
            flex: 1,
            backgroundColor: colors.blue,
            justifyContent: 'center',
            alignItems: 'center',
          },
          globalStyles.withPadding,
        ]}
      >
        <View>
          <Text
            level={1}
            weight="bold"
            style={{ color: colors.white, marginBottom: 25 }}
          >
            !Vende con nosotros¡
          </Text>
          <Text level={4} style={{ color: colors.white }}>
            Aquí podrás crear una tienda para ofrecer tus productos y servicios.
          </Text>
        </View>
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
          <Button
            type="secondary"
            title="Crear tienda"
            onPress={(event: GestureResponderEvent) => {
              event.stopPropagation();
              createStoreHandler();
            }}
            style={[globalStyles.withMainActionAir, globalStyles.withMargin]}
          />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Text
        level={3}
        weight="bold"
        style={[{ marginTop: 20, marginBottom: 20 }, globalStyles.withPadding]}
      >
        Seleccione tienda
      </Text>
      <FlatList
        data={state.stores.hits}
        keyExtractor={(store: Store) => store.id}
        renderItem={({ item }) => {
          return <StoreItem data={item} onPress={pressItemHandler} />;
        }}
        ListFooterComponent={<View style={globalStyles.withScreenAir} />}
        onBeastEndReached={() => {
          if (state.stores && state.stores.from < state.stores.total) {
            fetchMore();
          }
        }}
        style={[{ flex: 1 }, globalStyles.withPadding]}
      />
      <View
        style={[
          { position: 'absolute', left: 0, right: 0, bottom: 0 },
          globalStyles.withMargin,
        ]}
      >
        <Shortcut
          image={addImage}
          title="Agregar tienda"
          onPress={createStoreHandler}
          style={globalStyles.withMainActionAir}
        />
      </View>
    </SafeAreaView>
  );
};
