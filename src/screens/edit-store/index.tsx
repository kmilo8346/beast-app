import React, { ReactNode, useEffect, useReducer } from 'react';
import { View, ScrollView, Image } from 'react-native';

// local components
import Input from './components/input';
import MercadoPagoInput from './components/mercado-pago-input';
import VisibilityInput from './components/visibility-input';
// components
import Text from '../../components/text';
// cache
import storeCache from '../../cache/store';
// libs
import cloudinary from '../../lib/cloudinary';
import stringFormatter from '../../lib/formatters/string-formatter';
import numberFormatter from '../../lib/formatters/number-formatter';
import durationFormatter from '../../lib/formatters/duration-formatter';
// types
import { Store } from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component

type SetStoreAction = {
  type: 'set_store';
  store: Store;
};
type Action = SetStoreAction;
type State = {
  store: Store;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_store':
      return { ...state, store: action.store };
    default:
      return state;
  }
};

interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    store: storeCache.getData() as Store,
  });

  // event handlers
  const pressImageHandler = () => {
    navigation.navigate('EditStoreSetImage', {
      id: state.store.id,
      images: state.store.images,
      reference: state.store.reference,
    });
  };

  const pressNameHandler = () => {
    navigation.navigate('EditStoreSetName', {
      id: state.store.id,
      name: state.store.name,
    });
  };

  const pressDescriptionHandler = () => {
    navigation.navigate('EditStoreSetDescription', {
      id: state.store.id,
      description: state.store.description,
    });
  };

  const pressDeliveryAreaHandler = () => {
    navigation.navigate('EditStoreSetDeliveryArea', {
      id: state.store.id,
      delivery_area: state.store.delivery_area,
    });
  };

  const pressDeliveryTimeHandler = () => {
    navigation.navigate('EditStoreSetDeliveryTime', {
      id: state.store.id,
      delivery_time: state.store.delivery_time,
    });
  };

  const pressOpeningHoursHandler = () => {
    navigation.navigate('EditStoreSetOpeningHours', {
      id: state.store.id,
      opening_hours: state.store.opening_hours,
    });
  };

  useEffect(() => {
    const unsubscribe = storeCache.onChange((store) => {
      dispatch({ type: 'set_store', store: store as Store });
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // render logic
  let delivery_area_text = '';
  let delivery_time_text = '';
  const image = cloudinary.dynamicUrl(state.store.images[0], 'w_214');
  if (state.store.delivery_area) {
    delivery_area_text = `Radio de entrega ${state.store.delivery_area.radius} · `;
    if (state.store.delivery_area.center.route) {
      delivery_area_text = `${delivery_area_text} ${state.store.delivery_area.center.route.short_name}`;
      if (state.store.delivery_area.center.street_number) {
        delivery_area_text = `${delivery_area_text} ${state.store.delivery_area.center.street_number.short_name}`;
      }
    } else if (state.store.delivery_area.center.locality) {
      delivery_area_text = `${delivery_area_text} ${state.store.delivery_area.center.locality.short_name}`;
    } else {
      delivery_area_text = `${delivery_area_text} ${state.store.delivery_area.center.administrative_area_level_3.short_name}`;
    }
  }
  if (state.store.delivery_time) {
    delivery_time_text = durationFormatter.humanizeDurationRange(
      state.store.delivery_time.gte,
      state.store.delivery_time.lte
    );
  }
  return (
    <ScrollView
      style={[
        { flex: 1, backgroundColor: colors.white, paddingTop: 15 },
        globalStyles.withPadding,
      ]}
    >
      <Input
        label="Imagen"
        value={
          <View>
            <Image
              source={{ uri: image }}
              style={{ width: 107, height: 107, borderRadius: 10 }}
            />
          </View>
        }
        placeholder="Añadir imagen"
        onPress={pressImageHandler}
      />
      <Input
        label="Nombre"
        value={state.store.name}
        placeholder="Añadir nombre"
        onPress={pressNameHandler}
      />
      <Input
        label="Descripción"
        value={state.store.description}
        placeholder="Añadir descripción"
        onPress={pressDescriptionHandler}
      />
      <Input
        disabled
        label="Teléfono"
        value={stringFormatter.toPhone(state.store.phone, { prefix: true })}
        placeholder="Añadir teléfono"
      />
      <Input
        label="Área de despacho"
        placeholder="Añadir área de despacho"
        value={delivery_area_text}
        onPress={pressDeliveryAreaHandler}
      />
      <Input
        label="Tiempo de entrega"
        placeholder="Añadir tiempo de entrega"
        value={delivery_time_text}
        onPress={pressDeliveryTimeHandler}
      />
      <Input
        label="Horario de atención"
        placeholder="Añadir horario de atención"
        value={
          <View style={{ marginRight: 0 }}>
            {state.store.opening_hours.map((day_opening_hours, index) => {
              let component: ReactNode = <Text level={6}>Cerrado</Text>;
              if (day_opening_hours.hours) {
                if (day_opening_hours.hours.length) {
                  component = day_opening_hours.hours.map((hours, index) => {
                    return (
                      <Text
                        key={`${index}`}
                        level={6}
                        style={{ marginBottom: 3 }}
                      >
                        {`${numberFormatter.humanizeTime(
                          hours.open
                        )} a ${numberFormatter.humanizeTime(hours.close)}`}
                      </Text>
                    );
                  });
                }
              } else if (
                !(day_opening_hours.open === 0 && day_opening_hours.close === 0)
              ) {
                <Text level={6} style={{ marginBottom: 3 }}>
                  {`${numberFormatter.humanizeTime(
                    day_opening_hours.open
                  )} a ${numberFormatter.humanizeTime(
                    day_opening_hours.close
                  )}`}
                </Text>;
              }
              return (
                <View
                  key={`${day_opening_hours.day}-${index}`}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}
                >
                  <Text level={6}>
                    {stringFormatter.toWeekDay(day_opening_hours.day, {
                      capitalize: true,
                    })}
                  </Text>
                  <View>{component}</View>
                </View>
              );
            })}
          </View>
        }
        onPress={pressOpeningHoursHandler}
      />
      <MercadoPagoInput
        id={state.store.id}
        provider={state.store.payment_provider}
      />
      <VisibilityInput id={state.store.id} enabled={state.store.enabled} />

      <View style={globalStyles.withScreenAir} />
    </ScrollView>
  );
};
