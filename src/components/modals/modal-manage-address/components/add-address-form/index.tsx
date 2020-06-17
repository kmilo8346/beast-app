import React, { useReducer, useEffect } from 'react';
import { View } from 'react-native';
import validate from 'validate.js';
import axios, { CancelTokenSource } from 'axios';

// components
import Button from '../../../../buttons/button';
import Input from '../../../../inputs/input';
import Text from '../../../../text';
import Loading from '../../../../loading';
import Touchable from '../../../../touchable';
import Icon from '../../../../icon';
// clients
import googlePlacesClient from '../../../../../clients/google-places-client';
import useDebounce from '../../../../../lib/hooks/use-debounce';
// types
import {
  PlacesAutocompletePrediction,
  PlacesAutocompletResponse,
  PlacesDetailsResponse,
  Place,
} from '../../../../../types';
// libs
import { v4 as uuidv4 } from '../../../../../lib/uuid';
// styles
import globalStyle from '../../../../../styles';
import colors from '../../../../../styles/colors';

let autocompleteRequestSource: CancelTokenSource;
let detailsRequestSource: CancelTokenSource;
let sessiontoken = uuidv4();

type ChangeValueAction = {
  type: 'change_value';
  attribute: string;
  value: string;
};
type ValidateValueAction = {
  type: 'validate_value';
  attribute: string;
  value: string;
};
type SetLoadingAction = {
  type: 'set_loading';
};
type SetAutoCompleteResponseAction = {
  type: 'set_autocomplete_response';
  response: PlacesAutocompletResponse;
};
type SetError = {
  type: 'set_error';
};
type SetDetailsResponseAction = {
  type: 'set_details_response';
  response: PlacesDetailsResponse;
};
type Action =
  | ChangeValueAction
  | ValidateValueAction
  | SetLoadingAction
  | SetAutoCompleteResponseAction
  | SetError
  | SetDetailsResponseAction;

type State = {
  autocomplete: {
    view: 'LOADING' | 'NO_PREDICTIONS' | 'PREDICTIONS' | 'ERROR';
    predictions: PlacesAutocompletePrediction[];
  };
  form: {
    address: string;
    apartment: string;
    place: Place | null;
  };
  errors: { [key: string]: string[] };
};

const reducer = (state: State, action: Action): State => {
  let autocomplete;
  let form;
  let error;
  switch (action.type) {
    case 'change_value':
      autocomplete = { ...state.autocomplete };
      form = { ...state.form, [action.attribute]: action.value };
      if (action.attribute === 'address') {
        // 4autocomplete.predictions = [];
        form.place = null;
      }
      return {
        ...state,
        autocomplete,
        form,
      };
    case 'validate_value':
      error = [];
      switch (action.attribute) {
        case 'street':
          error = validate.single(action.value, {
            presence: {
              allowEmpty: false,
              message: 'Dirección es requerida',
            },
          });
          break;
        default:
          break;
      }
      return {
        ...state,
        errors: { ...state.errors, [action.attribute]: error },
      };
    case 'set_loading':
      return {
        ...state,
        autocomplete: { ...state.autocomplete, view: 'LOADING' },
      };
    case 'set_autocomplete_response':
      return {
        ...state,
        autocomplete: {
          predictions: action.response.predictions,
          view: action.response.predictions.length
            ? 'PREDICTIONS'
            : 'NO_PREDICTIONS',
        },
      };
    case 'set_error':
      return {
        ...state,
        autocomplete: { ...state.autocomplete, view: 'ERROR' },
      };
    case 'set_details_response':
      autocomplete = { ...state.autocomplete };
      form = { ...state.form };
      // valid address
      if (action.response.streetNumber) {
        form.address = `${action.response.route.shortName} ${action.response.streetNumber.shortName}, ${action.response.locality.shortName}, ${action.response.administrativeAreaLevel1.shortName}`;
        form.place = action.response;
      } else {
        autocomplete.view = 'NO_PREDICTIONS';
        autocomplete.predictions = [];
      }
      return {
        ...state,
        autocomplete,
        form,
      };
    default:
      return state;
  }
};

export interface AddAddressFormProps {
  onAdd: (address: Place) => void;
}

export default ({ onAdd }: AddAddressFormProps) => {
  const [state, dispatch] = useReducer(reducer, {
    autocomplete: {
      view: 'NO_PREDICTIONS',
      predictions: [],
    },
    form: {
      address: '',
      apartment: '',
      place: null,
    },
    errors: {},
  });

  const fetchPredictions = async (input: string) => {
    try {
      if (autocompleteRequestSource) {
        // cancel running request
        autocompleteRequestSource.cancel();
      }
      autocompleteRequestSource = axios.CancelToken.source();
      // dispatch({ type: 'set_loading' });
      const response = await googlePlacesClient.autocomplete(
        {
          input,
          sessiontoken,
        },
        autocompleteRequestSource.token
      );
      if (response) {
        dispatch({ type: 'set_autocomplete_response', response });
      }
    } catch (error) {
      dispatch({ type: 'set_error' });
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

      dispatch({ type: 'set_loading' });
      const response = await googlePlacesClient.details(
        {
          placeId,
          sessiontoken: currentSessiontoken,
        },
        autocompleteRequestSource.token
      );
      if (response) {
        dispatch({ type: 'set_details_response', response });
      }
    } catch (error) {
      dispatch({ type: 'set_error' });
    }
  };

  const debouncedAddress = useDebounce(state.form.address, 200);

  useEffect(() => {
    sessiontoken = uuidv4();
  }, []);

  useEffect(() => {
    if (debouncedAddress) {
      fetchPredictions(debouncedAddress);
    }
    // todo add clean function
  }, [debouncedAddress]);

  // render logic
  let content = (
    <>
      <Input
        placeholder="1009"
        label="Departamento"
        value={state.form.apartment}
        onChangeText={(text) => {
          dispatch({
            type: 'change_value',
            attribute: 'apartment',
            value: text,
          });
        }}
      />
      <Button
        disabled={!state.form.place}
        title="Agregar"
        onPress={() => {
          onAdd({
            ...state.form.place,
            apartment: state.form.apartment,
          } as Place);
        }}
        style={globalStyle.withMainActionAir}
      />
    </>
  );
  if (state.form.address && !state.form.place) {
    let innerContent = null;

    switch (state.autocomplete.view) {
      case 'LOADING':
        innerContent = <Loading />;
        break;
      case 'PREDICTIONS':
        innerContent = (
          <>
            {state.autocomplete.predictions.map((prediction, index) => {
              return (
                <Touchable
                  key={`${prediction.description}-${index}`}
                  style={{
                    marginLeft: 5,
                    marginRight: 10,
                    borderBottomColor: colors.blackLight6,
                    borderBottomWidth: 0,
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
      case 'ERROR':
        innerContent = (
          <Text level={6} style={{ textAlign: 'center' }}>
            Ocurrió un error, intenta de nuevo
          </Text>
        );
        break;

      default:
        innerContent = (
          <Text level={6} style={{ textAlign: 'center' }}>
            Busca tu dirección con calle y número
          </Text>
        );
        break;
    }
    content = (
      <View style={{ minHeight: 150, maxHeight: 200 }}>{innerContent}</View>
    );
  }
  return (
    <View>
      <Input
        placeholder="Jose Pedro Alessandri 927"
        label="Dirección"
        value={state.form.address}
        errors={state.errors.address}
        onChangeText={(text) => {
          dispatch({ type: 'change_value', attribute: 'address', value: text });
        }}
      />
      {content}
    </View>
  );
};
