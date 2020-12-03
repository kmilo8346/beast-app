import React, { ReactNode, useEffect, useReducer, useRef } from 'react';
import { View, ScrollView, GestureResponderEvent, Image } from 'react-native';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import axios, { CancelTokenSource } from 'axios';
import isAfter from 'date-fns/isAfter';
import sub from 'date-fns/sub';

// local components
import Skeletton from './components/skeletton';
import ProductItem from './components/product-item';
import CreatePaymentLinkModal from './components/create-payment-link-modal';
// screen components
import ConfirmDialog from '../components/dialogs/confirm-dialog';
// components
import Icon from '../../components/icon';
import Text from '../../components/text';
import LoadingOverlay, {
  ILoadingOverlay,
  LoadingStatus,
} from '../../components/loading-overlay';
import Divider from '../../components/divider';
import Touchable from '../../components/touchable';
import ErrorView from '../../components/error-view';
import Button from '../../components/buttons/button';
import Toast, { IToast } from '../../components/toast';
import ButtonIcon from '../../components/buttons/button-icon';
import ActionSheet from '../../components/modals/action-sheet';
import BagHeadImage from '../../components/svgs/images/bag-head';
import ActionSheetContact from '../../components/modals/action-sheet-contact';
import PhoneFilledDotsBlueIcon from '../../components/svgs/icons/phone-filled-dots-blue';
// cache
import userCache from '../../cache/user';
import storeCache from '../../cache/store';
// clients
import orderClient from '../../clients/order-client';
import storeClient from '../../clients/store-client';
// libs
import * as utils from '../../lib/utils';
import { capture } from '../../lib/sentry';
import { eventEmitter } from '../../lib/event-emitter';
import dateFormatter from '../../lib/formatters/date-formatter';
import numberFormatter from '../../lib/formatters/number-formatter';
// types
import { CancellationExecuter, Order, OrderStatus, Store } from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component
const prefix = '[seller order details screen]';
let fetchOrderRequestSource: CancelTokenSource;
let fetchStoreRequestSource: CancelTokenSource;
type SetOrderAction = {
  type: 'set_order';
  order: Order;
};
type SetStoreAction = {
  type: 'set_store';
  store: Store;
};
type SetErrorAction = {
  type: 'set_error';
  error?: Error;
};
type SetContactModalAction = {
  type: 'set_contact_modal';
  contact_modal: boolean;
};
type SetAmountAction = {
  type: 'set_amount';
  amount: number;
};
type SetMapImageUrlAction = {
  type: 'set_map_image_url';
  map_image_url: string;
};
type SetPaymentLinkModalAction = {
  type: 'set_payment_link_modal';
  payment_link_modal: boolean;
};
type SetConfirmDialogAction = {
  type: 'set_confirm_dialog';
  confirm_dialog: boolean;
};
type SetConfirmErrorDialogAction = {
  type: 'set_confirm_error_dialog';
  confirm_error_dialog: boolean;
};
type SetDeliveryDialogAction = {
  type: 'set_delivery_dialog';
  delivery_dialog: boolean;
};
type SetDeliveryErrorDialogAction = {
  type: 'set_delivery_error_dialog';
  delivery_error_dialog: boolean;
};
type SetCancelDialogAction = {
  type: 'set_cancel_dialog';
  cancel_dialog: boolean;
};
type SetCancelErrorDialogAction = {
  type: 'set_cancel_error_dialog';
  cancel_error_dialog: boolean;
};
type SetOrderMenuActionSheetAction = {
  type: 'set_order_menu_action_sheet';
  order_menu_action_sheet: boolean;
};
type Action =
  | SetOrderAction
  | SetStoreAction
  | SetErrorAction
  | SetContactModalAction
  | SetAmountAction
  | SetMapImageUrlAction
  | SetPaymentLinkModalAction
  | SetConfirmDialogAction
  | SetConfirmErrorDialogAction
  | SetDeliveryDialogAction
  | SetDeliveryErrorDialogAction
  | SetCancelDialogAction
  | SetCancelErrorDialogAction
  | SetOrderMenuActionSheetAction;
