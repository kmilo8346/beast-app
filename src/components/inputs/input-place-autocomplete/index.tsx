import React, { useReducer, useEffect } from 'react';
import { View, TextInput } from 'react-native';
import axios, { CancelTokenSource } from 'axios';

// components
import Input from '../input';
import ButtonIcon from '../../buttons/button-icon';
import Icon from '../../icon';
import Text from '../../text';
import Touchable from '../../touchable';
import Loading from '../../loading';
// clients
import placesClient from '../../../clients/google/places-client';
// types
import {
  Place,
  PlacesAutocompletResponse,
  PlacesDetailsResponse,
  PlacesAutocompletePrediction,
} from '../../../types';
// libs
import { v4 as uuidv4 } from '../../../lib/uuid';
import useDebounce from '../../../lib/hooks/use-debounce';
import colors from '../../../styles/colors';

// instances outside component
const toAddress = (place?: Place): string => {
  if (!place) return '';
  return `${place.route.shortName} ${place.streetNumber.shortName}, ${place.locality.shortName}, ${place.administrativeAreaLevel1.shortName}`;
};
let autocompleteRequestSource: CancelTokenSource;
let detailsRequestSource: CancelTokenSource;
let sessiontoken = uuidv4();

type OpenAction = {
  type: 'open';
};
type CloseAction = {
  type: 'close';
};
type ChangeValueAction = {
  type: 'change_value';
  attribute: string;
  value: string;
};
type SetAutoCompleteResponseAction = {
  type: 'set_autocomplete_response';
  response: PlacesAutocompletResponse;
};
type ShowAutocompleteErrorAction = {
  type: 'show_autocomplete_error';
};
type ShowLoadingDetailsAction = {
  type: 'show_loading_details';
};
type SetDetailsResponseAction = {
  type: 'set_details_response';
  response: PlacesDetailsResponse;
};
type Action =
  | OpenAction
  | CloseAction
  | ChangeValueAction
  | SetAutoCompleteResponseAction
  | ShowAutocompleteErrorAction
  | ShowLoadingDetailsAction
  | SetDetailsResponseAction;
type State = {
  open: boolean;
  address: string;
  place?: Place;
  view:
  | 'SEARCH_TIPS'
  | 'PREDICTIONS'
  | 'ERROR'
  | 'LOADING_DETAILS'
  | 'NO_PREDICTIONS';
  predictions: PlacesAutocompletePrediction[];
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'open':
      return { ...state, open: true, view: 'SEARCH_TIPS', predictions: [] };
    case 'close':
      return { ...state, open: false };
    case 'change_value':
      return {
        ...state,
        [action.attribute]: action.value,
        // change on address reset the place to undefined
        place: action.attribute === 'address' ? undefined : state.place,
      };
    case 'set_autocomplete_response':
      return {
        ...state,
        view: !action.response.predictions.length
          ? 'NO_PREDICTIONS'
          : 'PREDICTIONS',
        predictions: action.response.predictions,
      };
    case 'show_autocomplete_error':
      return { ...state, view: 'ERROR' };
    case 'show_loading_details':
      return { ...state, view: 'LOADING_DETAILS' };
    case 'set_details_response':
      // valid address
      if (action.response.streetNumber) {
        return {
          ...state,
          open: false,
          address: toAddress(action.response),
          place: action.response,
        };
      }
      // invalid address selected
      return { ...state, view: 'NO_PREDICTIONS', predictions: [] };
    default:
      return state;
  }
};

