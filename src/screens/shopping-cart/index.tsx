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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Linking from 'expo-linking';

// local components
import ItemComponent from './components/item';
// screen components
import InfoDialog from '../components/dialogs/info-dialog';
import ConfirmDialog from '../components/dialogs/confirm-dialog';
// components
import Icon from '../../components/icon';
import Text from '../../components/text';
import Image from '../../components/image';
import Button from '../../components/buttons/button';
import Divider from '../../components/divider';
import Touchable from '../../components/touchable';
import MapPinShadedBlueIcon from '../../components/svgs/icons/map-pin-shaded-blue';
import BasketCatImage from '../../components/svgs/images/basket-cat';
import LoadingOverlay, {
  ILoadingOverlay,
} from '../../components/loading-overlay';
import Toast, { IToast } from '../../components/toast';
// cache
import userCache from '../../cache/user';
import shoppingCartCache, {
  ShoppingCartSnapshot,
  getSnapshot,
  StoreShoppingCartSnapshot,
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
// types
import { Place, Product, Store } from '../../types';
// styles
import globalStyles from '../../styles';
import colors from '../../styles/colors';

const prefix = '[shopping cart screen]';

interface StateStore {
  editing: boolean;
  expanded: boolean;
}
interface StateStores {
  [key: string]: StateStore;
}
type SetShoppingCartSnapshotAction = {
  type: 'set_shopping_cart_snapshot';
  shopping_cart_snapshot: ShoppingCartSnapshot;
};
type SetSelectedStoreAction = {
  type: 'set_selected_store';
  selected_store?: string;
};
type SetSelectedStoreShoppingCartSnapshotAction = {
  type: 'set_selected_store_shopping_cart_snapshot';
  selected_store_shopping_cart_snapshot?: StoreShoppingCartSnapshot;
};
type ToogleEditProductsAction = {
  type: 'toogle_edit_products';
  store: string;
};
type ToogleExpandProductAction = {
  type: 'toogle_expand_products';
  store: string;
};
type SetPendingRemovalAction = {
  type: 'set_pending_removal';
  pending_removal?: string;
};
type SetDeleteOrderDialogAction = {
  type: 'set_delete_order_dialog';
  delete_order_dialog: boolean;
};
type SetWhatsappNotFoundDialogAction = {
  type: 'set_whatsapp_not_found_dialog';
  whatsapp_not_found_dialog: boolean;
};
type Action =
  | SetShoppingCartSnapshotAction
  | SetSelectedStoreAction
  | SetSelectedStoreShoppingCartSnapshotAction
  | ToogleEditProductsAction
  | ToogleExpandProductAction
  | SetPendingRemovalAction
  | SetDeleteOrderDialogAction
  | SetWhatsappNotFoundDialogAction;
type State = {
  address: Place;
  shopping_cart_snapshot: ShoppingCartSnapshot;
  selected_store?: string;
  selected_store_shopping_cart_snapshot?: StoreShoppingCartSnapshot;
  state_stores: StateStores;
  pending_removal?: string;
  delete_order_dialog: boolean;
  whatsapp_not_found_dialog: boolean;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
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
    case 'set_selected_store_shopping_cart_snapshot':
      return {
        ...state,
        selected_store_shopping_cart_snapshot:
          action.selected_store_shopping_cart_snapshot,
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
    case 'set_delete_order_dialog':
      return {
        ...state,
        delete_order_dialog: action.delete_order_dialog,
      };
    case 'set_whatsapp_not_found_dialog':
      return {
        ...state,
        whatsapp_not_found_dialog: action.whatsapp_not_found_dialog,
      };
    default:
      return state;
  }
};
interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(
    reducer,
    {
      address: userCache.getAddress() as Place,
      shopping_cart_snapshot: [],
      state_stores: {},
      delete_order_dialog: false,
      whatsapp_not_found_dialog: false,
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

  // event handlers
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

  const deleteOrderFromCartDialogOkHandler = () => {
    if (!state.selected_store) {
      capture(
        prefix,
        'Delete order from cart dialog ok handler, selected_store must be defined'
      );
      return;
    }
    dispatch({ type: 'set_delete_order_dialog', delete_order_dialog: false });
    shoppingCartCache.clearStore(state.selected_store);
  };

  const deleteOrderFromCartDialogCancelHandler = () => {
    dispatch({ type: 'set_delete_order_dialog', delete_order_dialog: false });
  };

  const whatsappNotFoundDialogOnOkHandler = () => {
    dispatch({
      type: 'set_whatsapp_not_found_dialog',
      whatsapp_not_found_dialog: false,
    });
  };

  const pressSendToWhatsappHandler = async (event: GestureResponderEvent) => {
    event.stopPropagation();
    if (!state.selected_store_shopping_cart_snapshot) {
      capture(
        prefix,
        'Press send to chat, selected store shopping cart snapshopt must be defined'
      );
      return;
    }

    try {
      let body = state.selected_store_shopping_cart_snapshot.items.reduce(
        (text, item) => {
          return `${text}✅ ${item.name} · ${numberFormatter.toCurrency(
            item.price
          )} · ${item.qty} ud.\n`;
        },
        ''
      );
      body = `${body}\n💰Total 👉 ${numberFormatter.toCurrency(
        state.selected_store_shopping_cart_snapshot.stats.amount
      )}`;
      await Linking.openURL(
        `whatsapp://send?text=${`Hola ${state.selected_store_shopping_cart_snapshot.store.name}👋, quiero hacer el siguiente pedido:\n\n${body}`}&phone=${
          state.selected_store_shopping_cart_snapshot.store.phone
        }`
      );
      // show dialog to remove order
      dispatch({
        type: 'set_delete_order_dialog',
        delete_order_dialog: true,
      });
    } catch (error) {
      capture(prefix, 'Press send to whatsapp error', error);

      dispatch({
        type: 'set_whatsapp_not_found_dialog',
        whatsapp_not_found_dialog: true,
      });
    }
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

  useEffect(() => {
    const match = state.shopping_cart_snapshot.find(
      (storeSnapshot) => storeSnapshot.store.id === state.selected_store
    );
    dispatch({
      type: 'set_selected_store_shopping_cart_snapshot',
      selected_store_shopping_cart_snapshot: match,
    });
  }, [state.shopping_cart_snapshot]);

  useFocusEffect(
    useCallback(() => {
      if (!state.shopping_cart_snapshot.length) {
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      }
    }, [state.shopping_cart_snapshot.length])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        if (!state.selected_store) {
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
  }, [state.selected_store]);

  // render logic
  const insets = useSafeAreaInsets();
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);
  const toastRef = useRef<IToast>(null);

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
        <ActivityIndicator size="small" color={colors.black} />
      </View>
    );
  }

  let addressText = formatPlace(state.address);
  if (state.address.apartment) {
    addressText = `${addressText} · ${state.address.apartment}`;
  }
  let mainAction: ReactNode = null;
  if (state.selected_store_shopping_cart_snapshot) {
    mainAction = (
      <View>
        <Divider type="thin" style={{ marginBottom: 5 }} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 5,
            paddingHorizontal: 5,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
              flex: 1,
            }}
          >
            <Icon name="whatsapp" size={30} color="#55A931" />
            <Text
              level={5}
              color={colors.blackLight1}
              style={{
                marginLeft: 10,
                marginRight: 5,
                letterSpacing: -0.5,
                flex: 1,
                lineHeight: 20,
              }}
            >
              {`Envía pedido en un mensaje a `}
              <Text level={5} weight="bold">
                {state.selected_store_shopping_cart_snapshot.store.name}
              </Text>
            </Text>
          </View>
          <Button
            title={
              <Text level={6} weight="bold" color={colors.white}>
                Enviar
              </Text>
            }
            style={{
              paddingHorizontal: 17,
              paddingVertical: 0,
            }}
            onPress={pressSendToWhatsappHandler}
          />
        </View>
      </View>
    );
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
      {state.delete_order_dialog &&
        state.selected_store_shopping_cart_snapshot && (
          <ConfirmDialog
            title={`¿Quieres eliminar del carrito el pedido de ${state.selected_store_shopping_cart_snapshot.store.name} ?`}
            okText="Si, Eliminar"
            onOk={deleteOrderFromCartDialogOkHandler}
            onCancel={deleteOrderFromCartDialogCancelHandler}
          />
        )}
      {state.whatsapp_not_found_dialog && (
        <InfoDialog
          title="No se pudo abrir Whatsapp"
          message="Verifica que lo tienes instalado 😉"
          onOk={whatsappNotFoundDialogOnOkHandler}
        />
      )}

      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
