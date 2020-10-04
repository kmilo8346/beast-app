import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Image,
  GestureResponderEvent,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

// constraints
import constraints from './constraints';
// components
import Text from '../../../../components/text';
import Divider from '../../../../components/divider';
import Touchable from '../../../../components/touchable';
import MapPinShadedBlueIcon from '../../../../components/svgs/icons/map-pin-shaded-blue';
import PhoneFilledDotsBlueIcon from '../../../../components/svgs/icons/phone-filled-dots-blue';
import ActionSheetContact from '../../../../components/modals/action-sheet-contact';
import Button from '../../../../components/buttons/button';
import BasketCatImage from '../../../../components/svgs/images/basket-cat';
import Icon from '../../../../components/icon';
// screen components
import FullModal, { FullModalProps } from '../../../components/full-modal';
// local components
import ItemComponent from './components/item';
import ModalSetPhone from './components/modal-set-phone';
// lib
import durationFormatter from '../../../../lib/formatters/duration-formatter';
import { navigate } from '../../../../lib/root-navigation';
import cloudinary from '../../../../lib/cloudinary';
import * as utils from '../../../../lib/utils';
import validate from '../../../../lib/validate';
import { capture } from '../../../../lib/sentry';
import numberFormatter from '../../../../lib/formatters/number-formatter';
import stringFormatter from '../../../../lib/formatters/string-formatter';
// clients
import userClient from '../../../../clients/user-client';
// cache
import userCache from '../../../../cache/user';
import shoppingCartsCache from '../../../../cache/shopping-carts';
import ShoppingCartCache, {
  ShoppingCartSnapshot,
} from '../../../../cache/shopping-cart';
// types
import { Store, Item, User } from '../../../../types';
// styles
import globalStyles from '../../../../styles';
import colors from '../../../../styles/colors';

// instances outside component
const prefix = '[shopping cart modal]';

interface ComponentProps extends Omit<FullModalProps, 'children'> {
  store: Store;
}