export interface InputPlaceAutocompleteProps {
  label?: string;
  placeholder?: string;
  value?: Place;
  errors?: string[];
  onChange?: (place?: Place) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export default ({
  label,
  placeholder,
  value,
  errors,
  onChange = () => null,
  onOpen = () => null,
  onClose = () => null,
}: InputPlaceAutocompleteProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    open: false,
    address: toAddress(value),
    place: value,
    view: 'SEARCH_TIPS',
    predictions: [],
  });
  const debouncedAddress = useDebounce(state.address, 200);

  // event handlers
  const changeHandler = (attribute: string, value: string) => {
    dispatch({ type: 'change_value', attribute, value });
  };
  const inputFocusHandler = () => {
    dispatch({ type: 'open' });
  };
  const pressCloseAutocompleteHandler = () => {
    dispatch({ type: 'close' });
  };
  const fetchPredictions = async (input: string) => {
    try {
      if (autocompleteRequestSource) {
        // cancel running request
        autocompleteRequestSource.cancel();
      }
      autocompleteRequestSource = axios.CancelToken.source();
      const response = await placesClient.autocomplete(
        {
          input,
          sessiontoken,
        },
        autocompleteRequestSource.token
      );
      dispatch({ type: 'set_autocomplete_response', response });
    } catch (error) {
      if (!axios.isCancel(error)) {
        dispatch({ type: 'show_autocomplete_error' });
      }
    }
  };
  const fetchDetail = async (placeId: string) => {
    try {
      if (detailsRequestSource) {
        // cancel running request
        detailsRequestSource.cancel();
      }
      detailsRequestSource = axios.CancelToken.source();

      const currentSessiontoken = sessiontoken;
      // renovate session token
      sessiontoken = uuidv4();

      dispatch({ type: 'show_loading_details' });
      const response = await placesClient.details(
        {
          placeId,
          sessiontoken: currentSessiontoken,
        },
        autocompleteRequestSource.token
      );
      dispatch({ type: 'set_details_response', response });
    } catch (error) {
      if (!axios.isCancel(error)) {
        dispatch({ type: 'show_autocomplete_error' });
      }
    }
  };
  // generate session token when component mount
  useEffect(() => {
    sessiontoken = uuidv4();
  }, []);
  // fetch predictions using debounced address
  useEffect(() => {
    if (debouncedAddress) {
      fetchPredictions(debouncedAddress);
    }
  }, [debouncedAddress]);
  // cancel request on detach component
  useEffect(() => {
    return () => {
      if (autocompleteRequestSource) {
        // cancel running request
        autocompleteRequestSource.cancel();
      }
      if (detailsRequestSource) {
        // cancel running request
        detailsRequestSource.cancel();
      }
    };
  }, []);
  // calling on change
  useEffect(() => {
    onChange(state.place);
  }, [state.place]);
  // calling on open and on close
  useEffect(() => {
    if (state.open) {
      onOpen();
    } else {
      onClose();
    }
  }, [state.open]);

  // render logic
  if (state.open) {
    let content = null;
    switch (state.view) {
      case 'PREDICTIONS':
        content = (
          <>
            {state.predictions.map((prediction, index) => {
              return (
                <Touchable
                  key={`${prediction.description}-${index}`}
                  style={{
                    marginLeft: 5,
                    marginRight: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    fetchDetail(prediction.placeId);
                  }}
                >
                  <Icon name="map-pin" size={18} />
                  <Text
                    level={6}
                    style={{
                      marginLeft: 10,
                      marginTop: 10,
                      marginBottom: 10,
                      lineHeight: 20,
                    }}
                  >
                    {prediction.description}
                  </Text>
                </Touchable>
              );
            })}
          </>
        );
        break;
      case 'NO_PREDICTIONS':
        content = (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="info" style={{ marginRight: 10 }} />
            <Text level={6} style={{}}>
              No encontramos esa dirección, por favor prueba de nuevo
            </Text>
          </View>
        );
        break;
      case 'ERROR':
        content = (
          <Text level={6} style={{}}>
            Ocurrió un error, intenta de nuevo
          </Text>
        );
        break;
      case 'LOADING_DETAILS':
        content = (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Loading />
          </View>
        );
        break;
      default:
        content = (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="info" style={{ marginRight: 10 }} />
            <Text level={6} style={{}}>
              Busca tu dirección con calle y número
            </Text>
          </View>
        );
        break;
    }
    return (
      <View style={{ position: 'relative' }}>
        <ButtonIcon
          icon="x"
          onPress={pressCloseAutocompleteHandler}
          style={{ position: 'absolute', top: -5, right: -5 }}
        />
        <Text level={6} style={{ marginLeft: 4, top: 30 }}>
          {label}
        </Text>
        <TextInput
          value={state.address}
          placeholder="Jose Pedro Alessandri 927"
          autoFocus
          clearButtonMode="while-editing"
          onChangeText={(text) => {
            changeHandler('address', text);
          }}
          style={{
            marginTop: 30,
            marginBottom: 20,
            borderStyle: 'solid',
            borderBottomWidth: 1,
            borderBottomColor: colors.blackLight6,
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 4,
            paddingRight: 50,
            fontSize: 14,
            color: colors.black,
          }}
        />
        <View style={{ height: 150 }}>{content}</View>
      </View>
    );
  }
  return (
    <Input
      label={label}
      placeholder={placeholder}
      value={state.address}
      errors={errors}
      onFocus={inputFocusHandler}
    />
  );
};
