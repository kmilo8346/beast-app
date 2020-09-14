import React, { useReducer, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import axios, { CancelTokenSource } from 'axios';

// components
import Text from '../../../../components/text';
import Button from '../../../../components/buttons/button';
import SleepingCatImage from '../../../../components/svgs/images/sleeping-cat';
// local components
import StoreCard from './components/store-card';
// clients
import storeClient from '../../../../clients/store-client';
// libs
import { navigate } from '../../../../lib/root-navigation';
// types
import {
  ComputedWidget,
  NearbyStoresContent,
  SearchResponse,
  Store,
} from '../../../../types';

// instances outside component
let fetchRequestSource: CancelTokenSource;

type SetFetchingMoreAction = {
  type: 'set_fetching_more';
  fetching_more: boolean;
};
type SetStoresAction = {
  type: 'set_stores';
  stores: SearchResponse<Store>;
};
type SetErrorAction = {
  type: 'set_error';
  error: Error;
};
type Action = SetFetchingMoreAction | SetStoresAction | SetErrorAction;
type State = {
  stores: SearchResponse<Store>;
  error?: Error;
  fetching_more: boolean;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_fetching_more':
      return { ...state, fetching_more: action.fetching_more };
    case 'set_stores':
      return { ...state, stores: action.stores };
    case 'set_error':
      return { ...state, error: action.error };
    default:
      return state;
  }
};

interface ComponentProps {
  data: ComputedWidget;
}

export default ({ data }: ComponentProps) => {
  // state
  const content = data.content as NearbyStoresContent;
  const [state, dispatch] = useReducer(reducer, {
    stores: {
      ...content.initial,
      from: content.initial.from + content.initial.hits.length,
    },
    fetching_more: false,
  });

  // event handlers
  const fetch = async (
    filters?: { [key: string]: any },
    from = 0,
    size = 10
  ) => {
    if (fetchRequestSource) {
      fetchRequestSource.cancel();
    }
    fetchRequestSource = axios.CancelToken.source();
    const stores = await storeClient.search(
      {
        filters,
        from,
        size,
      },
      fetchRequestSource.token
    );
    return stores;
  };

  const fetchMore = async () => {
    try {
      dispatch({ type: 'set_fetching_more', fetching_more: true });
      const stores = await fetch(
        state.stores.filters,
        state.stores.from,
        state.stores.size
      );
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

  const pressLinkHandler = () => {
    navigate('SellerStack', {
      screen: 'SellerBoot',
    });
  };

  useEffect(() => {
    return () => {
      if (fetchRequestSource) {
        fetchRequestSource.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const content = data.content as NearbyStoresContent;
    dispatch({
      type: 'set_stores',
      stores: {
        ...content.initial,
        from: content.initial.from + content.initial.hits.length,
      },
    });
  }, [data]);

  // render logic

  // not data
  if (!state.stores.hits.length) {
    return (
      <View style={{ alignItems: 'center', paddingTop: 80 }}>
        <SleepingCatImage />
        <Text
          level={6}
          weight="bold"
          style={{
            marginTop: 20,
            marginBottom: 20,
            textAlign: 'center',
            width: 320,
          }}
        >
          Parece que no hay tiendas disponibles en tu zona en este momento.
        </Text>
        <Text
          level={5}
          weight="bold"
          style={{ marginBottom: 40, textAlign: 'center' }}
        >
          ¡Intentalo de nuevo mas tarde!
        </Text>
        <Button
          title="¡Tambien puedes vender con nosotros!"
          type="link"
          onPress={pressLinkHandler}
        />
      </View>
    );
  }

  // data
  return (
    <View>
      <Text level={2} weight="bold" style={{ marginBottom: 15 }}>
        {content.title}
      </Text>
      <FlatList
        data={state.stores.hits}
        keyExtractor={(item: Store) => item.id}
        renderItem={({ item }) => {
          return (
            <View style={{ marginBottom: 15 }}>
              <StoreCard data={item} />
            </View>
          );
        }}
        onEndReached={() => {
          if (state.stores.from < state.stores.total) {
            fetchMore();
          }
        }}
      />
    </View>
  );
};
