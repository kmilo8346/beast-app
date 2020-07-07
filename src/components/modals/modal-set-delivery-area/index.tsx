import React, { useReducer, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import axios, { CancelTokenSource } from 'axios';

// components
import Modal, { ModalProps } from '../modal';
import Button from '../../buttons/button';
import ButtonIcon from '../../buttons/button-icon';
import Input from '../../inputs/input';
import InputSelectOptions from '../../inputs/input-select-options';
import Icon from '../../icon';
import Text from '../../text';
import Touchable from '../../touchable';
// types
import {
  Place,
  Circle,
  PlacesAutocompletResponse,
  PlacesDetailsResponse,
  PlacesAutocompletePrediction,
} from '../../../types';
// clients
import googlePlacesClient from '../../../clients/google-places-client';
// libs
import validate from '../../../lib/validate';
import { v4 as uuidv4 } from '../../../lib/uuid';
// constraints
import constraints from './constraints';
// styles
import globalStyle from '../../../styles';
import useDebounce from '../../../lib/hooks/use-debounce';

// instances outside component
const availableRadius = [
  {
    key: '50m',
    title: '50m (Venta en el edificio)',
  },
  {
    key: '100m',
    title: '100m',
  },
  {
    key: '200m',
    title: '200m',
  },
  {
    key: '300m',
    title: '300m',
  },
  {
    key: '400m',
    title: '400m',
  },
  {
    key: '500m',
    title: '500m',
  },
  {
    key: '600m',
    title: '600m',
  },
  {
    key: '700m',
    title: '700m',
  },
  {
    key: '800m',
    title: '800m',
  },
  {
    key: '900m',
    title: '900m',
  },
  {
    key: '1000m',
    title: '1km',
  },
];
const toAddress = (place: Place): string => {
  return `${place.route.shortName} ${place.streetNumber.shortName}, ${place.locality.shortName}, ${place.administrativeAreaLevel1.shortName}`;
};
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
};
type ShowAutocompleteAction = {
  type: 'show_autocomplete';
};
type ShowFormAction = {
  type: 'show_form';
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
  | ShowAutocompleteAction
  | ShowFormAction
  | SetAutoCompleteResponseAction
  | ShowAutocompleteErrorAction
  | ShowLoadingDetailsAction
  | SetDetailsResponseAction
  | SetSubmittedAction
  | SetFormErrorsAction;
type State = {
  view: 'FORM' | 'AUTOCOMPLETE';
  form: {
    // fields
    address: string;
    radius: string;
    // hidden field
    center: Place | null;

    // other states
    submitted: boolean;
    errors: { [key: string]: string[] };
  };
  autocompleteView: 'SEARCH_TIPS' | 'PREDICTIONS' | 'ERROR' | 'LOADING_DETAILS';
  predictions: PlacesAutocompletePrediction[];
};

const reducer = (state: State, action: Action): State => {
  let form;
  switch (action.type) {
    case 'change_value':
      form = { ...state.form, [action.attribute]: action.value };
      if (action.attribute === 'address') {
        form.center = null;
      }
      return {
        ...state,
        form,
      };
    case 'validate_value':
      if (!state.form.submitted) return state;

      return {
        ...state,
        form: {
          ...state.form,
          errors: validate(state.form, constraints),
        },
      };
    case 'show_autocomplete':
      return {
        ...state,
        predictions: [], // stast with clean state
        view: 'AUTOCOMPLETE',
      };
    case 'show_form':
      return {
        ...state,
        view: 'FORM',
      };
    case 'set_autocomplete_response':
      return {
        ...state,
        autocompleteView: !action.response.predictions.length
          ? 'SEARCH_TIPS'
          : 'PREDICTIONS',
        predictions: action.response.predictions,
      };
    case 'show_autocomplete_error':
      return {
        ...state,
        autocompleteView: 'ERROR',
      };
    case 'show_loading_details':
      return {
        ...state,
        autocompleteView: 'LOADING_DETAILS',
      };
    case 'set_details_response':
      // valid address
      if (action.response.streetNumber) {
        return {
          ...state,
          view: 'FORM',
          form: {
            ...state.form,
            // set formatted address
            address: toAddress(action.response),
            // set hidden fields
            center: action.response,
          },
          predictions: [],
        };
      }
      // invalid address selected
      return {
        ...state,
        autocompleteView: 'SEARCH_TIPS',
        predictions: [],
      };
    case 'set_submitted':
      return { ...state, form: { ...state.form, submitted: true } };
    case 'set_form_errors':
      return { ...state, form: { ...state.form, errors: action.errors } };
    default:
      return state;
  }
};

export interface ModalManageDeliveryTimeProps extends ModalProps {
  deliveryArea?: Circle;
  onSave: (deliveryArea: Circle) => void;
}

export default ({
  deliveryArea,
  onSave = () => null,
  ...otherProps
}: ModalManageDeliveryTimeProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    view: 'FORM',
    form: {
      // fields
      address: deliveryArea ? toAddress(deliveryArea.center) : '',
      radius: deliveryArea ? deliveryArea.radius : '50m',
      // hidden fields
      center: deliveryArea ? deliveryArea.center : null,

      // other form states
      submitted: false,
      errors: {},
    },
    autocompleteView: 'SEARCH_TIPS',
    predictions: [],
  });
  const debouncedAddress = useDebounce(state.form.address, 200);

  // event handlers
  const changeHandler = (attribute: string, value: string) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value' });
  };
  const inputFocusHandler = () => {
    dispatch({ type: 'show_autocomplete' });
  };
  const pressCloseAutocompleteHandler = () => {
    dispatch({ type: 'show_form' });
  };
  const saveHandler = () => {
    // set submitted
    dispatch({ type: 'set_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      return;
    }
    onSave({ center: state.form.center as Place, radius: state.form.radius });
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
      const response = await googlePlacesClient.details(
        {
          placeId,
          sessiontoken: currentSessiontoken,
        },
        autocompleteRequestSource.token
      );
      dispatch({ type: 'set_details_response', response });
      dispatch({ type: 'validate_value' });
    } catch (error) {
      if (!axios.isCancel(error)) {
        dispatch({ type: 'show_autocomplete_error' });
      }
    }
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
        label="Centro de área"
        placeholder="Jose Pedro Alessandri 927"
        value={state.form.address}
        errors={state.form.errors?.address}
        onFocus={inputFocusHandler}
      />
      <InputSelectOptions
        label="Radio de entrega"
        value={state.form.radius}
        modalTitle="Selecciona radio de entrega"
        onChange={(key) => {
          changeHandler('radius', key);
        }}
        options={availableRadius}
      />

      <View style={{ flexDirection: 'row' }}>
        <Icon name="info" size={20} style={{ marginRight: 10 }} />
        <Text level={6} numberOfLines={2} style={{ flex: 1, marginBottom: 20 }}>
          Recuerda que las entregas son gratis. Crea un área de despacho acorde
          a tu servicio.
        </Text>
      </View>

      <Button
        title="Guardar"
        onPress={saveHandler}
        style={globalStyle.withMainActionAir}
      />
    </>
  );
  if (state.view === 'AUTOCOMPLETE') {
    let innerContent = null;
    switch (state.autocompleteView) {
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
        innerContent = (
          <View style={{ flexDirection: 'row' }}>
            <ActivityIndicator size="small" />
            <Text level={7} style={{ marginLeft: 5 }}>
              Cargando...
            </Text>
          </View>
        );
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
    content = (
      <View style={{ height: 200 }}>
        <ButtonIcon
          icon="x"
          onPress={pressCloseAutocompleteHandler}
          style={{ position: 'absolute', top: 0, right: 0 }}
        />
        <Input
          label="Centro de área"
          placeholder="Jose Pedro Alessandri 927"
          value={state.form.address}
          autoFocus
          onChangeText={(text) => {
            changeHandler('address', text);
          }}
          containerStyle={{ marginTop: 24 }}
        />
        {innerContent}
      </View>
    );
  }
  return (
    <Modal {...otherProps} title="Área de despacho">
      <View style={[globalStyle.withMargin]}>{content}</View>
    </Modal>
  );
};
