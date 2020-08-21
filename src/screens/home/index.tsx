import React, { useReducer, useEffect, useRef, useCallback } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import axios, { CancelTokenSource } from 'axios';

// components
import Text from '../../components/text';
import Toast, { IToast } from '../../components/toast';
import ErrorView from '../../components/error-view';
import FlatList from '../../components/flat-list';
// local components
import Divider from './components/divider';
import SelectAddress from './components/select-address';
import Skeleton from './components/skeleton';
import WidgetComponent from './widgets/widget';
// clients
import widgetClient from '../../clients/widget-client';
import userClient from '../../clients/user-client-v2';
// cache
import userCache from '../../cache/user';
// types
import {
  LoggedUser,
  User,
  ComputeFilters,
  ComputeContext,
  ComputeResponse,
  Place,
  ComputedWidget,
} from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';
import user from '../../cache/user';

// instances outside component
const prefix = '[home screen]';
let fetchRequestSource: CancelTokenSource;
const defaultSize = 10;

type SetUserAction = {
  type: 'set_user';
  user: User;
};
type SetUpdatingAction = {
  type: 'set_updating';
  updating: boolean;
};
type ResetAction = {
  type: 'reset';
};
type SetWidgetsAction = {
  type: 'set_widgets';
  widgets: ComputeResponse;
};
type SetErrorAction = {
  type: 'set_error';
  error: Error;
};
type SetRefreshingAction = {
  type: 'set_refreshing';
  refreshing: boolean;
};
type Action =
  | SetUserAction
  | SetUpdatingAction
  | ResetAction
  | SetWidgetsAction
  | SetErrorAction
  | SetRefreshingAction;
type State = {
  user: User;
  updating: boolean;
  widgets?: ComputeResponse;
  error?: Error;
  refreshing: boolean;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_user':
      return { ...state, user: action.user };
    case 'set_updating':
      return { ...state, updating: action.updating };
    case 'reset':
      return { ...state, widgets: undefined, error: undefined };
    case 'set_widgets':
      return { ...state, widgets: action.widgets };
    case 'set_error':
      return { ...state, error: action.error };
    case 'set_refreshing':
      return { ...state, refreshing: action.refreshing };
    default:
      return state;
  }
};

export default () => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    user: userCache.getData() as User,
    updating: false,
    refreshing: false,
  });
  if (!state.user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const address = userCache.getAddress();
  if (!address) {
    throw new Error(`${prefix} User address info must be defined`);
  }
  const insets = useSafeAreaInsets();
  const toastRef = useRef<IToast>(null);

  // event handlers
  const fetch = async (
    filters: ComputeFilters,
    context: ComputeContext,
    from = 0,
    size = defaultSize
  ) => {
    if (fetchRequestSource) {
      fetchRequestSource.cancel();
    }
    fetchRequestSource = axios.CancelToken.source();
    const response = await widgetClient.compute(
      {
        filters,
        context,
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
      const response = await fetch(
        { tag: 'default' },
        {
          location: address.geometry.location,
        }
      );
      dispatch({
        type: 'set_widgets',
        widgets: {
          ...response,
          from: response.from + response.hits.length,
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

  const refresh = async () => {
    try {
      dispatch({ type: 'set_refreshing', refreshing: true });
      const response = await fetch(
        { tag: 'default' },
        {
          location: address.geometry.location,
        }
      );
      dispatch({
        type: 'set_widgets',
        widgets: {
          ...response,
          from: response.from + response.hits.length,
        },
      });
    } catch (error) {
      if (!axios.isCancel(error)) {
        // TODO: Log error
        console.log(error);

        dispatch({ type: 'set_error', error });
      }
    } finally {
      dispatch({ type: 'set_refreshing', refreshing: false });
    }
  };

  const changeAddressInfoHandler = async (info: {
    current_address: string;
    addresses: Place[];
  }) => {
    try {
      dispatch({ type: 'set_updating', updating: true });
      await userClient.update({
        pathVars: {
          id: state.user.id,
        },
        body: {
          current_address: info.current_address,
          addresses: info.addresses,
        },
      });
      await userCache.updateData({
        current_address: info.current_address,
        addresses: info.addresses,
      });
    } catch (error) {
      // TODO: log error
      console.log(error);

      toastRef.current?.show({
        message: 'No se pudo actualizar las direcciones, reintente',
        type: 'ERROR',
        expiration: 3,
      });
    } finally {
      dispatch({ type: 'set_updating', updating: false });
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
    load();
  }, [state.user.current_address]);

  // render logic
  let message = '¡Hola!';
  if (userCache.isLogged()) {
    const logged = state.user as LoggedUser;
    message = `¡Hola ${logged.first_name}!`;
  }

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
          globalStyles.withMargin,
        ]}
      >
        <ErrorView />
      </View>
    );
  }

  // loading
  if (!state.widgets) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.white,
          paddingTop: insets.top,
        }}
      >
        <Skeleton />
      </View>
    );
  }

  // not data
  if (!state.widgets?.hits.length) {
    throw new Error(`${prefix} Not widgets returned`);
    // TODO: try to resolve this problem
  }

  // data
  return (
    <View
      style={{ flex: 1, backgroundColor: colors.white, paddingTop: insets.top }}
    >
      <View style={globalStyles.withMargin}>
        <Text level={2} weight="bold" style={{ marginBottom: 5 }}>
          {message}
        </Text>
        <SelectAddress
          value={{
            current_address: state.user.current_address,
            addresses: state.user.addresses,
          }}
          processing={state.updating}
          style={{ marginBottom: 5 }}
          onChange={changeAddressInfoHandler}
        />
      </View>

      <Divider />

      <FlatList
        data={state.widgets.hits}
        refreshing={state.refreshing}
        keyExtractor={(item: ComputedWidget) => item.id}
        renderItem={({ item }) => {
          return (
            <View style={{ marginBottom: 20 }}>
              <WidgetComponent data={item} />
            </View>
          );
        }}
        ListFooterComponent={<View style={globalStyles.withScreenAir} />}
        onRefresh={refresh}
        style={[{ flex: 1, marginTop: 20 }, globalStyles.withPadding]}
      />

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
      </View>
    </View>
  );
};
