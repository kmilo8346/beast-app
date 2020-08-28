import React, { useState } from 'react';
import { ScrollView, View, Image, GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// components
import Text from '../../../../components/text';
import Divider from '../../../../components/divider';
import Touchable from '../../../../components/touchable';
import MapPinShadedBlueIcon from '../../../../components/svgs/icons/map-pin-shaded-blue';
import PhoneFilledDotsBlueIcon from '../../../../components/svgs/icons/phone-filled-dots-blue';
import ActionSheetContact from '../../../../components/modals/action-sheet-contact';
import Button from '../../../../components/buttons/button';
// store components
import FullModal, { FullModalProps } from '../full-modal';
// local components
import Item from './components/item';
// lib
import durationFormatter from '../../../../lib/formatters/duration-formatter';
import { navigate } from '../../../../lib/root-navigation';
import cloudinary from '../../../../lib/cloudinary';
// cache
import userCache from '../../../../cache/user';
import { ShoppingCartSnapshot } from '../../../../cache/shopping-cart';
// types
import { Store, LoggedUser } from '../../../../types';
// styles
import globalStyles from '../../../../styles';
import colors from '../../../../styles/colors';
import numberFormatter from '../../../../lib/formatters/number-formatter';

// instances outside component
const prefix = '[shopping cart modal]';

interface ComponentProps extends Omit<FullModalProps, 'children'> {
  store: Store;
  snapshot: ShoppingCartSnapshot;
}

export default ({ store, snapshot, ...otherProps }: ComponentProps) => {
  // state
  const [contact, setContact] = useState(false);
  const insets = useSafeAreaInsets();

  // event handler
  const pressContactSellerHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    setContact(true);
  };

  const contactCloseHandler = () => {
    setContact(false);
  };

  const goToPayHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    if (userCache.isLogged()) {
      const logged = userCache.getData() as LoggedUser;
      if (!logged.phone || !logged.phone_verified) {
        navigate('SetPhone', {
          redirect: {
            name: 'Checkout',
            params: {
              store,
              shopping_cart: snapshot,
            },
          },
        });
      } else {
        navigate('Checkout', {
          store,
          shopping_cart: snapshot,
        });
      }
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
      });
    }
    otherProps.onClose && otherProps.onClose();
  };

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
  return (
    <FullModal {...otherProps}>
      <Text
        level={3}
        weight="bold"
        style={[{ marginBottom: 10 }, globalStyles.withMargin]}
      >
        Mi Pedido
      </Text>

      <ScrollView style={{ flex: 1, paddingTop: 10 }}>
        <View
          style={[
            { flexDirection: 'row', marginBottom: 15 },
            globalStyles.withMargin,
          ]}
        >
          <Image
            source={{ uri: cloudinary.dynamicUrl(image, 'w_50,h_50,c_scale') }}
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

        <Divider type="thick" style={{ marginBottom: 20 }} />

        <View
          style={[
            { flexDirection: 'row', marginBottom: 20 },
            globalStyles.withMargin,
          ]}
        >
          <MapPinShadedBlueIcon />
          <View style={{ marginLeft: 15 }}>
            <Text level={6} weight="bold" style={{ marginBottom: 2 }}>
              Dirección de entrega
            </Text>
            <Text level={6}>{addressText}</Text>
          </View>
        </View>

        <Touchable
          style={[
            {
              backgroundColor: colors.blueLight3,
              borderWidth: 1,
              borderColor: colors.blueLight5,
              borderRadius: 13,
              paddingHorizontal: 20,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
            },
            globalStyles.withMargin,
          ]}
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

        <Divider type="thick" style={{ marginBottom: 20 }} />

        <View style={globalStyles.withMargin}>
          <Text level={4} weight="bold" style={{ marginBottom: 15 }}>
            Productos
          </Text>

          <Divider style={{ marginBottom: 15 }} />

          {snapshot.items.map((item) => (
            <Item key={item.id} data={item} />
          ))}

          <Divider style={{ marginBottom: 20 }} />

          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
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
    </FullModal>
  );
};
