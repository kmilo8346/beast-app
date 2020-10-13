import React from 'react';
import { View, ScrollView } from 'react-native';

// components
import Text from '../../../../components/text';
import Button from '../../../../components/buttons/button';
import Divider from '../../../../components/divider';
// screen components
import Dialog from '../../../components/dialogs/dialog';
// local components
import ItemComponent from '../item';
// libs
import * as utils from '../../../../lib/utils';
// types
import { Product } from '../../../../types';
// styles
import globalStyle from '../../../../styles';
import colors from '../../../../styles/colors';

interface ComponentProps {
  products: Product[];
  onOk?: () => void;
  onCancel?: () => void;
}

export default ({
  products,
  onOk = utils.noop,
  onCancel = utils.noop,
}: ComponentProps) => {
  // event handlers
  const pressOkHandler = () => {
    onOk();
  };
  const pressCancelHandler = () => {
    onCancel();
  };

  // render logic
  return (
    <Dialog>
      <View
        style={[
          globalStyle.withMargin,
          {
            justifyContent: 'center',
            paddingTop: 25,
          },
        ]}
      >
        <Text
          level={5}
          weight="bold"
          style={{ textAlign: 'center', lineHeight: 23 }}
        >
          Productos no diponibles en este momento
        </Text>
        <Text
          level={6}
          weight="light"
          style={{ marginBottom: 20, marginTop: 5, textAlign: 'center' }}
        >
          ¿Quieres descartar los siguientes productos y regresar al carrito?
        </Text>
        <Divider />
      </View>

      <ScrollView
        style={[{ paddingTop: 15, maxHeight: 200 }, globalStyle.withPadding]}
      >
        {products.map((item) => (
          <ItemComponent key={item.id} data={item} />
        ))}
        <View style={globalStyle.withScreenAir} />
      </ScrollView>

      <View style={globalStyle.withMargin}>
        <Divider />
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 10,
            marginTop: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <Button title="Cancelar" type="link" onPress={pressCancelHandler} />
          </View>
          <View
            style={{
              height: 30,
              width: 1,
              backgroundColor: colors.blackLight6,
            }}
          />
          <View style={{ flex: 1 }}>
            <Button
              title="Si, descartar"
              type="link"
              onPress={pressOkHandler}
              style={{ paddingHorizontal: 0 }}
            />
          </View>
        </View>
      </View>
    </Dialog>
  );
};
