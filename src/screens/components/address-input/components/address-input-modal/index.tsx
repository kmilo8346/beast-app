import React, { ReactNode, useEffect, useReducer, useRef } from 'react';
import {
  Modal,
  GestureResponderEvent,
  View,
  ScrollView,
  TextInput as RNTextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios, { CancelTokenSource } from 'axios';

// local components
import TextInput from './components/text-input';
import AddressConfirmationModal from './components/address-confirmation-modal';
// components
import Icon from '../../../../../components/icon';
import Text from '../../../../../components/text';
import Divider from '../../../../../components/divider';
import Touchable from '../../../../../components/touchable';
import Button from '../../../../../components/buttons/button';
import PoweredByGoogle from '../../../../../components/svgs/images/powered-by-Google-logo';
import MapPinShadedBlueIcon from '../../../../../components/svgs/icons/map-pin-shaded-blue';
// clients
import placesClient from '../../../../../clients/google/places-client';
import geocodeClient from '../../../../../clients/google/geocode-client';
// libs
import { v4 as uuidv4 } from '../../../../../lib/uuid';
import { capture } from '../../../../../lib/sentry';
import * as utils from '../../../../../lib/utils';
// types
import { Place, PlacesAutocompletePrediction } from '../../../../../types';
// styles
import colors from '../../../../../styles/colors';
import globalStyles from '../../../../../styles';

// instances outside component
const prefix = '[address input modal component]';
let autocompletePredictionsSource: CancelTokenSource;
let detailSource: CancelTokenSource;
let geocodePredictionsSource: CancelTokenSource;
let sessiontoken = uuidv4();
let timeoutId: number;

type Prediction = PlacesAutocompletePrediction | Place;

type SetQueryAction = {
  type: 'set_query';
  query: string;
};
type SetLoadingAction = {
  type: 'set_loading';
  loading: boolean;
};
type SetPredictionsAction = {
  type: 'set_predictions';
  predictions: Prediction[];
};
type SetErrorAction = {
  type: 'set_error';
  retry?: () => void;
};
type SetSearchedAction = {
  type: 'set_searched';
  searched: boolean;
};
type SetAddressConfirmationModalAction = {
  type: 'set_address_confirmation_modal';
  address_confirmation_modal?: Place;
};
type Action =
  | SetQueryAction
  | SetLoadingAction
  | SetPredictionsAction
  | SetErrorAction
  | SetSearchedAction
  | SetAddressConfirmationModalAction;
type State = {
  query?: string;
  loading: boolean;
  predictions?: Prediction[];
  retry?: () => void;
  searched: boolean;
  address_confirmation_modal?: Place;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set_query':
      return { ...state, query: action.query, searched: false };
    case 'set_loading':
      return { ...state, loading: action.loading };
    case 'set_predictions':
      return { ...state, predictions: action.predictions };
    case 'set_error':
      return { ...state, retry: action.retry };
    case 'set_searched':
      return { ...state, searched: action.searched };
    case 'set_address_confirmation_modal':
      return {
        ...state,
        address_confirmation_modal: action.address_confirmation_modal,
      };
    default:
      return state;
  }
};

interface ComponentProps {
  onChange: (value: Place) => void;
  onClose: () => void;
}

