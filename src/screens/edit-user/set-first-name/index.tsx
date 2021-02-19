import React, { useEffect, useReducer, useRef } from 'react';
import {
  GestureResponderEvent,
  Keyboard,
  ScrollView,
  Vibration,
  View,
  TextInput,
} from 'react-native';

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
import { capture } from '../../../lib/sentry';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

// instances outside component
const prefix = '[edit user set first_name screen]';

type ChangeValueAction = {
  type: 'change_value';
  first_name: string | null;
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
    first_name?: string | null;

    // other state
    changed: boolean;
  };
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_value':
      return {
        ...state,
        form: {
          ...state.form,
          first_name: action.first_name,
        },
      };
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
      first_name: route.params.first_name,

      // other state
      changed: false,
    },
  });

  // event handlers
  const updateUser = async () => {
    try {
      await loadingOverlayRef.current?.show();
      const userUpdated = await userClient.update({
        pathVars: {
          id: route.params.id,
        },
        body: {
          first_name: state.form.first_name,
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
    updateUser();
  };

  const changeHandler = (first_name: string | null) => {
    dispatch({ type: 'change_value', first_name });
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
    const changed = state.form.first_name !== route.params.first_name;
    dispatch({ type: 'set_changed', changed });
  }, [state.form.first_name]);

  // render logic
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);
  const toastRef = useRef<IToast>(null);
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white }]}>
      <ScrollView
        style={[globalStyles.withPadding, { flex: 1, paddingTop: 15 }]}
      >
        <TextInput
          autoFocus
          maxLength={30}
          clearButtonMode="always"
          placeholder="Añade tu nombre"
          value={state.form.first_name || ''}
          style={{ fontSize: 14, fontFamily: 'MonserratNormal' }}
          onChangeText={(text: string) => {
            changeHandler(text || null);
          }}
          onSubmitEditing={submitEditingHandler}
        />
        <Divider style={{ marginVertical: 15 }} />
        <Text level={7} color={colors.blackLight4}>{`${
          state.form.first_name?.length || 0
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
