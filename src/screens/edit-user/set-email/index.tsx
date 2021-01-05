import React, { useEffect, useReducer, useRef } from 'react';
import {
  GestureResponderEvent,
  Keyboard,
  ScrollView,
  Vibration,
  View,
  TextInput,
} from 'react-native';

// constraints
import constraints from './constraints';
// components
import Text from '../../../components/text';
import LoadingOverlay, {
  ILoadingOverlay,
  LoadingStatus,
} from '../../../components/loading-overlay';
import Divider from '../../../components/divider';
import Button from '../../../components/buttons/button';
import Toast, { IToast } from '../../../components/toast';
// clients
import userClient from '../../../clients/user-client';
// cache
import userCache from '../../../cache/user';
// libs
import validate from '../../../lib/validate';
import { capture } from '../../../lib/sentry';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

// instances outside component
const prefix = '[edit user set email screen]';

type ChangeValueAction = {
  type: 'change_value';
  email: string;
};
type ValidateValueAction = {
  type: 'validate_value';
};
type SetFormSubmittedAction = {
  type: 'set_form_submitted';
};
type SetFormErrorsAction = {
  type: 'set_form_errors';
  errors: { [key: string]: string[] };
};
type SetChangedAction = {
  type: 'set_changed';
  changed: boolean;
};
type Action =
  | ChangeValueAction
  | ValidateValueAction
  | SetFormSubmittedAction
  | SetFormErrorsAction
  | SetChangedAction;
type State = {
  form: {
    // fields
    email: string;

    // other state
    changed: boolean;
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
          email: action.email,
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
    case 'set_changed':
      return { ...state, form: { ...state.form, changed: action.changed } };
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
      // fields
      email: route.params.email,

      // other state
      changed: false,
      submitted: false,
    },
  });
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);
  const toastRef = useRef<IToast>(null);

  // event handlers
  const updateUser = async () => {
    try {
      await loadingOverlayRef.current?.show();
      const userUpdated = await userClient.update({
        pathVars: {
          id: route.params.id,
        },
        body: {
          email: state.form.email,
        },
      });
      userCache.updateData(userUpdated);
      loadingOverlayRef.current?.status(LoadingStatus.OK);
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      capture(prefix, 'Update user error', error);

      Vibration.vibrate(400);
      toastRef.current?.show({
        message: 'No se pudo actualizar, reintenta por favor',
        type: 'ERROR',
        expiration: 3,
      });
    } finally {
      await loadingOverlayRef.current?.hide();
    }
  };

  const submit = () => {
    dispatch({ type: 'set_form_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors && state.form.email) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      return;
    }

    updateUser();
  };

  const changeHandler = (email: string) => {
    dispatch({ type: 'change_value', email });
    dispatch({ type: 'validate_value' });
  };

  const pressSaveHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    Keyboard.dismiss();
    submit();
  };

  const submitEditingHandler = () => {
    submit();
  };

  useEffect(() => {
    const changed = state.form.email !== route.params.email;
    dispatch({ type: 'set_changed', changed });
  }, [state.form.email]);

  // render logic
  const error =
    Array.isArray(state.form.errors?.email) &&
      state.form.errors?.email.length &&
      state.form.email
      ? state.form.errors.email[0]
      : null;
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white }]}>
      <ScrollView
        style={[globalStyles.withPadding, { flex: 1, paddingTop: 15 }]}
      >
        <TextInput
          autoFocus
          maxLength={30}
          clearButtonMode="always"
          placeholder="Añade tu email"
          value={state.form.email}
          style={{ fontSize: 14, fontFamily: 'MonserratNormal' }}
          onChangeText={(text: string) => {
            changeHandler(text);
          }}
          onSubmitEditing={submitEditingHandler}
        />
        <Divider style={{ marginVertical: 15 }} />
        {!!error && (
          <Text level={8} color={colors.red} style={{ marginBottom: 5 }}>
            {error}
          </Text>
        )}
        <Text level={7} color={colors.blackLight4}>{`${state.form.email?.length || 0
          }/30`}</Text>
        <View style={globalStyles.withScreenAir} />
      </ScrollView>
      <View style={[globalStyles.withMargin]}>
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        <Button
          title="Guardar"
          disabled={!state.form.changed}
          style={globalStyles.withMainActionAir}
          onPress={pressSaveHandler}
        />
      </View>
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