export default ({ store, ...otherProps }: ComponentProps) => {
  // state
  const [
    shoppingCartCache,
    setShoppingCartCache,
  ] = useState<ShoppingCartCache | null>(null);
  const [user, setUser] = useState<User>(userCache.getData() as User);
  const [snapshot, setSnapshot] = useState<ShoppingCartSnapshot | null>(null);
  const [contact, setContact] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<string[] | undefined>();
  const [submited, setSubmited] = useState(false);
  const [modalPhone, setModalPhone] = useState(false);
  const [updating, setUpdating] = useState(false);
  const insets = useSafeAreaInsets();

  // event handler
  const instanceCache = async () => {
    const cache = await shoppingCartsCache.get(store.id);
    setShoppingCartCache(cache);
  };

  const updateUser = async (phone: string) => {
    try {
      setUpdating(true);
      await userClient.update({
        pathVars: {
          id: user.id,
        },
        body: {
          phone,
          phone_verified: false,
        },
      });
      userCache.updateData({ phone, phone_verified: false });
    } catch (error) {
      capture(prefix, 'Update user error', error);
    } finally {
      setUpdating(false);
    }
  };

  const pressContactSellerHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    setContact(true);
  };

  const contactCloseHandler = () => {
    setContact(false);
  };

  const goToPayHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    setSubmited(true);
    // validate
    const errors = validate.single(user.phone, constraints.phone);
    if (errors) {
      Vibration.vibrate(400);
      setErrors(errors);
      return;
    }

    if (userCache.isLogged()) {
      navigate('Checkout', {
        store,
        shopping_cart: snapshot,
      });
    } else {
      navigate('SignIn', {
        redirect: {
          name: 'Checkout',
          params: {
            store,
            shopping_cart: snapshot,
          },
        },
        dont_allow_guest: true,
        reason: 'to_buy',
      });
    }
    otherProps.onClose && otherProps.onClose();
  };

  const pressToogleEditHandler = () => {
    setEditing((editting) => !editting);
  };

  const changeItemQtyHandler = (item: Item, qty: number) => {
    shoppingCartCache?.set(item, qty);
  };

  const pressSetPhoneHandler = () => {
    setModalPhone(true);
  };

  const changePhoneHandler = (phone: string) => {
    setModalPhone(false);
    if (submited) {
      setErrors(validate.single(phone, constraints.phone));
    }

    updateUser(phone);
  };

  const closeModalPhoneHandler = () => {
    setModalPhone(false);
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = userCache.onChange((user) => {
        setUser(user as User);
      });
      return () => {
        unsubscribe();
      };
    }, [])
  );

  useEffect(() => {
    instanceCache();
  }, []);

  useEffect(() => {
    let unsubscribe: any = utils.noop;
    if (shoppingCartCache) {
      unsubscribe = shoppingCartCache.onChange(() => {
        const snapshopt = (shoppingCartCache as ShoppingCartCache).getSnapshot();
        setSnapshot(snapshopt);
      });
    }
    return () => {
      unsubscribe();
    };
  }, [shoppingCartCache]);

  useEffect(() => {
    if (snapshot && snapshot.items.length === 0) {
      setTimeout(() => {
        otherProps.onClose && otherProps.onClose();
      }, 1000);
    }
  }, [snapshot]);

  // render logic
  const image = store.images[0];
  const timeText = durationFormatter.humanizeDurationRange(
    store.delivery_time.gte,
    store.delivery_time.lte
  );
  const address = userCache.getAddress();
  if (!address) {
    throw new Error(`${prefix} User address must be defined`);
  }
  let addressText = `${address.route.short_name} ${address.street_number.short_name}`;
  if (address.apartment) {
    addressText = `${addressText} · ${address.apartment}`;
  }
  let phoneText = 'Agrega teléfono de contacto';
  if (user.phone) {
    phoneText = stringFormatter.toPhone(user.phone, { prefix: true }) as string;
  }

  let content: ReactNode | null = null;
  if (!snapshot) {
    content = null;
  } else if (snapshot.items.length === 0) {
    content = (
      <View style={{ flex: 1 }}>
        <Text
          level={3}
          weight="bold"
          style={[{ marginBottom: 10 }, globalStyles.withMargin]}
        >
          Mi Pedido
        </Text>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <BasketCatImage />
          <ActivityIndicator />
        </View>
      </View>
    );
  } else {
    content = (
      <View style={{ flex: 1 }}>
        <Text
          level={3}
          weight="bold"
          style={[{ marginBottom: 10 }, globalStyles.withMargin]}
        >
          Mi Pedido
        </Text>

        <ScrollView style={{ flex: 1, paddingTop: 10 }}>
          <View style={[{ marginBottom: 15 }, globalStyles.withMargin]}>
            <View style={{ flexDirection: 'row', marginBottom: 15 }}>
              <Image
                source={{ uri: cloudinary.dynamicUrl(image, 'w_100') }}
                style={{ width: 50, height: 50, borderRadius: 10 }}
              />
              <View style={{ marginLeft: 15, paddingTop: 5 }}>
                <Text
                  level={4}
                  weight="bold"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ marginBottom: 2 }}
                >
                  {store.name}
                </Text>
                <Text level={6} numberOfLines={1} ellipsizeMode="tail">
                  {timeText}
                </Text>
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
              onPress={pressContactSellerHandler}
            >
              <PhoneFilledDotsBlueIcon />
              <Text
                level={5}
                weight="bold"
                color={colors.blue}
                style={{ marginLeft: 15 }}
              >
                Contactar al vendedor
              </Text>
            </Touchable>
          </View>

          <Divider type="thick" style={{ marginBottom: 20 }} />

          <View style={[{ marginBottom: 20 }, globalStyles.withMargin]}>
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
              {updating ? <ActivityIndicator /> : <Icon name="chevron-right" />}
            </Touchable>
            {errors && errors.length ? (
              <Text
                level={8}
                color={colors.red}
                style={{ marginTop: 5, marginLeft: 7 }}
              >
                {errors[0]}
              </Text>
            ) : null}
          </View>

          <Divider type="thick" style={{ marginBottom: 20 }} />

          <View style={globalStyles.withMargin}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 15,
              }}
            >
              <Text level={4} weight="bold">
                Productos
              </Text>
              <Button
                type="link"
                title={
                  <Text level={6} weight="bold" color={colors.blue}>
                    {editing ? 'Listo' : 'Editar'}
                  </Text>
                }
                onPress={pressToogleEditHandler}
                style={{ paddingRight: 0 }}
              />
            </View>

            <Divider style={{ marginBottom: 15 }} />

            {snapshot.items.map((item) => (
              <ItemComponent
                key={item.id}
                data={item}
                editing={editing}
                onChange={changeItemQtyHandler}
              />
            ))}

            <Divider style={{ marginBottom: 20 }} />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text level={5} weight="bold">
                Total
              </Text>
              <Text level={4} weight="bold">
                {numberFormatter.toCurrency(snapshot.stats.ammount)}
              </Text>
            </View>
          </View>

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
          <Button
            title="Ir a pagar"
            style={globalStyles.withMainActionAir}
            onPress={goToPayHandler}
          />
        </View>

        {contact && (
          <ActionSheetContact
            phone={store.phone}
            onRequestClose={contactCloseHandler}
          />
        )}
      </View>
    );
  }

  return (
    <FullModal {...otherProps}>
      {content}
      {modalPhone && (
        <ModalSetPhone
          value={user.phone}
          onChange={changePhoneHandler}
          onClose={closeModalPhoneHandler}
        />
      )}
    </FullModal>
  );
};
