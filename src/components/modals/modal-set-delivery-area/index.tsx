import React, { ReactNode, useReducer } from 'react';
import { View, GestureResponderEvent, Vibration } from 'react-native';

// components
import Modal, { ModalProps } from '../modal';
import Button from '../../buttons/button';
import Text from '../../text';
import InputSelectOptions from '../../inputs/input-select-options';
import InputPlaceAutocomplete from '../../inputs/input-place-autocomplete';
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
const toCircle = (center: Place, radius: string): Circle => {
  return {
    type: 'circle',
    coordinates: [center.geometry.location.lng, center.geometry.location.lat],
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
type ChangeViewAction = {
  type: 'change_view';
  view: 'FORM' | 'AUTOCOMPLETE';
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
  | ChangeViewAction
  | SetSubmittedAction
  | SetFormErrorsAction;
type State = {
  view: 'FORM' | 'AUTOCOMPLETE';
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
    case 'change_view':
      return { ...state, view: action.view };
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
    view: 'FORM',
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
  const openAutomcompleteHandler = () => {
    dispatch({ type: 'change_view', view: 'AUTOCOMPLETE' });
  };
  const closeAutomcompleteHandler = () => {
    dispatch({ type: 'change_view', view: 'FORM' });
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
  let subtitle: ReactNode | null = null;
  let others: ReactNode | null = null;
  if (state.view === 'FORM') {
    subtitle = (
      <Text
        level={5}
        weight="light"
        style={{ lineHeight: 20, marginBottom: 30 }}
      >
        Crea un área de despacho que se acomode a tu negocio.
      </Text>
    );
    others = (
      <>
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
          title="Guardar"
          onPress={saveHandler}
          style={globalStyle.withMainActionAir}
        />
      </>
    );
  }
  return (
    <Modal {...otherProps} title="Área de despacho">
      <View style={[globalStyle.withMargin]}>
        {subtitle}
        <InputPlaceAutocomplete
          label="Centro de área"
          placeholder="Jose Manuel Rodríguez 927"
          value={state.form.center}
          onChange={(place) => {
            changeHandler('center', place);
          }}
          onOpen={openAutomcompleteHandler}
          onClose={closeAutomcompleteHandler}
          errors={state.form.errors?.center}
        />
        {others}
      </View>
    </Modal>
  );
};
