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
import { capture } from '../../../lib/sentry';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

// instances outside component
const prefix = '[edit user set last_name screen]';

type ChangeValueAction = {
  type: 'change_value';
  last_name: string | null;
};
type ValidateValueAction = {
  type: 'validate_value';
};
type SetFormSubmittedAction = {
  type: 'set_form_submitted';
};
type SetChangedAction = {
  type: 'set_changed';
  changed: boolean;
};
type Action =
  | ChangeValueAction
  | ValidateValueAction
  | SetFormSubmittedAction
  | SetChangedAction;
type State = {
  form: {
    // fields
    last_name?: string | null;

    // other state
    changed: boolean;
    submitted: boolean;
  };
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_value':
      return {
        ...state,
        form: {
          ...state.form,
          last_name: action.last_name,
        },
      };
    case 'set_form_submitted':
      return { ...state, form: { ...state.form, submitted: true } };
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
      last_name: route.params.last_name,

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
          last_name: state.form.last_name,
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

    updateUser();
  };

  const changeHandler = (last_name: string | null) => {
    dispatch({ type: 'change_value', last_name });
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
    const changed = state.form.last_name !== route.params.last_name;
    dispatch({ type: 'set_changed', changed });
  }, [state.form.last_name]);

  // render logic
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white }]}>
      <ScrollView
        style={[globalStyles.withPadding, { flex: 1, paddingTop: 15 }]}
      >
        <TextInput
          autoFocus
          maxLength={30}
          clearButtonMode="always"
          placeholder="Tu apellido"
          value={state.form.last_name || ''}
          style={{ fontSize: 14, fontFamily: 'MonserratNormal' }}
          onChangeText={(text: string) => {
            changeHandler(text || null);
          }}
          onSubmitEditing={submitEditingHandler}
        />
        <Divider style={{ marginVertical: 15 }} />
        <Text level={7} color={colors.blackLight4}>{`${
          state.form.last_name?.length || 0
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
