import React, { memo, useCallback } from 'react';
import { View, FlatList, GestureResponderEvent } from 'react-native';

// local components
import Item from './components/item';
// components
import Text from '../../../../../../components/text';
import Divider from '../../../../../../components/divider';
import Button from '../../../../../../components/buttons/button';
// types
import { SearchResponse, StoreProduct } from '../../../../../../types';
// styles
import globalStyles from '../../../../../../styles';
import colors from '../../../../../../styles/colors';

interface ComponentProps {
  navigation: any;
  title: string;
  response: SearchResponse<StoreProduct>;
}

export default memo(({ navigation, title, response }: ComponentProps) => {
  // event handlers
  const pressSeeAllHandler = useCallback((event: GestureResponderEvent) => {
    event.stopPropagation();
    navigation.navigate('Search', {
      filters: response.filters,
      sort: response.sort,
    });
  }, []);

  // render logic
  const more = response.hits.length < response.total;
  return (
    <View style={{ marginBottom: 20 }}>
      <Divider type="thick" style={{ marginBottom: 15 }} />
      <View
        style={[
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 15,
          },
          globalStyles.withMargin,
        ]}
      >
        <Text
          level={4}
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ flex: 1 }}
        >
          {title}
        </Text>
        {more && (
          <Button
            type="link"
            title={
              <Text level={6} weight="bold" color={colors.blue}>
                Ver todos
              </Text>
            }
            style={{ paddingRight: 0 }}
            onPress={pressSeeAllHandler}
          />
        )}
      </View>
      <FlatList
        horizontal
        data={response.hits}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item: StoreProduct) => item.id}
        renderItem={({ item, index }) => {
          return (
            <Item
              navigation={navigation}
              data={item}
              first={index === 0}
              last={index === response.hits.length - 1}
            />
          );
        }}
      />
    </View>
  );
});
