/* eslint-disable no-nested-ternary */
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
} from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  ScrollView,
  Vibration,
  View,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

// constraints
import constraints from './constraints';
// components
import Icon from '../../components/icon';
import Text from '../../components/text';
import Button from '../../components/buttons/button';
import Divider from '../../components/divider';
import Touchable from '../../components/touchable';
import MapPinShadedBlueIcon from '../../components/svgs/icons/map-pin-shaded-blue';
import BasketCatImage from '../../components/svgs/images/basket-cat';
// screen components
import ConfirmDialog from '../components/dialogs/confirm-dialog';
// local components
import SetPhoneModal from './components/set-phone-modal';
import ItemComponent from './components/item';
// clients
import userClient from '../../clients/user-client';
// cache
import userCache from '../../cache/user';
import shoppingCartCache, {
  ShoppingCartSnapshot,
  getSnapshot,
} from '../../cache/shopping-cartv2';
// lib
import validate from '../../lib/validate';
import { capture } from '../../lib/sentry';
import stringFormatter from '../../lib/formatters/string-formatter';
import cloudinary from '../../lib/cloudinary';
import durationFormatter from '../../lib/formatters/duration-formatter';
import numberFormatter from '../../lib/formatters/number-formatter';
import * as utils from '../../lib/utils';
// types
import { User, Place, Product, Store } from '../../types';
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
enum ShoppingCartView {
  SHOPPING_CART = 'shopping_cart',
  USER_CANCELLED = 'USER_CANCELLED',
  PAYMENT_APPROVED = 'PAYMENT_APPROVED',
  PAYMENT_IN_PROCESS = 'PAYMENT_IN_PROCESS',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_REJECTED = 'PAYMENT_PENDING',
}
type SetViewAction = {
  type: 'set_view';
  view: ShoppingCartView;
};
type SetAddressAction = {
  type: 'set_address';
  address: Place;
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
type ChangeFormValueAction = {
  type: 'change_form_value';
  attribute: string;
  value: string;
};
type ValidateFormValuesAction = {
  type: 'validate_form_values';
};
type SetFormSubmittedAction = {
  type: 'set_form_submitted';
};
type SetFormErrorsAction = {
  type: 'set_form_errors';
  errors: { [key: string]: string[] };
};
type SetPendingRemovalAction = {
  type: 'set_pending_removal';
  pending_removal?: string;
};
type Action =
  | SetViewAction
  | SetAddressAction
  | SetShoppingCartSnapshotAction
  | SetSelectedStoreAction
  | ToogleEditProductsAction
  | ToogleExpandProductAction
  | SetPhoneModalAction
  | SetUpdatingPhoneAction
  | ChangeFormValueAction
  | ValidateFormValuesAction
  | SetFormSubmittedAction
  | SetFormErrorsAction
  | SetPendingRemovalAction;
type State = {
  view: ShoppingCartView;
  address: Place;
  shopping_cart_snapshot: ShoppingCartSnapshot;
  selected_store?: string;
  state_stores: StateStores;
  phone_modal: boolean;
  updating_phone: boolean;
  form: {
    phone?: string;

    submitted: boolean;
    errors?: { [key: string]: string[] };
  };
  pending_removal?: string;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_view':
      return { ...state, view: action.view };
    case 'set_address':
      return { ...state, address: action.address };
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
    case 'set_phone_modal':
      return {
        ...state,
        phone_modal: action.phone_modal,
      };
    case 'set_updating_phone':
      return {
        ...state,
        updating_phone: action.updating_phone,
      };
    case 'change_form_value':
      return {
        ...state,
        form: {
          ...state.form,
          [action.attribute]: action.value,
        },
      };
    case 'validate_form_values':
      if (!state.form.submitted) return state;
      return {
        ...state,
        form: {
          ...state.form,
          errors: validate(state.form, constraints),
        },
      };
    case 'set_form_submitted':
      return {
        ...state,
        form: {
          ...state.form,
          submitted: true,
        },
      };
    case 'set_form_errors':
      return {
        ...state,
        form: {
          ...state.form,
          errors: action.errors,
        },
      };
    case 'set_pending_removal':
      return {
        ...state,
        pending_removal: action.pending_removal,
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
      view: ShoppingCartView.SHOPPING_CART,
      address: userCache.getAddress() as Place,
      shopping_cart_snapshot: [],
      state_stores: {},
      phone_modal: false,
      updating_phone: false,
      form: {
        phone: (userCache.getData() as User).phone,
        submitted: false,
      },
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

  // event handler
  const updatePhone = async (phone: string) => {
    try {
      dispatch({ type: 'set_updating_phone', updating_phone: true });
      await userClient.update({
        pathVars: {
          id: (userCache.getData() as User).id,
        },
        body: {
          phone,
          phone_verified: false,
        },
      });
      userCache.updateData({ phone, phone_verified: false });
    } catch (error) {
      capture(prefix, 'Update phone error', error);
    } finally {
      dispatch({ type: 'set_updating_phone', updating_phone: false });
    }
  };

  const goToPayHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_form_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      Vibration.vibrate(400);
      dispatch({ type: 'set_form_errors', errors });
      return;
    }
    const store_snapshot = state.shopping_cart_snapshot.find(
      (store_snapshot) => store_snapshot.store.id === state.selected_store
    );
    if (!store_snapshot) {
      throw new Error(`${prefix} Selected store snapshot must be defined`);
    }
    if (!userCache.isLogged()) {
      navigation.navigate('SignIn', {
        redirect: {
          name: 'Checkout',
          params: {
            store_snapshot,
          },
        },
        dont_allow_guest: true,
        reason: 'to_buy',
      });
    } else {
      navigation.push('Checkout', { store_snapshot });
    }
  };

  const pressSetPhoneHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_phone_modal', phone_modal: true });
  };

  const changePhoneHandler = (phone: string) => {
    dispatch({ type: 'set_phone_modal', phone_modal: false });
    updatePhone(phone);
  };

  const closeModalPhoneHandler = () => {
    dispatch({ type: 'set_phone_modal', phone_modal: false });
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
    navigation.navigate('StoreV2', { store });
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

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = userCache.onChange((user) => {
        const address = userCache.getAddress() as Place;
        const phone = (user as User).phone as string;
        dispatch({ type: 'set_address', address });
        dispatch({
          type: 'change_form_value',
          attribute: 'phone',
          value: phone,
        });
        dispatch({
          type: 'validate_form_values',
        });
      });
      return () => {
        unsubscribe();
      };
    }, [])
  );

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
      if (!state.shopping_cart_snapshot.length) {
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      }
    }, [state.shopping_cart_snapshot])
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

  let addressText = `${address.route.short_name} ${address.street_number.short_name}`;
  if (address.apartment) {
    addressText = `${addressText} · ${address.apartment}`;
  }
  let phoneText = 'Agrega teléfono de contacto';
  if (state.form.phone) {
    phoneText = stringFormatter.toPhone(state.form.phone, {
      prefix: true,
    }) as string;
  }
  let mainAction: ReactNode = null;
  if (state.selected_store) {
    const match = state.shopping_cart_snapshot.find(
      (storeSnapshot) => storeSnapshot.store.id === state.selected_store
    );
    if (match) {
      mainAction = (
        <Button
          title={`Ir a pagar ${match.store.name}`}
          style={globalStyles.withMainActionAir}
          onPress={goToPayHandler}
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
          <View style={[{ flexDirection: 'row', marginBottom: 20 }]}>
            <MapPinShadedBlueIcon />
            <View style={{ marginLeft: 15 }}>
              <Text level={6} weight="bold" style={{ marginBottom: 2 }}>
                Dirección de entrega
              </Text>
              <Text level={6}>{addressText}</Text>
            </View>
          </View>
          <Touchable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingLeft: 5,
            }}
            onPress={pressSetPhoneHandler}
          >
            <View style={{ flex: 1 }}>
              <Text
                level={6}
                weight="bold"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ marginBottom: 2 }}
              >
                Número de teléfono
              </Text>
              <Text level={6} numberOfLines={1} ellipsizeMode="tail">
                {phoneText}
              </Text>
            </View>
            {state.updating_phone ? (
              <ActivityIndicator />
            ) : state.phone_modal ? (
              <Icon name="chevron-up" />
            ) : (
              <Icon name="chevron-down" />
            )}
          </Touchable>
          {state.form.errors?.phone?.length ? (
            <Text
              level={8}
              color={colors.red}
              style={{ marginTop: 5, marginLeft: 7 }}
            >
              {state.form.errors.phone[0]}
            </Text>
          ) : null}
        </View>

        <Divider type="thick" />

        {state.shopping_cart_snapshot.map((storeSnapshot, index, array) => {
          const store = storeSnapshot.store;
          const storeState = state.state_stores[store.id];
          const items = storeState.expanded
            ? storeSnapshot.items
            : storeSnapshot.items.slice(0, 3);
          const openInfo = utils.humanizeOpenInfo(store.opening_hours);
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
                      {!openInfo.open && (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 0,
                          }}
                        >
                          <Icon name="calendar" size={16} />
                          <Text
                            level={7}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            color={openInfo.open ? colors.black : colors.red}
                            style={{ flex: 1, marginLeft: 5 }}
                          >
                            {openInfo.message}
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
          },
          globalStyles.withMargin,
        ]}
      >
        {mainAction}
      </View>
      {state.phone_modal && (
        <SetPhoneModal
          value={state.form.phone}
          onChange={changePhoneHandler}
          onClose={closeModalPhoneHandler}
        />
      )}
      {state.pending_removal && (
        <ConfirmDialog
          title="¿Seguro que quieres eliminar la tienda seleccionada?"
          okText="Eliminar"
          onOk={confirmDialogOkHandler}
          onCancel={confirmDialogCancelHandler}
        />
      )}
    </View>
  );
};
