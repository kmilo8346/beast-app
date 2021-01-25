import React, { memo, useCallback } from 'react';
import { View, FlatList, GestureResponderEvent } from 'react-native';

// local components
import Item from './components/item';
// components
import Divider from '../../../../../../components/divider';
import Button from '../../../../../../components/buttons/button';
// types
import { SearchResponse, StoreProduct } from '../../../../../../types';
// styles
import globalStyles from '../../../../../../styles';

interface ComponentProps {
  navigation: any;
  response: SearchResponse<StoreProduct>;
}

export default memo(({ navigation, response }: ComponentProps) => {
  // event handlers
  const pressExplorOrSearchHandler = useCallback(
    (event: GestureResponderEvent) => {
      event.stopPropagation();
      navigation.navigate('Search');
    },
    []
  );

  // render logic
  return (
    <View style={{ marginBottom: 20 }}>
      <Divider type="thick" style={{ marginBottom: 15 }} />

      <FlatList
        data={response.hits}
        ListFooterComponent={
          <View style={[{ paddingTop: 20 }, globalStyles.withMargin]}>
            <Button
              type="secondary"
              title="Explorar o buscar"
              onPress={pressExplorOrSearchHandler}
              style={{ marginBottom: 10 }}
            />
            <Button type="secondary" title="Ver todas las tiendas" />
          </View>
        }
        renderItem={({ item, index }) => {
          return (
            <Item
              key={item.id}
              navigation={navigation}
              data={item}
              last={index === response.hits.length - 1}
            />
          );
        }}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: StoreProduct) => item.id}
      />
    </View>
  );
});
