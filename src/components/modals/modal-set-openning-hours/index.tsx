import React, { useReducer, useState } from 'react';
import { View, ScrollView } from 'react-native';

// components
import Modal, { ModalProps } from '../modal';
import Button from '../../buttons/button';
import Text from '../../text';
import InputTime from '../../inputs/input-time';
import Switch from '../../switch';
// types
import { OpenHours } from '../../../types';
// libs
import validate from '../../../lib/validate';
// styles
import styles from './styles';
import globalStyles from '../../../styles';

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
type SetError = {
  type: 'set_error';
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
  | SetError
  | SetSubmittedAction
  | SetFormErrorsAction;
type State = {
  form: {
    // fields
    openingHours: OpenHours[];
    // other states
    submitted: boolean;
    errors: { [key: string]: string[] };
  };
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_value':
      return {
        ...state,
        form: { ...state.form, [action.attribute]: action.value },
      };
    case 'validate_value':
      if (!state.form.submitted) return state;

      return {
        ...state,
        form: {
          ...state.form,
          errors: {}, // validator here
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

export interface ModalManageOpeningHoursProps extends ModalProps {
  openingHours?: OpenHours[];
  onSave: (openingHours?: OpenHours[]) => void;
}

export default ({
  openingHours,
  onSave = () => null,
  ...otherProps
}: ModalManageOpeningHoursProps) => {
  // state

  const [state, dispatch] = useReducer(reducer, {
    form: {
      // fields
      // TODO: mejorar esto
      openingHours: [
        {
          day: 'lunes',
          open: openingHours ? openingHours[0].open : '0900',
          close: openingHours ? openingHours[0].close : '1900',
          isOpen: true,
        },
        {
          day: 'martes',
          open: openingHours ? openingHours[1].open : '0900',
          close: openingHours ? openingHours[1].close : '1900',
          isOpen: true,
        },
        {
          day: 'miércoles',
          open: openingHours ? openingHours[2].open : '0900',
          close: openingHours ? openingHours[2].close : '1900',
          isOpen: true,
        },
        {
          day: 'jueves',
          open: openingHours ? openingHours[3].open : '0900',
          close: openingHours ? openingHours[3].close : '1900',
          isOpen: true,
        },
        {
          day: 'viernes',
          open: openingHours ? openingHours[4].open : '0900',
          close: openingHours ? openingHours[4].close : '1900',
          isOpen: true,
        },
        {
          day: 'sábado',
          open: openingHours ? openingHours[5].open : '0000',
          close: openingHours ? openingHours[5].close : '0000',
          isOpen: true,
        },
        {
          day: 'domingo',
          open: openingHours ? openingHours[6].open : '0000',
          close: openingHours ? openingHours[6].close : '0000',
          isOpen: true,
        },
      ],
      // other form states
      submitted: false,
      errors: {},
    },
  });

  // event handlers
  const changeHandler = (attribute: string, value: string) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
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
    // save data
    onSave(state.form.openingHours);
  };

  // render logic
  return (
    <Modal {...otherProps} title="Horario de atención">
      <View style={[globalStyles.withMargin, globalStyles.withScreenAir]}>
        <Text level={5} style={{ marginBottom: 20 }}>
          Activa los días de atención capitalista hijo de puta!!
        </Text>
        <ScrollView style={globalStyles.withPadding}>
          {state.form.openingHours.map(
            ({ day, open, close, isOpen }, index) => {
              const [showInputs, setShowInputs] = useState(isOpen);
              return (
                <View key={index}>
                  <View style={styles.switchContainer} key={index}>
                    <Text level={5} weight="bold">
                      {day}
                    </Text>
                    <Switch
                      checked={showInputs}
                      onChange={() =>
                        setShowInputs((prevShowInputs) => !prevShowInputs)
                      }
                    />
                  </View>
                  {showInputs && (
                    <View style={{ flexDirection: 'row' }}>
                      <InputTime
                        placeHolder="09:00"
                        minTime="00:00"
                        value={open}
                        onChange={(value) => changeHandler('open', value)}
                      />
                      <InputTime
                        placeHolder="09:00"
                        minTime="00:00"
                        value={open}
                        onChange={(value) => changeHandler('close', value)}
                      />
                    </View>
                  )}
                </View>
              );
            }
          )}
          <Button
            title="Guardar"
            onPress={saveHandler}
            style={globalStyles.withMainActionAir}
          />
        </ScrollView>
      </View>
    </Modal>
  );
};