type State = {
  order?: Order;
  store?: Store;
  error?: Error;
  contact_modal: boolean;
  amount?: number;
  map_image_url?: string;
  payment_link_modal: boolean;
  confirm_dialog: boolean;
  confirm_error_dialog: boolean;
  delivery_dialog: boolean;
  delivery_error_dialog: boolean;
  cancel_dialog: boolean;
  cancel_error_dialog: boolean;
  order_menu_action_sheet: boolean;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_order':
      return { ...state, order: action.order };
    case 'set_store':
      return { ...state, store: action.store };
    case 'set_error':
      return { ...state, error: action.error };
    case 'set_contact_modal':
      return { ...state, contact_modal: action.contact_modal };
    case 'set_amount':
      return { ...state, amount: action.amount };
    case 'set_map_image_url':
      return { ...state, map_image_url: action.map_image_url };
    case 'set_payment_link_modal':
      return { ...state, payment_link_modal: action.payment_link_modal };
    case 'set_confirm_dialog':
      return { ...state, confirm_dialog: action.confirm_dialog };
    case 'set_confirm_error_dialog':
      return { ...state, confirm_error_dialog: action.confirm_error_dialog };
    case 'set_delivery_dialog':
      return { ...state, delivery_dialog: action.delivery_dialog };
    case 'set_delivery_error_dialog':
      return { ...state, delivery_error_dialog: action.delivery_error_dialog };
    case 'set_cancel_dialog':
      return { ...state, cancel_dialog: action.cancel_dialog };
    case 'set_cancel_error_dialog':
      return { ...state, cancel_error_dialog: action.cancel_error_dialog };
    case 'set_order_menu_action_sheet':
      return {
        ...state,
        order_menu_action_sheet: action.order_menu_action_sheet,
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
  const [state, dispatch] = useReducer(reducer, {
    order:
      typeof route.params.order === 'string' ? undefined : route.params.order,
    store: storeCache.getData(),
    contact_modal: false,
    payment_link_modal: false,
    confirm_dialog: false,
    confirm_error_dialog: false,
    delivery_dialog: false,
    delivery_error_dialog: false,
    cancel_dialog: false,
    cancel_error_dialog: false,
    order_menu_action_sheet: false,
  });
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);
  const scrollRef = useRef<ScrollView>(null);
  const toastRef = useRef<IToast>(null);

  // event handlers
  const fetchOrder = async (id: string) => {
    try {
      dispatch({ type: 'set_error', error: undefined });
      if (fetchOrderRequestSource) {
        fetchOrderRequestSource.cancel();
      }
      fetchOrderRequestSource = axios.CancelToken.source();
      const order = await orderClient.get(
        {
          pathVars: {
            id,
          },
        },
        { cancelToken: fetchOrderRequestSource.token }
      );
      dispatch({ type: 'set_order', order });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Fetch order error', error);

        dispatch({ type: 'set_error', error });
      }
    }
  };

  const fetchStore = async (id: string) => {
    try {
      dispatch({ type: 'set_error', error: undefined });
      if (fetchStoreRequestSource) {
        fetchStoreRequestSource.cancel();
      }
      fetchStoreRequestSource = axios.CancelToken.source();
      const store = await storeClient.get(
        {
          pathVars: {
            id,
          },
        },
        { cancelToken: fetchStoreRequestSource.token }
      );
      dispatch({ type: 'set_store', store });
      storeCache.setData(store);
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Fetch store error', error);

        dispatch({ type: 'set_error', error });
      }
    }
  };

  const confirm = async () => {
    try {
      await loadingOverlayRef.current?.show();
      const updated = await orderClient.action('confirm', {
        pathVars: {
          id: state.order?.id as string,
        },
        source: ['status', 'updated_at'],
      });
      const order = {
        ...state.order,
        ...updated,
      };
      loadingOverlayRef.current?.status(LoadingStatus.OK);
      scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      setTimeout(() => {
        navigation.setParams({
          order,
        });
      }, 300);
      eventEmitter.emit('seller-order.updated', order);
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Confirm error', error);

        if (
          error.response?.status === 409 &&
          error.response.data.current_state
        ) {
          const order = error.response.data.current_state;
          setTimeout(() => {
            navigation.setParams({
              order,
            });
          }, 300);
          eventEmitter.emit('seller-order.updated', order);
          toastRef.current?.show({
            message: 'Orden desactualizada, actualizando...',
            type: 'ERROR',
            expiration: 3,
          });
          return;
        }

        setTimeout(() => {
          dispatch({
            type: 'set_confirm_error_dialog',
            confirm_error_dialog: true,
          });
        }, 300);
      }
    } finally {
      await loadingOverlayRef.current?.hide();
    }
  };

  const delivery = async () => {
    try {
      await loadingOverlayRef.current?.show();
      const updated = await orderClient.action('delivery', {
        pathVars: {
          id: state.order?.id as string,
        },
        source: ['status', 'updated_at'],
      });
      const order = {
        ...state.order,
        ...updated,
      };
      loadingOverlayRef.current?.status(LoadingStatus.OK);
      scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      setTimeout(() => {
        navigation.setParams({
          order,
        });
      }, 300);
      eventEmitter.emit('seller-order.updated', order);
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Delivery error', error);

        if (
          error.response?.status === 409 &&
          error.response.data.current_state
        ) {
          const order = error.response.data.current_state;
          setTimeout(() => {
            navigation.setParams({
              order,
            });
          }, 300);
          eventEmitter.emit('seller-order.updated', order);
          toastRef.current?.show({
            message: 'Orden desactualizada, actualizando...',
            type: 'ERROR',
            expiration: 3,
          });
          return;
        }

        setTimeout(() => {
          dispatch({
            type: 'set_delivery_error_dialog',
            delivery_error_dialog: true,
          });
        }, 300);
      }
    } finally {
      await loadingOverlayRef.current?.hide();
    }
  };

  const cancel = async () => {
    try {
      await loadingOverlayRef.current?.show();
      const updated = await orderClient.action('cancel', {
        pathVars: {
          id: state.order?.id as string,
        },
        body: {
          cancellation_information: {
            executer: CancellationExecuter.SELLER,
          },
        },
        source: ['status', 'updated_at'],
      });
      const order = {
        ...state.order,
        ...updated,
      };
      loadingOverlayRef.current?.status(LoadingStatus.OK);
      scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      setTimeout(() => {
        navigation.setParams({
          order,
        });
      }, 300);
      eventEmitter.emit('seller-order.updated', order);
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Cancel error', error);

        if (
          error.response?.status === 409 &&
          error.response.data.current_state
        ) {
          const order = error.response.data.current_state;
          setTimeout(() => {
            navigation.setParams({
              order,
            });
          }, 300);
          eventEmitter.emit('seller-order.updated', order);
          toastRef.current?.show({
            message: 'Orden desactualizada, actualizando...',
            type: 'ERROR',
            expiration: 3,
          });
          return;
        }

        setTimeout(() => {
          dispatch({
            type: 'set_cancel_error_dialog',
            cancel_error_dialog: true,
          });
        }, 300);
      }
    } finally {
      await loadingOverlayRef.current?.hide();
    }
  };

  const pressContactStoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_contact_modal', contact_modal: true });
  };

  const contactModalCloseHandler = () => {
    dispatch({ type: 'set_contact_modal', contact_modal: false });
  };

  const pressImageMapHandler = () => {
    Linking.openURL(
      utils.createUrl(`${Constants.manifest.extra.GOOGLE_MAPS_URL}/search/`, {
        api: 1,
        query: `${state.order?.transaction.delivery_address.location.lat},${state.order?.transaction.delivery_address.location.lon}`,
        query_place_id: state.order?.transaction.delivery_address.id,
      })
    );
  };

  const retryHandler = () => {
    if (typeof route.params.order === 'string') {
      fetchOrder(route.params.order);
    }
  };

  const pressPaymentLinkHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_payment_link_modal', payment_link_modal: true });
  };

  const paymentLinkModalCloseHandler = () => {
    dispatch({ type: 'set_payment_link_modal', payment_link_modal: false });
  };

  const pressConfirmHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({
      type: 'set_confirm_dialog',
      confirm_dialog: true,
    });
  };

  const pressDeliveryHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({
      type: 'set_delivery_dialog',
      delivery_dialog: true,
    });
  };

  const pressOrderMenuHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({
      type: 'set_order_menu_action_sheet',
      order_menu_action_sheet: true,
    });
  };

  const confirmDialogOkHandler = () => {
    dispatch({ type: 'set_confirm_dialog', confirm_dialog: false });
    setTimeout(() => {
      confirm();
    }, 300);
  };

  const confirmDialogCancelHandler = () => {
    dispatch({ type: 'set_confirm_dialog', confirm_dialog: false });
  };

  const confirmErrorDialogOkHandler = () => {
    dispatch({ type: 'set_confirm_error_dialog', confirm_error_dialog: false });
    setTimeout(() => {
      confirm();
    }, 300);
  };

  const confirmErrorDialogCancelHandler = () => {
    dispatch({ type: 'set_confirm_error_dialog', confirm_error_dialog: false });
  };

  const deliveryDialogOkHandler = () => {
    dispatch({
      type: 'set_delivery_dialog',
      delivery_dialog: false,
    });
    setTimeout(() => {
      delivery();
    }, 300);
  };

  const deliveryDialogCancelHandler = () => {
    dispatch({
      type: 'set_delivery_dialog',
      delivery_dialog: false,
    });
  };

  const deliveryErrorDialogOkHandler = () => {
    dispatch({
      type: 'set_delivery_error_dialog',
      delivery_error_dialog: false,
    });
    setTimeout(() => {
      delivery();
    }, 300);
  };

  const deliveryErrorDialogCancelHandler = () => {
    dispatch({
      type: 'set_delivery_error_dialog',
      delivery_error_dialog: false,
    });
  };

  const cancelDialogOkHandler = () => {
    dispatch({ type: 'set_cancel_dialog', cancel_dialog: false });
    setTimeout(() => {
      cancel();
    }, 300);
  };

  const cancelDialogCancelHandler = () => {
    dispatch({ type: 'set_cancel_dialog', cancel_dialog: false });
  };

  const cancelErrorDialogOkHandler = () => {
    dispatch({ type: 'set_cancel_error_dialog', cancel_error_dialog: false });
    setTimeout(() => {
      cancel();
    }, 300);
  };

  const cancelErrorDialogCancelHandler = () => {
    dispatch({ type: 'set_cancel_error_dialog', cancel_error_dialog: false });
  };

  const orderMenuCloseHandler = () => {
    dispatch({
      type: 'set_order_menu_action_sheet',
      order_menu_action_sheet: false,
    });
  };

  const orderMenuCallActionHandler = async (key: string) => {
    dispatch({
      type: 'set_order_menu_action_sheet',
      order_menu_action_sheet: false,
    });

    switch (key) {
      case 'cancel_order':
        setTimeout(() => {
          dispatch({ type: 'set_cancel_dialog', cancel_dialog: true });
        }, 300);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (typeof route.params.order === 'string') {
      fetchOrder(route.params.order);
    } else {
      dispatch({ type: 'set_order', order: route.params.order });
    }
    return () => {
      fetchOrderRequestSource && fetchOrderRequestSource.cancel();
    };
  }, [route.params.order]);

  useEffect(() => {
    if (!state.store) {
      fetchStore(userCache.getData()?.current_store as string);
    }
    return () => {
      fetchStoreRequestSource && fetchStoreRequestSource.cancel();
    };
  }, [state.store]);

  useEffect(() => {
    if (state.order) {
      dispatch({
        type: 'set_amount',
        amount: state.order.transaction.shopping_cart.items.reduce(
          (amount, item) => amount + item.qty * item.price,
          0
        ),
      });
    }
  }, [state.order?.transaction.shopping_cart.items]);

  useEffect(() => {
    if (state.order) {
      dispatch({
        type: 'set_map_image_url',
        map_image_url: utils.createUrl(
          `${Constants.manifest.extra.GOOGLE_MAPS_API_URL}/staticmap`,
          {
            center: `${state.order.transaction.delivery_address.location.lat},${state.order.transaction.delivery_address.location.lon}`,
            zoom: 13,
            size: '140x105',
            scale: 2,
            format: 'png',
            markers: `icon:${Constants.manifest.extra.GOOGLE_MAPS_CUSTOM_MARKER}|scale:2|${state.order.transaction.delivery_address.location.lat},${state.order.transaction.delivery_address.location.lon}`,
            key: Constants.manifest.extra.GOOGLE_MAPS_API_KEY,
          }
        ),
      });
    }
  }, [
    state.order?.transaction.delivery_address.location.lat,
    state.order?.transaction.delivery_address.location.lon,
  ]);

  // render logic
  if (state.error) {
    return (
      <View
        style={{
          backgroundColor: colors.white,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ErrorView onRetry={retryHandler} />
      </View>
    );
  }

  if (!state.order || !state.store) {
    return <Skeletton />;
  }

  let statusComponent: ReactNode = null;
  let photoComponent: ReactNode = <BagHeadImage width={55} height={64} />;
  let addressText = utils.formatPlace(state.order.transaction.delivery_address);
  let fullNameText = state.order.customer.first_name;
  let paymentButton: ReactNode = null;
  let mainActionComponent: ReactNode = null;
  if (state.order.status) {
    let statusTextComponent: ReactNode = null;
    let color = colors.yellow;
    const check = (
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: colors.blue,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icon name="check" color={colors.white} size={20} />
      </View>
    );
    const point = (
      <View
        style={{
          width: 19.8,
          height: 19.8,
          borderRadius: 100,
          backgroundColor: colors.blueLight4,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 7.2,
            height: 7.2,
            borderRadius: 100,
            backgroundColor: colors.blue,
          }}
        />
      </View>
    );

    if (state.order.status === OrderStatus.DELIVERED) {
      color = colors.green;
    } else if (state.order.status === OrderStatus.CANCELLED) {
      color = colors.red;
      statusTextComponent = (
        <Text level={6} weight="bold" style={{ marginBottom: 10 }}>
          Cancelada
        </Text>
      );
    }

    statusComponent = (
      <View>
        <View style={[globalStyles.withMargin, { paddingVertical: 15 }]}>
          {statusTextComponent}
          {state.order.status !== OrderStatus.CANCELLED && (
            <View style={{ marginBottom: 25 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1, alignItems: 'flex-start' }}>
                  {check}
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  {state.order.status === OrderStatus.CONFIRMED ||
                  state.order.status === OrderStatus.DELIVERED
                    ? check
                    : point}
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  {state.order.status === OrderStatus.DELIVERED ? check : point}
                </View>

                <View
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    zIndex: -1,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: colors.blackLight7,
                      height: 5,
                      flexDirection: 'row',
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        backgroundColor:
                          state.order.status === OrderStatus.CONFIRMED ||
                          state.order.status === OrderStatus.DELIVERED
                            ? colors.blueLight2
                            : colors.blackLight7,
                      }}
                    />
                    <View
                      style={{
                        flex: 1,
                        backgroundColor:
                          state.order.status === OrderStatus.DELIVERED
                            ? colors.blueLight2
                            : colors.blackLight7,
                      }}
                    />
                  </View>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingTop: 10,
                }}
              >
                <View style={{ flex: 1, alignItems: 'flex-start' }}>
                  <Text
                    level={6}
                    weight={
                      state.order.status === OrderStatus.CREATED
                        ? 'bold'
                        : 'normal'
                    }
                  >
                    Creada
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text
                    level={6}
                    weight={
                      state.order.status === OrderStatus.CONFIRMED
                        ? 'bold'
                        : 'normal'
                    }
                  >
                    Confirmada
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text
                    level={6}
                    weight={
                      state.order.status === OrderStatus.DELIVERED
                        ? 'bold'
                        : 'normal'
                    }
                  >
                    Entregada
                  </Text>
                </View>
              </View>
            </View>
          )}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                borderRadius: 50,
                backgroundColor: color,
                width: 10,
                height: 10,
              }}
            />
            <Text
              level={6}
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ marginLeft: 15, flex: 1 }}
            >
              {dateFormatter.format(
                new Date(state.order.updated_at),
                "dd MMMM, yyyy · HH:mm 'hrs'"
              )}
            </Text>
            {(state.order.status === OrderStatus.CREATED ||
              state.order.status === OrderStatus.CONFIRMED) && (
              <ButtonIcon
                icon="more-vertical"
                style={{ position: 'relative', right: -7 }}
                onPress={pressOrderMenuHandler}
              />
            )}
          </View>
        </View>
        <Divider />
      </View>
    );
  }
  if (state.order.transaction.delivery_address.apartment) {
    addressText = `${addressText} · ${state.order.transaction.delivery_address.apartment}`;
  }
  if (state.order.customer.last_name) {
    fullNameText = `${fullNameText} ${state.order.customer.last_name}`;
  }
  if (
    isAfter(new Date(state.order.created_at), sub(new Date(), { days: 3 })) &&
    state.store.payment_provider
  ) {
    paymentButton = (
      <Button
        type="link"
        title={
          <Text level={6} weight="bold" color={colors.blue}>
            Cobrar
          </Text>
        }
        style={{ paddingRight: 0 }}
        onPress={pressPaymentLinkHandler}
      />
    );
  }
  if (state.order.customer.photo_url) {
    photoComponent = (
      <Image
        source={{
          uri: state.order.customer.photo_url,
        }}
        style={{
          width: 50,
          height: 50,
          borderRadius: 100,
        }}
      />
    );
  }
  if (state.order.status === OrderStatus.CREATED) {
    mainActionComponent = (
      <View
        style={[
          globalStyles.withPadding,
          {
            paddingTop: 5,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          <Icon
            name="info"
            color={colors.blackLight3}
            style={{ marginTop: 5 }}
          />
          <Text
            level={6}
            color={colors.blackLight2}
            style={{ lineHeight: 20, marginLeft: 10, flex: 1 }}
          >
            Confirma para notificar al cliente. Si no tienes todo puedes
            contactarlo 😉.
          </Text>
        </View>
        <View style={globalStyles.withMainActionAir}>
          <Button title="Confirmar" onPress={pressConfirmHandler} />
        </View>
      </View>
    );
  } else if (state.order.status === OrderStatus.CONFIRMED) {
    mainActionComponent = (
      <View
        style={[
          globalStyles.withPadding,
          {
            paddingTop: 5,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          <Icon
            name="info"
            color={colors.blackLight3}
            style={{ marginTop: 5 }}
          />
          <Text
            level={6}
            color={colors.blackLight2}
            style={{ lineHeight: 20, marginLeft: 10 }}
          >
            Indícanos cuando entregues para cerrarle el pedido al cliente 😀.
          </Text>
        </View>
        <View style={[globalStyles.withMainActionAir]}>
          <Button title="Entregar" onPress={pressDeliveryHandler} />
        </View>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView ref={scrollRef} style={[{ flex: 1 }]}>
        {statusComponent}

        <View style={[{ marginVertical: 20 }, globalStyles.withMargin]}>
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 5,
            }}
          >
            {photoComponent}
            <View
              style={{
                marginLeft: 15,
                alignSelf: 'flex-start',
                paddingTop: 2,
                flex: 1,
              }}
            >
              <Text
                level={6}
                weight="bold"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  marginBottom: 5,
                  marginTop: !state.order.customer.created_at ? 15 : 0,
                }}
              >
                {fullNameText}
              </Text>
              {!!state.order.customer.created_at && (
                <Text
                  level={6}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={{ lineHeight: 20 }}
                >
                  {`Cliente desde el ${dateFormatter.format(
                    new Date(state.order.customer.created_at),
                    'd MMM yyyy'
                  )}`}
                </Text>
              )}
            </View>
          </View>

          <Touchable
            style={{
              backgroundColor: colors.blueLight3,
              borderWidth: 1,
              borderColor: colors.blueLight5,
              borderRadius: 13,
              paddingHorizontal: 20,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={pressContactStoreHandler}
          >
            <PhoneFilledDotsBlueIcon />
            <Text
              level={6}
              weight="bold"
              color={colors.blue}
              style={{ marginLeft: 15 }}
            >
              Contactar cliente
            </Text>
          </Touchable>
        </View>

        <Divider />

        <View
          style={[
            { flexDirection: 'row', marginVertical: 20 },
            globalStyles.withMargin,
          ]}
        >
          {!!state.map_image_url && (
            <Touchable onPress={pressImageMapHandler}>
              <Image
                source={{
                  uri: state.map_image_url,
                }}
                style={{
                  width: 140,
                  height: 105,
                  borderRadius: 13,
                }}
              />
            </Touchable>
          )}
          <View style={{ marginLeft: 15, marginTop: 0, flex: 1 }}>
            <Text
              level={6}
              weight="bold"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                marginBottom: 5,
              }}
            >
              Dirección
            </Text>
            <Text level={6} style={{ lineHeight: 20, marginBottom: 7 }}>
              {addressText}
            </Text>
          </View>
        </View>

        <Divider />

        <View style={[{ marginVertical: 20 }, globalStyles.withMargin]}>
          <View
            style={{
              marginBottom: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text level={5} weight="bold">
              Productos
            </Text>
            {paymentButton}
          </View>

          <Divider style={{ marginBottom: 15 }} />
          {state.order.transaction.shopping_cart.items.map(
            (item, index, array) => (
              <ProductItem
                key={`${item.id}`}
                data={item}
                last={index === array.length - 1}
              />
            )
          )}
          <Divider style={{ marginTop: 15 }} />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 20,
            }}
          >
            <Text level={5} weight="bold">
              Total
            </Text>
            {!!state.amount && (
              <Text level={6} weight="bold">
                {numberFormatter.toCurrency(state.amount)}
              </Text>
            )}
          </View>
        </View>

        <View style={{ marginBottom: 200 }} />
      </ScrollView>
      <View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.white,
          },
        ]}
      >
        <Toast ref={toastRef} containerStyle={[globalStyles.withMargin]} />
        {mainActionComponent}
      </View>
      {state.contact_modal && (
        <ActionSheetContact
          phone={state.order.customer.phone}
          onRequestClose={contactModalCloseHandler}
        />
      )}
      {state.payment_link_modal && (
        <CreatePaymentLinkModal
          order={state.order}
          store={state.store as Store}
          onClose={paymentLinkModalCloseHandler}
        />
      )}
      {state.confirm_dialog && (
        <ConfirmDialog
          title="¿Seguro que quieres confirmar?"
          okText="Si, Continuar"
          onOk={confirmDialogOkHandler}
          onCancel={confirmDialogCancelHandler}
        />
      )}
      {state.confirm_error_dialog && (
        <ConfirmDialog
          title="Ocurrió un error inesperado"
          message="No se pudo confirmar la orden"
          okText="Reintentar"
          onOk={confirmErrorDialogOkHandler}
          onCancel={confirmErrorDialogCancelHandler}
        />
      )}
      {state.delivery_dialog && (
        <ConfirmDialog
          title="¿Seguro que quieres entregar?"
          okText="Si, Continuar"
          onOk={deliveryDialogOkHandler}
          onCancel={deliveryDialogCancelHandler}
        />
      )}
      {state.delivery_error_dialog && (
        <ConfirmDialog
          title="Ocurrió un error inesperado"
          message="No se pudo entregar la orden"
          okText="Reintentar"
          onOk={deliveryErrorDialogOkHandler}
          onCancel={deliveryErrorDialogCancelHandler}
        />
      )}
      {state.cancel_dialog && (
        <ConfirmDialog
          title="¿Seguro que quieres cancelar la orden?"
          okText="Si, Continuar"
          onOk={cancelDialogOkHandler}
          onCancel={cancelDialogCancelHandler}
        />
      )}
      {state.cancel_error_dialog && (
        <ConfirmDialog
          title="Ocurrió un error inesperado"
          message="No se pudo cancelar la orden"
          okText="Reintentar"
          onOk={cancelErrorDialogOkHandler}
          onCancel={cancelErrorDialogCancelHandler}
        />
      )}
      {state.order_menu_action_sheet && (
        <ActionSheet
          options={[
            {
              key: 'cancel_order',
              text: 'Cancelar orden',
            },
            { key: 'cancel', text: 'Cerrar', icon: 'x', type: 'cancel' },
          ]}
          onRequestClose={orderMenuCloseHandler}
          onCallAction={orderMenuCallActionHandler}
        />
      )}
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
