import React, { useReducer } from 'react';
import { View, GestureResponderEvent, Vibration } from 'react-native';

// screen components
import AddressInput from '../../../screens/components/address-input';
// components
import Modal, { ModalProps } from '../modal';
import Button from '../../buttons/button';
import Text from '../../text';
import InputSelectOptions from '../../inputs/input-select-options';
// types
import { Place, DeliveryArea, Circle } from '../../../types';
// libs
import validate from '../../../lib/validate';
// constraints
import constraints from './constraints';
// styles
import globalStyle from '../../../styles';

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
    key: '1000m',
    title: '1km',
  },
  {
    key: '2000m',
    title: '2km',
  },
  {
    key: '3000m',
    title: '3km',
  },
  {
    key: '4000m',
    title: '4km',
  },
  {
    key: '5000m',
    title: '5km',
  },
];
const toCircle = (center: Place, radius: string): Circle => {
  return {
    type: 'circle',
    coordinates: [center.location.lon, center.location.lat],
    radius,
  };
};

type ChangeValueAction = {
  type: 'change_value';
  attribute: string;
  value: any;
};
type ValidateValueAction = {
  type: 'validate_value';
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
  | SetSubmittedAction
  | SetFormErrorsAction;
type State = {
  form: {
    // fields
    center?: Place;
    radius?: string;

    // other states
    submitted: boolean;
    errors?: { [key: string]: string[] };
  };
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_value':
      return {
        ...state,
        form: {
          ...state.form,
          [action.attribute]: action.value,
        },
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
    case 'set_submitted':
      return { ...state, form: { ...state.form, submitted: true } };
    case 'set_form_errors':
      return { ...state, form: { ...state.form, errors: action.errors } };
    default:
      return state;
  }
};

export interface ModalManageDeliveryTimeProps extends ModalProps {
  deliveryArea?: DeliveryArea;
  onSave: (deliveryArea: DeliveryArea) => void;
}

export default ({
  deliveryArea,
  onSave = () => null,
  ...otherProps
}: ModalManageDeliveryTimeProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    form: {
      // fields
      center: deliveryArea?.center,
      radius: deliveryArea?.radius,

      // other form states
      submitted: false,
    },
  });

  // event handlers
  const changeHandler = (attribute: string, value: any) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value' });
  };

  const saveHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    // set submitted
    dispatch({ type: 'set_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      return;
    }

    const center = state.form.center as Place;
    const radius = state.form.radius as string;
    onSave({
      center,
      radius,
      // generate new geometry
      geometry: toCircle(center, radius),
    });
  };

  // render logic
  return (
    <Modal {...otherProps} title="Área de despacho">
      <View style={[globalStyle.withMargin]}>
        <Text
          level={5}
          weight="light"
          style={{ lineHeight: 20, marginBottom: 30 }}
        >
          Crea un área de despacho que se acomode a tu negocio.
        </Text>
        <AddressInput
          label="Dirección"
          value={state.form.center}
          errors={state.form.errors?.address}
          placeholder="Jose Manuel Rodríguez 927"
          onChange={(place) => {
            changeHandler('center', place);
          }}
        />
        <InputSelectOptions
          label="Radio de entrega"
          placeholder="Seleccione radio de entrega"
          value={state.form.radius}
          errors={state.form.errors?.radius}
          modalTitle="Selecciona radio de entrega"
          options={availableRadius}
          onChange={(key) => {
            changeHandler('radius', key);
          }}
        />
        <Button
          title="Continuar"
          onPress={saveHandler}
          style={globalStyle.withMainActionAir}
        />
      </View>
    </Modal>
  );
};
