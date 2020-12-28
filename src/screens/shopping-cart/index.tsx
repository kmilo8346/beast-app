/* eslint-disable no-nested-ternary */
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
} from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  ScrollView,
  View,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import axios, { CancelTokenSource } from 'axios';
import Constants from 'expo-constants';

// local components
import ItemComponent from './components/item';
import UnavailableProductsDialog from './components/unavailable-products-dialog';
// screen components
import ConfirmDialog from '../components/dialogs/confirm-dialog';
import InfoDialog from '../components/dialogs/info-dialog';
// components
import Icon from '../../components/icon';
import Text from '../../components/text';
import Button from '../../components/buttons/button';
import Divider from '../../components/divider';
import Touchable from '../../components/touchable';
import MapPinShadedBlueIcon from '../../components/svgs/icons/map-pin-shaded-blue';
import BasketCatImage from '../../components/svgs/images/basket-cat';
import LoadingOverlay, {
  ILoadingOverlay,
} from '../../components/loading-overlay';
import Toast, { IToast } from '../../components/toast';
import CheckBlueThinImage from '../../components/svgs/images/check-blue-thin';
// clients
import orderClient from '../../clients/order-client';
// cache
import userCache from '../../cache/user';
import shoppingCartCache, {
  ShoppingCartSnapshot,
  getSnapshot,
} from '../../cache/shopping-cart';
// lib
import { capture } from '../../lib/sentry';
import cloudinary from '../../lib/cloudinary';
import durationFormatter from '../../lib/formatters/duration-formatter';
import numberFormatter from '../../lib/formatters/number-formatter';
import {
  extractCurrentOpeningHours,
  formatPlace,
  humanizeCurrentClosedOpeningHours,
} from '../../lib/utils';
import { v4 as uuidv4, generatePushID } from '../../lib/uuid';
// types
import { Product, Store } from '../../types';
// styles
import globalStyles from '../../styles';
import colors from '../../styles/colors';

const prefix = '[shopping cart screen]';
let createOrderRequestSource: CancelTokenSource;

interface StateStore {
  editing: boolean;
  expanded: boolean;
}
interface StateStores {
  [key: string]: StateStore;
}
enum ShoppingCartView {
  SHOPPING_CART = 'shopping_cart',
  ORDER_CREATED = 'order_created',
}
type SetViewAction = {
  type: 'set_view';
  view: ShoppingCartView;
};
type SetShoppingCartSnapshotAction = {
  type: 'set_shopping_cart_snapshot';
  shopping_cart_snapshot: ShoppingCartSnapshot;
};
type SetSelectedStoreAction = {
  type: 'set_selected_store';
  selected_store?: string;
};
type ToogleEditProductsAction = {
  type: 'toogle_edit_products';
  store: string;
};
type ToogleExpandProductAction = {
  type: 'toogle_expand_products';
  store: string;
};
type SetPhoneModalAction = {
  type: 'set_phone_modal';
  phone_modal: boolean;
};
type SetUpdatingPhoneAction = {
  type: 'set_updating_phone';
  updating_phone: boolean;
};
type SetPendingRemovalAction = {
  type: 'set_pending_removal';
  pending_removal?: string;
};
type SetIdempotencyAction = {
  type: 'set_idempotency';
  idempotency: string;
};
type SetLastOrderedStoreAction = {
  type: 'set_last_ordered_store';
  last_ordered_store: Store;
};
type SetDisabledStoreDialogAction = {
  type: 'set_disabled_store_dialog';
  disabled_store_dialog: string;
};
type SetClosedStoreDialogAction = {
  type: 'set_closed_store_dialog';
  closed_store_dialog: string;
};
type SetUnavailableProductsDialogAction = {
  type: 'set_unavailable_products_dialog';
  unavailable_products_dialog?: { store: Store; products: Product[] };
};
type SetUnexpectedErrorDialogAction = {
  type: 'set_unexpected_error_dialog';
  unexpected_error_dialog: boolean;
};
type SetMakeOrderDialogAction = {
  type: 'set_make_order_dialog';
  make_order_dialog: boolean;
};
type Action =
  | SetViewAction
  | SetShoppingCartSnapshotAction
  | SetSelectedStoreAction
  | ToogleEditProductsAction
  | ToogleExpandProductAction
  | SetPhoneModalAction
  | SetUpdatingPhoneAction
  | SetPendingRemovalAction
  | SetIdempotencyAction
  | SetLastOrderedStoreAction
  | SetDisabledStoreDialogAction
  | SetClosedStoreDialogAction
  | SetUnavailableProductsDialogAction
  | SetUnexpectedErrorDialogAction
  | SetMakeOrderDialogAction;
