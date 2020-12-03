import React, { ReactNode, useEffect, useReducer, useRef } from 'react';
import { View, ScrollView, GestureResponderEvent, Image } from 'react-native';
import axios, { CancelTokenSource } from 'axios';

// local components
import Skeletton from './components/skeletton';
import ProductItem from './components/product-item';
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
import ActionSheetContact from '../../components/modals/action-sheet-contact';
import MapPinShadedBlueIcon from '../../components/svgs/icons/map-pin-shaded-blue';
// clients
import orderClient from '../../clients/order-client';
// libs
import * as utils from '../../lib/utils';
import { capture } from '../../lib/sentry';
import cloudinary from '../../lib/cloudinary';
import { eventEmitter } from '../../lib/event-emitter';
import dateFormatter from '../../lib/formatters/date-formatter';
import numberFormatter from '../../lib/formatters/number-formatter';
// types
import { CancellationExecuter, Order, OrderStatus } from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component
const prefix = '[client order details screen]';
let fetchOrderRequestSource: CancelTokenSource;
type SetOrderAction = {
  type: 'set_order';
  order: Order;
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
type SetOrderMenuActionSheetAction = {
  type: 'set_order_menu_action_sheet';
  order_menu_action_sheet: boolean;
};
type SetCancelDialogAction = {
  type: 'set_cancel_dialog';
  cancel_dialog: boolean;
};
type SetCancelErrorDialogAction = {
  type: 'set_cancel_error_dialog';
  cancel_error_dialog: boolean;
};
type Action =
  | SetOrderAction
  | SetErrorAction
  | SetContactModalAction
  | SetAmountAction
  | SetOrderMenuActionSheetAction
  | SetCancelDialogAction
  | SetCancelErrorDialogAction;
type State = {
  order?: Order;
  error?: Error;
  contact_modal: boolean;
  amount?: number;
  order_menu_action_sheet: boolean;
  cancel_dialog: boolean;
  cancel_error_dialog: boolean;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_order':
      return { ...state, order: action.order };
    case 'set_error':
      return { ...state, error: action.error };
    case 'set_contact_modal':
      return { ...state, contact_modal: action.contact_modal };
    case 'set_amount':
      return { ...state, amount: action.amount };
    case 'set_order_menu_action_sheet':
      return {
        ...state,
        order_menu_action_sheet: action.order_menu_action_sheet,
      };
    case 'set_cancel_dialog':
      return { ...state, cancel_dialog: action.cancel_dialog };
    case 'set_cancel_error_dialog':
      return { ...state, cancel_error_dialog: action.cancel_error_dialog };
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
    contact_modal: false,
    order_menu_action_sheet: false,
    cancel_dialog: false,
    cancel_error_dialog: false,
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

  const cancel = async () => {
    try {
      await loadingOverlayRef.current?.show();
      const updated = await orderClient.action('cancel', {
        pathVars: {
          id: state.order?.id as string,
        },
        body: {
          cancellation_information: {
            executer: CancellationExecuter.CLIENT,
          },
        },
        source: ['status', 'updated_at'],
      });
      const orderUpdated = {
        ...state.order,
        ...updated,
      };
      loadingOverlayRef.current?.status(LoadingStatus.OK);
      scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      setTimeout(() => {
        navigation.setParams({
          order: orderUpdated,
        });
      }, 300);
      eventEmitter.emit('client-order.updated', orderUpdated);
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Cancel error', error);

        if (
          error.response?.status === 409 &&
          error.response.data.current_state
        ) {
          const backendOrder = error.response.data.current_state;
          setTimeout(() => {
            navigation.setParams({
              order: backendOrder,
            });
          }, 300);
          eventEmitter.emit('client-order.updated', backendOrder);
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

  const pressStoreHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('Store', {
      store: state.order?.transaction.shopping_cart.store,
    });
  };

  const pressOrderMenuHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({
      type: 'set_order_menu_action_sheet',
      order_menu_action_sheet: true,
    });
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

  const retryHandler = () => {
    if (typeof route.params.order === 'string') {
      fetchOrder(route.params.order);
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

  if (!state.order) {
    return <Skeletton />;
  }

  let statusComponent: ReactNode = null;
  let addressText = utils.formatPlace(state.order.transaction.delivery_address);
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
                    Creado
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
                    Confirmado
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
                    Entregado
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
            {state.order.status === OrderStatus.CREATED && (
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
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView style={[{ flex: 1 }]}>
        {statusComponent}

        <Touchable
          style={[
            { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
            globalStyles.withMargin,
          ]}
          onPress={pressStoreHandler}
        >
          <Image
            source={{
              uri: cloudinary.dynamicUrl(
                state.order.transaction.shopping_cart.store.images[0],
                'w_500'
              ),
            }}
            style={{
              width: 50,
              height: 50,
              borderRadius: 10,
            }}
          />
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
              style={{ marginBottom: 5 }}
            >
              {state.order.transaction.shopping_cart.store.name}
            </Text>
            <Text
              level={6}
              numberOfLines={2}
              ellipsizeMode="tail"
              style={{ lineHeight: 20 }}
            >
              {`Vendedor desde el ${dateFormatter.format(
                new Date(
                  state.order.transaction.shopping_cart.store.created_at
                ),
                'd MMM yyyy'
              )}`}
            </Text>
          </View>
          <Icon name="chevron-right" />
        </Touchable>

        <Divider />

        <View
          style={[
            { flexDirection: 'row', marginVertical: 20 },
            globalStyles.withMargin,
          ]}
        >
          <View style={{ width: 50, alignItems: 'center' }}>
            <MapPinShadedBlueIcon />
          </View>
          <View style={{ marginLeft: 15, flex: 1 }}>
            <Text level={6} weight="bold" style={{ marginBottom: 2 }}>
              Dirección de entrega
            </Text>
            <Text level={6} style={{ lineHeight: 20 }}>
              {addressText}
            </Text>
          </View>
        </View>

        <Divider />

        <View style={[{ marginVertical: 20 }, globalStyles.withMargin]}>
          <Text
            level={5}
            weight="bold"
            style={{
              marginBottom: 20,
            }}
          >
            Productos
          </Text>

          <Divider type="thin" style={{ marginBottom: 15 }} />
          {state.order.transaction.shopping_cart.items.map(
            (item, index, array) => (
              <ProductItem
                key={`${item.id}`}
                data={item}
                last={index === array.length - 1}
              />
            )
          )}
          <Divider type="thin" style={{ marginTop: 15 }} />

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

        <View style={globalStyles.withScreenAir} />
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
          globalStyles.withMargin,
        ]}
      >
        <Toast ref={toastRef} />
        <Button
          title="Contactar tienda"
          style={globalStyles.withMainActionAir}
          onPress={pressContactStoreHandler}
        />
      </View>
      {state.contact_modal && (
        <ActionSheetContact
          phone={state.order.transaction.shopping_cart.store.phone}
          onRequestClose={contactModalCloseHandler}
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
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
