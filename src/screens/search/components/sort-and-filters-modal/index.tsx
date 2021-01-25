import React, { ReactNode, useEffect, useState } from 'react';
import { GestureResponderEvent, View } from 'react-native';
import isEqual from 'lodash.isequal';

// components
import Text from '../../../../components/text';
import Icon from '../../../../components/icon';
import Switch from '../../../../components/switch';
import Modal from '../../../../components/modals/modal';
import Touchable from '../../../../components/touchable';
import Button from '../../../../components/buttons/button';
// styles
import globalStyles from '../../../../styles';
import colors from '../../../../styles/colors';
import { Place } from '../../../../types';

const options = [
  {
    title: 'Fecha en que se agregó',
    value: { created_at: 'desc' },
  },
  {
    title: 'Precio: de menor a mayor',
    value: { price: 'asc' },
  },
  {
    title: 'Precio: de mayor a menor',
    value: { price: 'desc' },
  },
];

interface ComponentProps {
  sort: { title: string; value: { [key: string]: any } };
  filters: { [key: string]: any };
  address: Place;
  onChange: (
    sort: { title: string; value: { [key: string]: any } },
    filters: { [key: string]: any }
  ) => void;
  onClose: () => void;
}

export default ({
  sort: s,
  filters: f,
  address,
  onChange,
  onClose,
}: ComponentProps) => {
  // state
  const [sort, setSort] = useState(s);
  const [filters, setFilters] = useState(f);
  const [changed, setChanged] = useState(false);
  const [selectSort, setSelectSort] = useState(false);

  // event handlers
  const storeAddressChangeHandler = (value: boolean) => {
    if (!value) {
      setFilters((prev) => {
        const f = { ...prev };
        delete f.store_address;
        return f;
      });
    } else {
      setFilters((prev) => ({ ...prev, store_address: address.id }));
    }
  };

  const storeOpenChangeHandler = (value: boolean) => {
    if (!value) {
      setFilters((prev) => {
        const f = { ...prev };
        delete f.store_open;
        return f;
      });
    } else {
      setFilters((prev) => ({ ...prev, store_open: true }));
    }
  };

  const pressApplyHandler = () => {
    onChange(sort, filters);
  };

  const pressSortHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    setSelectSort(true);
  };

  useEffect(() => {
    setChanged(!isEqual(s, sort) || !isEqual(f, filters));
  }, [sort, filters]);

  // render logic
  let title = 'Ordenar y filtrar';
  let content: ReactNode = (
    <View style={globalStyles.withMargin}>
      <View style={globalStyles.modalSubtitleSpace} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <Text level={6} style={{ flex: 1 }}>
          Ordenar por
        </Text>
        <Touchable
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={pressSortHandler}
        >
          <Text level={7} color={colors.blackLight2} style={{ marginRight: 3 }}>
            {sort.title}
          </Text>
          <Icon name="chevron-right" size={18} color={colors.blackLight2} />
        </Touchable>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <Text level={6} style={{ flex: 1 }}>
          En tu dirección
        </Text>
        <Switch
          value={!!filters.store_address}
          onValueChange={storeAddressChangeHandler}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 30,
        }}
      >
        <Text level={6} style={{ flex: 1 }}>
          Tiendas abiertas
        </Text>
        <Switch
          value={!!filters.store_open}
          onValueChange={storeOpenChangeHandler}
        />
      </View>

      <Button
        title="Aplicar"
        disabled={!changed}
        onPress={pressApplyHandler}
        style={globalStyles.withMainActionAir}
      />
    </View>
  );
  if (selectSort) {
    title = '';
    content = (
      <View style={globalStyles.withMargin}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Touchable
            style={{
              paddingLeft: 0,
              paddingRight: 5,
              paddingVertical: 3,
              justifyContent: 'center',
            }}
            onPress={(event: GestureResponderEvent) => {
              event.stopPropagation();
              setSelectSort(false);
            }}
          >
            <Icon
              name="chevron-left"
              style={{ position: 'relative', left: -3 }}
            />
          </Touchable>
          <Text level={3} weight="bold" style={{ marginBottom: 5 }}>
            Ordenar por
          </Text>
        </View>
        <View style={globalStyles.modalSubtitleSpace} />
        {options.map((option, index) => {
          const selected = isEqual(sort.value, option.value);
          return (
            <Touchable
              key={`${index}`}
              style={{
                marginBottom: 10,
                paddingBottom: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={(event: GestureResponderEvent) => {
                event.stopPropagation();
                setSort(option);
                setSelectSort(false);
              }}
            >
              {selected ? (
                <Icon name="check-circle" size={18} />
              ) : (
                <Icon name="circle" size={18} />
              )}
              <Text
                level={6}
                weight={selected ? 'bold' : 'normal'}
                style={{ marginLeft: 15 }}
              >
                {option.title}
              </Text>
            </Touchable>
          );
        })}
        <View style={globalStyles.withMainActionAir} />
      </View>
    );
  }

  return (
    <View>
      <Modal
        onRequestClose={onClose}
        title={title}
        modalStyle={{ height: 320 }}
      >
        {content}
      </Modal>
    </View>
  );
};
