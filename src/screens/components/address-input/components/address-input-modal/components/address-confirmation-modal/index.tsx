import React, { useReducer } from 'react';
import {
  Modal,
  GestureResponderEvent,
  View,
  Image,
  Platform,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

// components
import Icon from '../../../../../../../components/icon';
import Text from '../../../../../../../components/text';
import Touchable from '../../../../../../../components/touchable';
import Button from '../../../../../../../components/buttons/button';
// lib
import * as utils from '../../../../../../../lib/utils';
// types
import { Place } from '../../../../../../../types';
// styles
import globalStyles from '../../../../../../../styles';

const BluerMarkerImage = require('../../../../../../../../assets/images/bluemarker.png');

// instances outside component
const MARKER_WIDTH = 40;
const MARKER_HEIGHT = 60;

type SetRegionAction = {
  type: 'set_region';
  region: Region;
};
type Action = SetRegionAction;
type State = {
  region: Region;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_region':
      return { ...state, region: action.region };
    default:
      return state;
  }
};

interface ComponentProps {
  value: Place;
  onChange: (value: Place) => void;
  onClose: () => void;
}

export default ({ value, onChange, onClose }: ComponentProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    region: {
      latitude: value.location.lat,
      longitude: value.location.lon,
      latitudeDelta: 0.0015,
      longitudeDelta: 0.0015,
    },
  });

  // event handlers
  const pressCloseHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onClose();
  };

  const dismissHandler = () => {
    onClose();
  };

  const requestCloseHandler = () => {
    onClose();
  };

  const regionChangeCompleteHandler = (region: Region) => {
    dispatch({ type: 'set_region', region });
  };

  const pressConfirmHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onChange({
      ...value,
      location: {
        lat: state.region.latitude,
        lon: state.region.longitude,
      },
    });
  };

  // render logic
  const insets = useSafeAreaInsets();
  let closeButton = (
    <Touchable
      style={{
        position: 'absolute',
        top: insets.top,
        left: 0,
        zIndex: 9,
        paddingHorizontal: 15,
        paddingVertical: 10,
      }}
      onPress={pressCloseHandler}
    >
      <Icon name="x" size={28} />
    </Touchable>
  );
  if (Platform.OS === 'android') {
    closeButton = <View>{closeButton}</View>;
  }
  return (
    <Modal
      statusBarTranslucent
      animationType="slide"
      onDismiss={dismissHandler}
      onRequestClose={requestCloseHandler}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {closeButton}
        <View style={{ flex: 1 }}>
          <MapView
            provider={PROVIDER_GOOGLE}
            initialRegion={state.region}
            style={{ width: '100%', height: '100%' }}
            onRegionChangeComplete={regionChangeCompleteHandler}
          />
          <View
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
            }}
          >
            <View
              style={{
                position: 'relative',
                left: (-1 * MARKER_WIDTH) / 2 - 2,
                top: (-1 * MARKER_HEIGHT) / 2 - 19,
              }}
            >
              <Image
                source={BluerMarkerImage}
                style={{
                  width: MARKER_WIDTH,
                  height: MARKER_HEIGHT,
                }}
              />
            </View>
          </View>
        </View>
        <View style={[globalStyles.withMargin, { paddingTop: 20 }]}>
          <Text
            level={2}
            weight="bold"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ marginBottom: 10 }}
          >
            Confirma la dirección
          </Text>
          <Text
            level={5}
            weight="light"
            style={{ lineHeight: 23, marginBottom: 20 }}
          >
            {utils.formatPlace(value)}
          </Text>
          <Button
            title="Confirmar ubicación"
            style={globalStyles.withMainActionAir}
            onPress={pressConfirmHandler}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};
