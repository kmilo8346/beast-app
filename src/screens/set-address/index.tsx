import React, { useReducer, useEffect, useRef } from 'react';
import { View, TextInput } from 'react-native';
import validate from 'validate.js';
import axios, { CancelTokenSource } from 'axios';

// components
import {
  Container,
  Input,
  Button,
  Loading,
  Touchable,
  Icon,
  Text,
} from '../../components';
// clients
import googlePlacesClient from '../../clients/google-places-client';
// containers
import UserProvider from '../../containers/user';
// types
import {
  PlacesAutocompletePrediction,
  PlacesAutocompletResponse,
  PlacesDetailsResponse,
  Place,
} from '../../types';
// libs
import useDebounce from '../../lib/hooks/use-debounce';
import { v4 as uuidv4 } from '../../lib/uuid';
// constraints
import constraints from './constraints';
// styles
import colors from '../../styles/colors';

// instances outside component
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
type SetAutoCompleteResponseAction = {
  type: 'set_autocomplete_response';
  response: PlacesAutocompletResponse;
};
type ShowErrorAction = {
  type: 'show_error';
};
type ShowLoadingDetailsAction = {
  type: 'show_loading_details';
};
type SetDetailsResponseAction = {
  type: 'set_details_response';
  response: PlacesDetailsResponse;
};
type SetFormSubmittedAction = {
  type: 'set_form_submitted';
};
type SetFormErrorsAction = {
  type: 'set_form_errors';
  errors: { [key: string]: string[] };
};

type Action =
  | ChangeValueAction
  | ValidateValueAction
  | SetAutoCompleteResponseAction
  | ShowErrorAction
  | ShowLoadingDetailsAction
  | SetDetailsResponseAction
  | SetFormSubmittedAction
  | SetFormErrorsAction;

type State = {
  innerView: 'SEARCH_TIPS' | 'PREDICTIONS' | 'ERROR' | 'LOADING_DETAILS';
  predictions: PlacesAutocompletePrediction[];
  form: {
    // fields
    address: string;
    apartment: string;
    // hidden field
    place: Place | null;
    // other states
    submitted: boolean;
    errors?: { [key: string]: string[] };
  };
};

const reducer = (state: State, action: Action): State => {
  let form;
  switch (action.type) {
    case 'change_value':
      form = { ...state.form, [action.attribute]: action.value };
      if (action.attribute === 'address') {
        form.place = null;
      }
      return {
        ...state,
        form,
      };
    case 'validate_value':
      if (!state.form.submitted) return state;

      form = { ...state.form, errors: validate(state.form, constraints) };
      return {
        ...state,
        form,
      };
    case 'set_autocomplete_response':
      return {
        ...state,
        innerView: !action.response.predictions.length
          ? 'SEARCH_TIPS'
          : 'PREDICTIONS',
        predictions: action.response.predictions,
      };
    case 'show_error':
      return {
        ...state,
        innerView: 'ERROR',
      };
    case 'show_loading_details':
      return {
        ...state,
        innerView: 'LOADING_DETAILS',
      };
    case 'set_details_response':
      // valid address
      if (action.response.streetNumber) {
        return {
          ...state,
          predictions: [],
          form: {
            ...state.form,
            // set formatted address
            address: `${action.response.route.shortName} ${action.response.streetNumber.shortName}, ${action.response.locality.shortName}, ${action.response.administrativeAreaLevel1.shortName}`,
            // set hidden field
            place: action.response,
          },
        };
      }
      // invalid address selected
      return {
        ...state,
        innerView: 'SEARCH_TIPS',
        predictions: [],
      };
    case 'set_form_submitted':
      return { ...state, form: { ...state.form, submitted: true } };
    case 'set_form_errors':
      return { ...state, form: { ...state.form, errors: action.errors } };
    default:
      return state;
  }
};

export interface ScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    innerView: 'SEARCH_TIPS',
    predictions: [],
    form: {
      // fields
      address: '',
      apartment: '',
      // hidden field
      place: null,
      // other states
      submitted: false,
      errors: {},
    },
  });
  const userContainer = UserProvider.useContainer();
  const debouncedAddress = useDebounce(state.form.address, 200);
  const apartmentInput = useRef<TextInput>(null);
  const { redirect } = route.params;

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
      const response = await googlePlacesClient.autocomplete(
        {
          input,
          sessiontoken,
        },
        autocompleteRequestSource.token
      );
      dispatch({ type: 'set_autocomplete_response', response });
    } catch (error) {
      if (!axios.isCancel(error)) {
        dispatch({ type: 'show_error' });
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
      const response = await googlePlacesClient.details(
        {
          placeId,
          sessiontoken: currentSessiontoken,
        },
        autocompleteRequestSource.token
      );
      dispatch({ type: 'set_details_response', response });
    } catch (error) {
      if (!axios.isCancel(error)) {
        dispatch({ type: 'show_error' });
      }
    }
  };
  const pressContinueHandler = async () => {
    dispatch({ type: 'set_form_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      return;
    }
    await userContainer.addAddress({
      ...state.form.place,
      apartment: state.form.apartment,
    } as Place);
    navigation.navigate(redirect.name, redirect.params);
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
  let content = null;
  let innerContent = null;
  switch (state.innerView) {
    case 'PREDICTIONS':
      innerContent = (
        <>
          {state.predictions.map((prediction, index) => {
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
        <Text level={6} style={{}}>
          Ocurrió un error, intenta de nuevo
        </Text>
      );
      break;
    case 'LOADING_DETAILS':
      innerContent = <Loading />;
      break;
    default:
      innerContent = (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="info" style={{ marginRight: 10 }} />
          <Text level={6} style={{}}>
            Busca tu dirección con calle y número
          </Text>
        </View>
      );
      break;
  }
  content = <View style={{}}>{innerContent}</View>;

  if (state.form.place) {
    content = (
      <Input
        ref={apartmentInput}
        placeholder="1009"
        label="Departamento/Casa"
        returnKeyType="done"
        onSubmitEditing={pressContinueHandler}
        value={state.form.apartment}
        onChangeText={(text) => {
          changeHandler('apartment', text);
        }}
      />
    );
  }
  return (
    <Container safeArea withMargin>
      <View style={{ flex: 1 }}>
        <Text level={5} style={{ marginBottom: 20, lineHeight: 25 }}>
          Usaremos tu dirección para mostrarte todo lo que hay cerca tuyo. Te
          sorprendería saber lo que se vende en tu edificio
        </Text>
        <Input
          placeholder="Jose Pedro Alessandri 927"
          label="Dirección"
          autoFocus
          returnKeyType="next"
          value={state.form.address}
          errors={state.form.errors?.address}
          onChangeText={(text) => {
            changeHandler('address', text);
          }}
          onSubmitEditing={() => {
            // eslint-disable-next-line no-unused-expressions
            apartmentInput?.current?.focus();
          }}
        />
        {content}
      </View>
      <Button title="Continuar" onPress={pressContinueHandler} />
    </Container>
  );
};
