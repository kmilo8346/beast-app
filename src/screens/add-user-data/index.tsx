import React, { useEffect, useReducer, useRef } from 'react';
import {
  View,
  Vibration,
  ScrollView,
  GestureResponderEvent,
  Keyboard,
} from 'react-native';
import axios, { CancelTokenSource } from 'axios';

// components
import Text from '../../components/text';
import Input from '../../components/inputs/input';
import Button from '../../components/buttons/button';
import Toast, { IToast } from '../../components/toast';
import LoadingOverlay, {
  ILoadingOverlay,
} from '../../components/loading-overlay';
// clients
import userClient from '../../clients/user-client';
// libs
import validate from '../../lib/validate';
import { capture } from '../../lib/sentry';
// cache
import userCache from '../../cache/user';
// constraints
import constraints from './constraints';
// styles
import globalStyles from '../../styles';
import colors from '../../styles/colors';

// instances outside component
const prefix = '[add user data screen]';
let updateRequestSource: CancelTokenSource;

type ChangeValueAction = {
  type: 'change_value';
  attribute: string;
  value: any;
};
type ValidateValueAction = {
  type: 'validate_value';
  attribute: string;
  value: any;
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
  | SetFormSubmittedAction
  | SetFormErrorsAction;
type State = {
  form: {
    // fields
    first_name?: string;
    last_name?: string;
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
    case 'set_form_submitted':
      return { ...state, form: { ...state.form, submitted: true } };
    case 'set_form_errors':
      return { ...state, form: { ...state.form, errors: action.errors } };
    default:
      return state;
  }
};

interface ScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    form: {
      submitted: false,
    },
  });
  const toastRef = useRef<IToast>(null);
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);

  // event handlers
  const updateUser = async () => {
    try {
      loadingOverlayRef.current?.show();

      if (updateRequestSource) {
        updateRequestSource.cancel();
      }
      updateRequestSource = axios.CancelToken.source();
      await userClient.update(
        {
          pathVars: { id: userCache.getData()?.id as string },
          body: {
            first_name: state.form.first_name,
            last_name: state.form.last_name,
          },
        },
        { cancelToken: updateRequestSource.token }
      );
      userCache.updateData({
        first_name: state.form.first_name,
        last_name: state.form.last_name,
      });
      setTimeout(() => {
        navigation.navigate(
          route.params.redirect.name,
          route.params.redirect.params
        );
      }, 300);
    } catch (error) {
      if (!axios.isCancel(error)) {
        capture(prefix, 'Update user error', error);

        Vibration.vibrate(400);
        toastRef.current?.show({
          message: 'No se pudo actualizar, reintenta por favor',
          type: 'ERROR',
          expiration: 3,
        });
      }
    } finally {
      loadingOverlayRef.current?.hide();
    }
  };

  const changeHandler = (attribute: string, value: any) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
  };

  const pressContinueHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    Keyboard.dismiss();
    dispatch({ type: 'set_form_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      toastRef.current?.show({
        message: 'Revise formulario, por favor',
        type: 'ERROR',
        expiration: 3,
      });
      return;
    }

    updateUser();
  };

  useEffect(() => {
    return () => {
      updateRequestSource && updateRequestSource.cancel();
    };
  }, []);

  // render logic
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView style={[{ flex: 1 }, globalStyles.withPadding]}>
        <Text
          level={2}
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ marginBottom: 10 }}
        >
          Agrega tus datos
        </Text>
        <Text
          level={5}
          weight="light"
          style={{ marginBottom: 40, lineHeight: 23 }}
        >
          Para ofrecerte una mejor experiencia en la comunicación.
        </Text>
        <Input
          required
          label="Nombre"
          lengthCounter
          maxLength={30}
          placeholder="Tu nombre"
          value={state.form.first_name}
          errors={state.form.errors?.first_name}
          onChangeText={(text) => {
            changeHandler('first_name', text);
          }}
        />
        <Input
          label="Apellido"
          lengthCounter
          maxLength={30}
          placeholder="Tu apellido"
          value={state.form.last_name}
          onChangeText={(text) => {
            changeHandler('last_name', text);
          }}
        />
        <View style={globalStyles.withScreenAir} />
      </ScrollView>
      <View style={[globalStyles.withMargin]}>
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        <Button
          title="Continuar"
          style={globalStyles.withMainActionAir}
          onPress={pressContinueHandler}
        />
      </View>
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