type State = {
  view: ShoppingCartView;
  shopping_cart_snapshot: ShoppingCartSnapshot;
  selected_store?: string;
  state_stores: StateStores;
  pending_removal?: string;
  idempotency?: string;
  last_ordered_store?: Store;
  disabled_store_dialog: string;
  closed_store_dialog: string;
  unavailable_products_dialog?: { store: Store; products: Product[] };
  unexpected_error_dialog: boolean;
  make_order_dialog: boolean;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_view':
      return { ...state, view: action.view };
    case 'set_shopping_cart_snapshot':
      return {
        ...state,
        selected_store: (() => {
          const mach = action.shopping_cart_snapshot.find(
            (store_snapshot) => store_snapshot.store.id === state.selected_store
          );
          if (mach) {
            return state.selected_store;
          }

          return action.shopping_cart_snapshot.length
            ? action.shopping_cart_snapshot[0].store.id
            : undefined;
        })(),
        shopping_cart_snapshot: action.shopping_cart_snapshot,
      };
    case 'set_selected_store':
      return {
        ...state,
        selected_store: action.selected_store,
      };
    case 'toogle_edit_products':
      return {
        ...state,
        state_stores: {
          ...state.state_stores,
          [action.store]: {
            ...state.state_stores[action.store],
            editing: !state.state_stores[action.store].editing,
            expanded: !state.state_stores[action.store].editing,
          },
        },
      };
    case 'toogle_expand_products':
      return {
        ...state,
        state_stores: {
          ...state.state_stores,
          [action.store]: {
            ...state.state_stores[action.store],
            expanded: !state.state_stores[action.store].expanded,
          },
        },
      };
    case 'set_pending_removal':
      return {
        ...state,
        pending_removal: action.pending_removal,
      };
    case 'set_idempotency':
      return { ...state, idempotency: action.idempotency };
    case 'set_last_ordered_store':
      return {
        ...state,
        last_ordered_store: action.last_ordered_store,
        idempotency: generatePushID(),
        view: ShoppingCartView.ORDER_CREATED,
      };
    case 'set_disabled_store_dialog':
      return {
        ...state,
        disabled_store_dialog: action.disabled_store_dialog,
      };
    case 'set_closed_store_dialog':
      return {
        ...state,
        closed_store_dialog: action.closed_store_dialog,
      };
    case 'set_unavailable_products_dialog':
      return {
        ...state,
        unavailable_products_dialog: action.unavailable_products_dialog,
      };
    case 'set_unexpected_error_dialog':
      return {
        ...state,
        unexpected_error_dialog: action.unexpected_error_dialog,
      };
    case 'set_make_order_dialog':
      return {
        ...state,
        make_order_dialog: action.make_order_dialog,
      };
    default:
      return state;
  }
};
interface ScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(
    reducer,
    {
      view: ShoppingCartView.SHOPPING_CART,
      shopping_cart_snapshot: [],
      state_stores: {},
      disabled_store_dialog: '',
      closed_store_dialog: '',
      unexpected_error_dialog: false,
      make_order_dialog: false,
    },
    (initialState) => {
      const snapshot = getSnapshot(shoppingCartCache.getData());
      return {
        ...initialState,
        shopping_cart_snapshot: snapshot,
        selected_store: snapshot.length ? snapshot[0].store.id : undefined,
        state_stores: snapshot.reduce((state, storeSnapshot) => {
          const result = { ...state };

          result[storeSnapshot.store.id] = {
            editing: false,
            expanded: false,
          };
          return result;
        }, {} as StateStores),
      };
    }
  );
  const insets = useSafeAreaInsets();
  const address = userCache.getAddress();
  if (!address) {
    throw new Error(`${prefix} User address must be defined`);
  }
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);
  const toastRef = useRef<IToast>(null);

  // event handler
  const createOrder = async () => {
    const match = state.shopping_cart_snapshot.find(
      (store_shopping_sart) =>
        store_shopping_sart.store.id === state.selected_store
    );
    if (!match) {
      throw new Error(
        `${prefix} Selected store dont found in snapshot, selected: ${state.selected_store}`
      );
    }
    try {
      loadingOverlayRef.current?.show();
      if (createOrderRequestSource) {
        createOrderRequestSource.cancel();
      }
      createOrderRequestSource = axios.CancelToken.source();
      const user = userCache.getData();

      await orderClient.create(
        {
          body: {
            idempotency: state.idempotency as string,
            customer: {
              id: user?.id as string,
              email: user?.email as string,
              first_name: user?.first_name as string,
              last_name: user?.last_name as string,
              photo_url: user?.photo_url as string,
              phone: user?.phone as string,
              created_at: user?.created_at as Date,
            },
            transaction: {
              country: Constants.manifest.extra.BEAST_COUNTRY,
              currency: Constants.manifest.extra.BEAST_CURRENCY,
              language: Constants.manifest.extra.BEAST_LANGUAGE,
              delivery_address: address,
              shopping_cart: {
                store: match.store,
                items: match.items,
              },
            },
          },
          source: ['id'],
        },
        {
          cancelToken: createOrderRequestSource.token,
        }
      );
      dispatch({
        type: 'set_last_ordered_store',
        last_ordered_store: match.store,
      });
      shoppingCartCache.clearStore(match.store.id);
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'create order error', error);

        if (error.response?.status === 400 && error.response.data.reason) {
          if (error.response.data.reason === 'SHOP_DISABLED') {
            setTimeout(() => {
              dispatch({
                type: 'set_disabled_store_dialog',
                disabled_store_dialog: match.store.name,
              });
            }, 500);
            return;
          }
          if (error.response.data.reason === 'SHOP_CLOSED') {
            setTimeout(() => {
              dispatch({
                type: 'set_closed_store_dialog',
                closed_store_dialog: match.store.name,
              });
            }, 500);
            return;
          }
          if (error.response.data.reason === 'PRODUCTS_NOT_AVAILABLE') {
            setTimeout(() => {
              dispatch({
                type: 'set_unavailable_products_dialog',
                unavailable_products_dialog: {
                  store: match.store,
                  products: error.response.data.meta_data.products,
                },
              });
            }, 500);
            return;
          }
        }

        setTimeout(() => {
          dispatch({
            type: 'set_unexpected_error_dialog',
            unexpected_error_dialog: true,
          });
        }, 500);
      }
    } finally {
      loadingOverlayRef.current?.hide();
    }
  };

  const pressMakeOrderHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    const user = userCache.getData();
    if (!user?.phone || !user.phone_verified) {
      navigation.navigate('SetPhone', {
        redirect: {
          name: 'ShoppingCart',
          params: {
            pay: uuidv4(),
          },
        },
      });
      return;
    }
    if (!user?.first_name) {
      navigation.navigate('AddUserData', {
        redirect: {
          name: 'ShoppingCart',
          params: {
            pay: uuidv4(),
          },
        },
      });
      return;
    }
    dispatch({ type: 'set_make_order_dialog', make_order_dialog: true });
  };

  const pressToogleEditHandler = (store: string) => {
    dispatch({ type: 'toogle_edit_products', store });
  };

  const pressToogleExpandHandler = (store: string) => {
    dispatch({ type: 'toogle_expand_products', store });
  };

  const changeItemQtyHandler = (
    store: Store,
    product: Product,
    qty: number
  ) => {
    shoppingCartCache.set(store, product, qty);
  };

  const pressSelectStoreHandler = (store: string) => {
    dispatch({ type: 'set_selected_store', selected_store: store });
  };

  const pressSeeStoreHandler = (store: Store) => {
    navigation.navigate('Store', { store });
  };

  const pressDeleteHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();

    if (!state.selected_store) {
      capture(
        prefix,
        'Press delete handler error: cant delete store if not selected store'
      );
      return;
    }
    dispatch({
      type: 'set_pending_removal',
      pending_removal: state.selected_store,
    });
  };

  const confirmDialogOkHandler = () => {
    const pending = state.pending_removal;
    dispatch({ type: 'set_pending_removal', pending_removal: undefined });
    if (!pending) {
      capture(
        prefix,
        'Confirm dialog ok handler error: cant delete store if not pending removal'
      );
      return;
    }
    shoppingCartCache.clearStore(pending);
  };

  const confirmDialogCancelHandler = () => {
    dispatch({ type: 'set_pending_removal', pending_removal: undefined });
  };

  const disabledStoreDialogOkHandler = () => {
    dispatch({ type: 'set_disabled_store_dialog', disabled_store_dialog: '' });
  };

  const closedStoreDialogOkHandler = () => {
    dispatch({ type: 'set_closed_store_dialog', closed_store_dialog: '' });
  };

  const unavailableProductsDialogOkHandler = () => {
    if (state.unavailable_products_dialog) {
      // delete unavailables from shopping cart
      state.unavailable_products_dialog.products.forEach((product) => {
        shoppingCartCache.set(
          state.unavailable_products_dialog?.store as Store,
          product,
          0
        );
      });
    }
    dispatch({
      type: 'set_unavailable_products_dialog',
      unavailable_products_dialog: undefined,
    });
  };

  const unavailableProductsDialogCancelHandler = () => {
    dispatch({
      type: 'set_unavailable_products_dialog',
      unavailable_products_dialog: undefined,
    });
  };

  const unexpectedErrorDialogOkHandler = () => {
    dispatch({
      type: 'set_unexpected_error_dialog',
      unexpected_error_dialog: false,
    });
    setTimeout(() => {
      createOrder();
    }, 500);
  };

  const unexpectedErrorDialogCancelHandler = () => {
    dispatch({
      type: 'set_unexpected_error_dialog',
      unexpected_error_dialog: false,
    });
  };

  const pressContinueInShoppingCartHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_view', view: ShoppingCartView.SHOPPING_CART });
  };

  const goToHomeHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('Home');
  };

  const makeOrderDialogOkHandler = () => {
    dispatch({ type: 'set_make_order_dialog', make_order_dialog: false });
    setTimeout(() => {
      createOrder();
    }, 500);
  };

  const makeOrderDialogCancelHandler = () => {
    dispatch({ type: 'set_make_order_dialog', make_order_dialog: false });
  };

  const pressSeeOrdersHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('ClientOrders');
  };

  useEffect(() => {
    const unsubscribe = shoppingCartCache.onChange((data) => {
      dispatch({
        type: 'set_shopping_cart_snapshot',
        shopping_cart_snapshot: getSnapshot(data),
      });
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (
        !state.shopping_cart_snapshot.length &&
        state.view === ShoppingCartView.SHOPPING_CART
      ) {
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      }
    }, [state.shopping_cart_snapshot, state.view])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        if (
          !state.selected_store ||
          state.view !== ShoppingCartView.SHOPPING_CART
        ) {
          return null;
        }

        return (
          <Touchable
            style={{
              paddingVertical: 5,
              paddingHorizontal: 20,
            }}
            onPress={pressDeleteHandler}
          >
            <Icon name="trash-2" size={20} />
          </Touchable>
        );
      },
    });
  }, [state.selected_store, state.view]);

  useEffect(() => {
    dispatch({ type: 'set_idempotency', idempotency: generatePushID() });
  }, []);

  useEffect(() => {
    if (route.params?.pay) {
      dispatch({ type: 'set_make_order_dialog', make_order_dialog: true });
    }
  }, [route.params?.pay]);

  // render logic
  if (state.view === ShoppingCartView.ORDER_CREATED) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.white,
        }}
      >
        <CheckBlueThinImage />
        <Text
          level={1}
          weight="bold"
          style={{ marginTop: 25, marginBottom: 10 }}
        >
          ¡Listo!
        </Text>
        <Text
          level={5}
          style={{
            lineHeight: 23,
            textAlign: 'center',
            marginHorizontal: 20,
          }}
        >
          <Text level={5} weight="bold">
            {state.last_ordered_store?.name}
          </Text>
          {` `} te confirmará y te contactará en un instante 😉.
        </Text>
        {shoppingCartCache.isEmpty() ? (
          <Button
            type="link"
            title="Ver pedidos"
            style={{ marginTop: 50 }}
            onPress={pressSeeOrdersHandler}
          />
        ) : (
          <Button
            type="link"
            title="Seguir en carro"
            style={{ marginTop: 50 }}
            onPress={pressContinueInShoppingCartHandler}
          />
        )}

        <View
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              paddingBottom: insets.bottom,
            },
            globalStyles.withMargin,
          ]}
        >
          <Button
            title="Ir a inicio"
            style={globalStyles.withMainActionAir}
            onPress={goToHomeHandler}
          />
        </View>
      </View>
    );
  }

  // not data
  if (!state.shopping_cart_snapshot.length) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.white,
        }}
      >
        <BasketCatImage />
        <ActivityIndicator />
      </View>
    );
  }

  let addressText = formatPlace(address);
  if (address.apartment) {
    addressText = `${addressText} · ${address.apartment}`;
  }
  let mainAction: ReactNode = null;
  if (state.selected_store) {
    const match = state.shopping_cart_snapshot.find(
      (storeSnapshot) => storeSnapshot.store.id === state.selected_store
    );
    if (match) {
      mainAction = (
        <Button
          title={`Hacer pedido · ${match.store.name}`}
          style={globalStyles.withMainActionAir}
          onPress={pressMakeOrderHandler}
        />
      );
    }
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView style={{ flex: 1 }}>
        <View
          style={[
            { paddingTop: 15, marginBottom: 20 },
            globalStyles.withMargin,
          ]}
        >
          <View style={[{ flexDirection: 'row' }]}>
            <MapPinShadedBlueIcon />
            <View style={{ marginLeft: 15, flex: 1 }}>
              <Text level={6} weight="bold" style={{ marginBottom: 2 }}>
                Dirección de entrega
              </Text>
              <Text
                level={6}
                numberOfLines={2}
                ellipsizeMode="tail"
                style={{ lineHeight: 20 }}
              >
                {addressText}
              </Text>
            </View>
          </View>
        </View>

        <Divider type="thick" />

        {state.shopping_cart_snapshot.map((storeSnapshot, index, array) => {
          const store = storeSnapshot.store;
          const storeState = state.state_stores[store.id];
          const items = storeState.expanded
            ? storeSnapshot.items
            : storeSnapshot.items.slice(0, 3);
          const currentOpeningHours = extractCurrentOpeningHours(
            store.opening_hours
          );
          return (
            <View key={`${storeSnapshot.store.id}`} style={{ marginTop: 20 }}>
              <View style={globalStyles.withMargin}>
                <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                  <Touchable
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    onPress={(event: GestureResponderEvent) => {
                      event.stopPropagation();
                      pressSelectStoreHandler(store.id);
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderWidth: 2,
                        borderColor: colors.blueLight1,
                        borderRadius: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {store.id === state.selected_store && (
                        <View
                          style={{
                            width: 14,
                            height: 14,
                            backgroundColor: colors.blue,
                            borderRadius: 50,
                          }}
                        />
                      )}
                    </View>

                    <Image
                      source={{
                        uri: cloudinary.dynamicUrl(
                          storeSnapshot.store.images[0],
                          'w_500'
                        ),
                      }}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 10,
                        marginLeft: 20,
                      }}
                    />

                    <View
                      style={{
                        marginLeft: 15,
                        alignSelf: 'flex-start',
                        paddingTop: 5,
                        flex: 1,
                      }}
                    >
                      <Text
                        level={6}
                        weight="bold"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{ marginBottom: 5 }}
                      >
                        {store.name}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 2,
                        }}
                      >
                        <Icon name="clock" size={16} />
                        <Text
                          level={7}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{ flex: 1, marginLeft: 5 }}
                        >
                          {durationFormatter.humanizeDurationRange(
                            store.delivery_time.gte,
                            store.delivery_time.lte
                          )}
                        </Text>
                      </View>
                      {currentOpeningHours.status === 'closed' && (
                        <View
                          style={{
                            backgroundColor: !currentOpeningHours.next_open
                              ? colors.black
                              : colors.red2,
                            alignSelf: 'flex-start',
                            borderRadius: 10,
                            paddingVertical: 5,
                            paddingHorizontal: 10,
                          }}
                        >
                          <Text
                            level={7}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            weight="bold"
                            color={colors.white}
                          >
                            {humanizeCurrentClosedOpeningHours(
                              currentOpeningHours
                            )}
                          </Text>
                        </View>
                      )}
                    </View>
                  </Touchable>
                  <Touchable
                    style={{
                      paddingLeft: 15,
                      paddingVertical: 15,
                    }}
                    onPress={(event: GestureResponderEvent) => {
                      event.stopPropagation();
                      pressSeeStoreHandler(store);
                    }}
                  >
                    <Icon name="chevron-right" />
                  </Touchable>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                  }}
                >
                  <Text level={5} weight="bold">
                    Productos
                  </Text>
                  <Button
                    type="link"
                    title={
                      <Text level={6} weight="bold" color={colors.blue}>
                        {storeState.editing ? 'Listo' : 'Editar'}
                      </Text>
                    }
                    onPress={(event: GestureResponderEvent) => {
                      event.stopPropagation();
                      pressToogleEditHandler(store.id);
                    }}
                    style={{ paddingRight: 0 }}
                  />
                </View>
                {items.map((item, index, array) => (
                  <ItemComponent
                    key={item.id}
                    data={item}
                    editing={storeState.editing}
                    style={{ marginBottom: index < array.length - 1 ? 15 : 0 }}
                    onChange={(product, qty) => {
                      changeItemQtyHandler(store, product, qty);
                    }}
                  />
                ))}
                {storeSnapshot.items.length > 3 ? (
                  <Touchable
                    style={{ alignSelf: 'center', padding: 10 }}
                    onPress={(event: GestureResponderEvent) => {
                      event.stopPropagation();
                      pressToogleExpandHandler(store.id);
                    }}
                  >
                    {storeState.expanded ? (
                      <Icon name="chevron-up" color={colors.blue} />
                    ) : (
                      <Icon name="chevron-down" color={colors.blue} />
                    )}
                  </Touchable>
                ) : (
                  <View style={{ height: 25 }} />
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 15,
                  }}
                >
                  <Text level={5} weight="bold">
                    Total
                  </Text>
                  <Text level={6} weight="bold">
                    {numberFormatter.toCurrency(storeSnapshot.stats.amount)}
                  </Text>
                </View>
              </View>
              {index < array.length - 1 && <Divider type="thick" />}
            </View>
          );
        })}

        <View style={globalStyles.withScreenAir} />
      </ScrollView>

      <View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingBottom: insets.bottom,
            backgroundColor: colors.white,
          },
          globalStyles.withMargin,
        ]}
      >
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        {mainAction}
      </View>
      {state.pending_removal && (
        <ConfirmDialog
          title="¿Seguro que quieres eliminar la tienda seleccionada?"
          okText="Eliminar"
          onOk={confirmDialogOkHandler}
          onCancel={confirmDialogCancelHandler}
        />
      )}
      {!!state.disabled_store_dialog && (
        <InfoDialog
          title="Tienda cerrada"
          message={`${state.disabled_store_dialog} ya no está aceptando pedidos.`}
          onOk={disabledStoreDialogOkHandler}
        />
      )}
      {!!state.closed_store_dialog && (
        <InfoDialog
          title="Tienda cerrada momentáneamente"
          message={`${state.closed_store_dialog} ya no está aceptando pedidos. Revisa su horario e intenta más tarde.`}
          onOk={closedStoreDialogOkHandler}
        />
      )}
      {!!state.unavailable_products_dialog && (
        <UnavailableProductsDialog
          products={state.unavailable_products_dialog.products}
          onOk={unavailableProductsDialogOkHandler}
          onCancel={unavailableProductsDialogCancelHandler}
        />
      )}
      {state.unexpected_error_dialog && (
        <ConfirmDialog
          title="No pudimos hacer el pedido"
          message="Ocurrió un error en este instante, por favor reintente."
          okText="Reintentar"
          onOk={unexpectedErrorDialogOkHandler}
          onCancel={unexpectedErrorDialogCancelHandler}
        />
      )}
      {state.make_order_dialog && (
        <ConfirmDialog
          title="¿Desea realizar pedido?"
          message="Realizar pedido no tiene costo, le enviaremos el detalle de tu pedido al vendedor de forma inmediata."
          okText="Si, Continuar"
          onOk={makeOrderDialogOkHandler}
          onCancel={makeOrderDialogCancelHandler}
        />
      )}
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