export default ({ onChange, onClose }: ComponentProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    loading: false,
    searched: false,
  });

  // event handlers
  const fetchAutocompletePredictions = async (input: string) => {
    try {
      timeoutId && clearTimeout(timeoutId);
      dispatch({ type: 'set_loading', loading: true });
      if (autocompletePredictionsSource) {
        autocompletePredictionsSource.cancel();
      }
      autocompletePredictionsSource = axios.CancelToken.source();
      const response = await placesClient.autocomplete(
        {
          input,
          sessiontoken,
        },
        autocompletePredictionsSource.token
      );
      dispatch({ type: 'set_predictions', predictions: response.predictions });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Fetch autocomplete suggestions error', error);

        dispatch({
          type: 'set_error',
          retry: fetchAutocompletePredictions.bind(null, input),
        });
      }
    } finally {
      timeoutId = setTimeout(() => {
        dispatch({ type: 'set_loading', loading: false });
      }, 500);
    }
  };

  const showConfirmation = (place: Place) => {
    dispatch({
      type: 'set_address_confirmation_modal',
      address_confirmation_modal: place,
    });
  };

  const fetchDetail = async (id: string) => {
    try {
      dispatch({ type: 'set_loading', loading: true });
      detailSource && detailSource.cancel();
      detailSource = axios.CancelToken.source();

      const currentSessiontoken = sessiontoken;
      // renovate session token
      sessiontoken = uuidv4();

      const response = await placesClient.details(
        {
          place_id: id,
          sessiontoken: currentSessiontoken,
        },
        detailSource.token
      );

      setTimeout(() => {
        showConfirmation(response);
      }, 300);
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Fetch detail from id error', error);
        dispatch({
          type: 'set_error',
          retry: fetchDetail.bind(null, id),
        });
      }
    } finally {
      dispatch({ type: 'set_loading', loading: false });
    }
  };

  const fetchGeocodePredictions = async (address: string) => {
    try {
      dispatch({ type: 'set_loading', loading: true });
      dispatch({ type: 'set_searched', searched: true });
      geocodePredictionsSource && geocodePredictionsSource.cancel();
      geocodePredictionsSource = axios.CancelToken.source();

      const response = await geocodeClient.geocode(
        {
          address,
        },
        geocodePredictionsSource.token
      );

      dispatch({
        type: 'set_predictions',
        predictions: response,
      });
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Fetch detail from text error', error);
        dispatch({
          type: 'set_error',
          retry: fetchGeocodePredictions.bind(null, address),
        });
      }
    } finally {
      dispatch({ type: 'set_loading', loading: false });
    }
  };

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

  const showHandler = () => {
    ref.current?.focus();
  };

  const changeQueryHandler = (query: string) => {
    dispatch({ type: 'set_query', query });
  };

  const addressConfirmationModalCloseHandler = () => {
    dispatch({
      type: 'set_address_confirmation_modal',
      address_confirmation_modal: undefined,
    });
  };

  const submitHandler = (text?: string) => {
    if (text) {
      fetchGeocodePredictions(text);
    }
  };

  const pressSearchHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    if (state.query) {
      fetchGeocodePredictions(state.query);
    }
  };

  const confirmationChangeHandler = (place: Place) => {
    onChange(place);
  };

  const retryHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    const retry = state.retry;
    dispatch({ type: 'set_error', retry: undefined });
    retry && retry();
  };

  useEffect(() => {
    sessiontoken = uuidv4();

    return () => {
      autocompletePredictionsSource && autocompletePredictionsSource.cancel();
      detailSource && detailSource.cancel();
      geocodePredictionsSource && geocodePredictionsSource.cancel();
    };
  }, []);

  useEffect(() => {
    if (state.query) {
      fetchAutocompletePredictions(state.query);
    }
  }, [state.query]);

  // render logic
  let content: ReactNode;
  if (state.retry) {
    content = (
      <View style={{ paddingTop: 40, alignItems: 'center' }}>
        <Text level={6} weight="bold" style={{ marginBottom: 15 }}>
          Ocurrió un error inesperado
        </Text>
        <Text level={6} style={{ marginBottom: 10 }}>
          El error fue registrado para su solución
        </Text>
        <Button title="Reintentar" type="link" onPress={retryHandler} />
      </View>
    );
  } else if (!state.query || !state.predictions) {
    content = <View />;
  } else {
    content = (
      <View>
        <View style={globalStyles.withMargin}>
          {state.predictions.map((suggestion, index, array) => {
            const text =
              'description' in suggestion
                ? suggestion.description
                : utils.formatPlace(suggestion);
            return (
              <Touchable
                key={`${index}`}
                style={{
                  marginLeft: 5,
                  marginRight: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => {
                  if ('description' in suggestion) {
                    fetchDetail(suggestion.place_id);
                  } else {
                    fetchDetail(suggestion.id);
                  }
                }}
              >
                <MapPinShadedBlueIcon width={30} height={30} />
                <View
                  style={{
                    marginLeft: 10,
                    marginTop: 10,
                    marginBottom: 0,
                    flex: 1,
                  }}
                >
                  <Text
                    level={6}
                    style={{
                      lineHeight: 20,
                      marginBottom: 18,
                    }}
                  >
                    {text}
                  </Text>
                  {index < array.length - 1 && <Divider type="thin" />}
                </View>
              </Touchable>
            );
          })}
        </View>
        {!!state.predictions.length && <Divider type="thin" />}
        {!state.searched && (
          <>
            <Touchable
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 5,
                  marginRight: 10,
                  paddingVertical: 15,
                },
                globalStyles.withPadding,
              ]}
              onPress={pressSearchHandler}
            >
              <View style={{ marginLeft: 8 }}>
                <Icon name="search" size={18} color={colors.blue} />
              </View>
              <Text
                level={6}
                color={colors.blue}
                style={{ marginLeft: 14, letterSpacing: 0.5 }}
              >{`Buscar: ${state.query}`}</Text>
            </Touchable>
            <Divider type="thin" />
          </>
        )}

        <View
          style={[
            { alignItems: 'flex-end', marginTop: 20 },
            globalStyles.withMargin,
          ]}
        >
          <PoweredByGoogle />
        </View>
      </View>
    );
  }
  const ref = useRef<RNTextInput>(null);
  return (
    <Modal
      statusBarTranslucent
      animationType="slide"
      onDismiss={dismissHandler}
      onRequestClose={requestCloseHandler}
      onShow={showHandler}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
        <Touchable
          style={{
            alignSelf: 'flex-end',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 15,
            paddingVertical: 10,
          }}
          onPress={pressCloseHandler}
        >
          <Icon name="x" />
        </Touchable>
        <TextInput
          ref={ref}
          value={state.query}
          loading={state.loading}
          style={[globalStyles.withMargin, { marginTop: 15, marginBottom: 15 }]}
          onChange={changeQueryHandler}
          onSubmit={submitHandler}
        />
        <Divider type="thin" />
        <ScrollView keyboardShouldPersistTaps="handled" style={{ flex: 1 }}>
          {content}
          <View style={globalStyles.withScreenAir} />
        </ScrollView>
      </SafeAreaView>
      {!!state.address_confirmation_modal && (
        <AddressConfirmationModal
          value={state.address_confirmation_modal}
          onChange={confirmationChangeHandler}
          onClose={addressConfirmationModalCloseHandler}
        />
      )}
    </Modal>
  );
};
