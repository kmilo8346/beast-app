import React from 'react';
import { View, Image } from 'react-native';

// components
import { Container, Text, InputSelectCard } from '../../components';
// containers
import UserProvider from '../../containers/user';
import CartProvider from '../../containers/cart';
// libs
import numberFormatter from '../../lib/formatters/number-formatter';
// styles
import colors from '../../styles/colors';

export default () => {
  // state
  const userContainer = UserProvider.useContainer();
  const currentAddressId = userContainer.getCurrentAddress();
  const currentAddress = userContainer
    .getAddresses()
    .find((address) => address.id === currentAddressId);
  const cartContainer = CartProvider.useContainer();
  const stats = cartContainer.getStats();
  console.log(stats);

  return (
    <Container withMargin>
      <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 20 }}>
        <Image
          source={{
            uri:
              'https://maps.googleapis.com/maps/api/staticmap?center=-33.361884%2C-70.7016857&zoom=17&size=640x640&scale=2&format=png8&markers=icon%3Ahttps%3A%2F%2Fi.ibb.co%2FnsN7JK3%2Fbluelocationpoint.png%7Cscale%3A2%7C-33.361884%2C-70.7016857&key=AIzaSyAAOlSNXdrroFn0gnBi5ApTDnAqWYWRZn4',
          }}
          style={{ width: 122, height: 122, borderRadius: 10 }}
        />
        <View style={{ flex: 1, marginLeft: 20 }}>
          <Text
            level={5}
            numberOfLines={2}
            style={{ marginTop: 15, lineHeight: 20, color: colors.blackLight3 }}
          >
            Tu compra llegará a la dirección
          </Text>
          <Text
            level={6}
            numberOfLines={2}
            style={{ marginTop: 10, lineHeight: 20 }}
          >
            {`${currentAddress?.route.shortName} ${currentAddress?.streetNumber.shortName}, ${currentAddress?.apartment}`}
          </Text>
        </View>
      </View>
      <InputSelectCard />
      <View style={{ flex: 1, maxHeight: 50 }} />
      <View>
        {Object.keys(stats.byStores).map((storeId) => {
          const storeStats = stats.byStores[storeId];
          return (
            <View
              key={storeId}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <Text level={5}>{storeStats.name}</Text>
              <Text level={6}>
                {numberFormatter.toCurrency(storeStats.ammount)}
              </Text>
            </View>
          );
        })}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 5,
          }}
        >
          <Text level={5} weight="bold">
            Total
          </Text>
          <Text level={6} weight="bold">
            {numberFormatter.toCurrency(stats.ammount)}
          </Text>
        </View>
      </View>
    </Container>
  );
};
