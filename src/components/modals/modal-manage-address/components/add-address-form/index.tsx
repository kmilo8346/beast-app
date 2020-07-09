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
import placesClient from '../../../../../clients/google/places-client';
// types
import {
  PlacesAutocompletePrediction,
  PlacesAutocompletResponse,
  PlacesDetailsResponse,
  Place,
} from '../../../../../types';
// libs
import useDebounce from '../../../../../lib/hooks/use-debounce';
import { v4 as uuidv4 } from '../../../../../lib/uuid';
// constraints
import constraints from './constraints';
// styles
import globalStyle from '../../../../../styles';
import styles from './styles';

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
type SetSubmittedAction = {
  type: 'set_submitted';
};
type SetFormErrorsAction = {
  type: 'set_form_errors';
  errors: { [key: string]: string[] };
};
type Action =
  | ChangeValueAction
  | ValidateValueAction
  | SetLoadingAction
  | SetAutoCompleteResponseAction
  | SetError
  | SetDetailsResponseAction
  | SetSubmittedAction
  | SetFormErrorsAction;

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
  submitted: boolean;
  errors: { [key: string]: string[] };
};

const reducer = (state: State, action: Action): State => {
  let autocomplete;
  let form;
  switch (action.type) {
    case 'change_value':
      autocomplete = { ...state.autocomplete };
      form = { ...state.form, [action.attribute]: action.value };
      if (action.attribute === 'address') {
        form.place = null;
      }
      return {
        ...state,
        autocomplete,
        form,
      };
    case 'validate_value':
      if (!state.submitted) return state;

      return {
        ...state,
        errors: validate(state.form, constraints),
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
    case 'set_submitted':
      return { ...state, submitted: true };
    case 'set_form_errors':
      return { ...state, errors: action.errors };
    default:
      return state;
  }
};

export interface AddAddressFormProps {
  onAdd: (address: Place) => void;
}

export default ({ onAdd }: AddAddressFormProps) => {
  // state
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
    submitted: false,
    errors: {},
  });
  const debouncedAddress = useDebounce(state.form.address, 200);

  // event hanlders
  const changeHandler = (attribute: string, value: string) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
  };
  const fetchPredictions = async (input: string) => {
    try {
      if (autocompleteRequestSource) {
        // cancel running request
        autocompleteRequestSource.cancel();
      }
      autocompleteRequestSource = axios.CancelToken.source();
      // dispatch({ type: 'set_loading' });
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
        dispatch({ type: 'set_error' });
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

      dispatch({ type: 'set_loading' });
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
        dispatch({ type: 'set_error' });
      }
    }
  };
  const pressAddHandler = () => {
    dispatch({ type: 'set_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      return;
    }
    onAdd({
      ...state.form.place,
      apartment: state.form.apartment,
    } as Place);
  };
  useEffect(() => {
    sessiontoken = uuidv4();
  }, []);
  useEffect(() => {
    if (debouncedAddress) {
      fetchPredictions(debouncedAddress);
    }
  }, [debouncedAddress]);
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
  // render logic
  let content = (
    <>
      <Input
        placeholder="1009"
        label="Departamento"
        value={state.form.apartment}
        onChangeText={(text) => {
          changeHandler('apartment', text);
        }}
      />
      <Button
        title="Agregar"
        onPress={pressAddHandler}
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
                  style={styles.predictionContainer}
                  onPress={() => {
                    fetchDetail(prediction.placeId);
                  }}
                >
                  <Icon name="map-pin" size={18} />
                  <Text level={6} style={styles.predictionText}>
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
          <Text level={6} style={styles.messagesText}>
            Ocurrió un error, intenta de nuevo
          </Text>
        );
        break;
      default:
        innerContent = (
          <Text level={6} style={styles.messagesText}>
            Busca tu dirección con calle y número
          </Text>
        );
        break;
    }
    content = <View style={styles.messagesContainer}>{innerContent}</View>;
  }
  return (
    <View>
      <Input
        placeholder="Jose Pedro Alessandri 927"
        label="Dirección"
        value={state.form.address}
        errors={state.errors?.address}
        onChangeText={(text) => {
          changeHandler('address', text);
        }}
      />
      {content}
    </View>
  );
};
