import React, { useReducer, useEffect } from 'react';
import { View } from 'react-native';
import axios, { CancelTokenSource } from 'axios';

// components
import { Loading, ErrorView } from '../../../components';
// clients
import storeClient from '../../../clients/store-client';
// containers
import UserProvider from '../../../containers/user';
// cache
import storeCache from '../../../cache/store';
// styles
import colors from '../../../styles/colors';
import userClient from '../../../clients/user-client';

// instances outside component
const prefix = '[seller boot screen]';
let fetchRequestSource: CancelTokenSource;

enum SellerBootView {
  LOADING = 'loading',
  DATA = 'data',
  ERROR = 'error',
}
type ChangeViewAction = {
  type: 'change_view';
  view: SellerBootView;
};
type Action = ChangeViewAction;
type State = {
  view: SellerBootView;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_view':
      return { ...state, view: action.view };
    default:
      return state;
  }
};

interface SellerBootProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: SellerBootProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    view: SellerBootView.LOADING,
  });
  const userContainer = UserProvider.useContainer();
  const user = userContainer.get();
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }

  // params
  const store_id = route.params?.store_id || user.currentStore;
  const redirect = route.params?.redirect || { name: 'SellerDashboard' };

  // event hanlders
  const fetchStore = async (id: string) => {
    if (fetchRequestSource) {
      fetchRequestSource.cancel();
    }
    fetchRequestSource = axios.CancelToken.source();

    const store = await storeClient.get(
      {
        pathVars: {
          id,
        },
      },
      fetchRequestSource.token
    );
    return store;
  };
  const boot = async () => {
    dispatch({ type: 'change_view', view: SellerBootView.LOADING });
    if (!user.email) {
      navigation.replace('SignIn', {
        redirect: {
          name: 'SellerBoot',
          params: route.params,
        },
      });
      return;
    }
    if (!user.phone || !user.phoneVerified) {
      navigation.replace('SetPhone', {
        redirect: {
          name: 'SellerBoot',
          params: route.params,
        },
      });
      return;
    }

    if (store_id) {
      try {
        const store = await fetchStore(store_id);
        // set cache
        storeCache.setData(store);
        // set current store
        userClient.update(
          user.id,
          { currentStore: store.id },
          new Date().getTime()
        );

        navigation.replace(redirect.name, redirect.params);
      } catch (error) {
        if (!axios.isCancel(error)) {
          if (error.response.status === 404) {
            navigation.replace('SelectOrCreateStore');
            return;
          }

          // TODO: log error
          console.log(error);
          dispatch({ type: 'change_view', view: SellerBootView.ERROR });
        }
      }
    } else {
      navigation.replace('SelectOrCreateStore');
    }
  };

  useEffect(() => {
    boot();

    return () => {
      if (fetchRequestSource) {
        // cancel running request
        fetchRequestSource.cancel();
      }
    };
  }, []);

  // render logic
  if (state.view === SellerBootView.ERROR) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.white,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ErrorView onRetry={boot} />
      </View>
    );
  }

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
};
