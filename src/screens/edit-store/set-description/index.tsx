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
import storeClient from '../../../clients/store-client';
// cache
import storeCache from '../../../cache/store';
// libs
import { capture } from '../../../lib/sentry';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

// instances outside component
const prefix = '[edit store set description screen]';

type ChangeValueAction = {
  type: 'change_value';
  description: string;
};
type SetChangedAction = {
  type: 'set_changed';
  changed: boolean;
};
type Action = ChangeValueAction | SetChangedAction;
type State = {
  form: {
    // fields
    description?: string;

    // other states
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
          description: action.description,
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
      description: route.params.description,

      // other state
      changed: false,
      submitted: false,
    },
  });
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);
  const toastRef = useRef<IToast>(null);

  // event handlers
  const updateStore = async () => {
    try {
      await loadingOverlayRef.current?.show();
      const storeUpdated = await storeClient.update({
        pathVars: {
          id: route.params.id,
        },
        body: {
          description: state.form.description,
        },
      });
      storeCache.updateData(storeUpdated);
      loadingOverlayRef.current?.status(LoadingStatus.OK);
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      capture(prefix, 'Update store error', error);

      Vibration.vibrate(400);
      toastRef.current?.show({
        message: 'No se puedo actualizar, reintenta por favor',
        type: 'ERROR',
        expiration: 3,
      });
    } finally {
      await loadingOverlayRef.current?.hide();
    }
  };

  const submit = () => {
    updateStore();
  };

  const changeHandler = (description: string) => {
    dispatch({ type: 'change_value', description });
  };

  const pressSaveHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    Keyboard.dismiss();
    submit();
  };

  useEffect(() => {
    const changed = state.form.description !== route.params.description;
    dispatch({ type: 'set_changed', changed });
  }, [state.form.description]);

  // render logic
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white }]}>
      <ScrollView
        style={[globalStyles.withPadding, { flex: 1, paddingTop: 15 }]}
      >
        <TextInput
          autoFocus
          multiline
          maxLength={500}
          placeholder="Añade descripción"
          value={state.form.description}
          style={{ fontSize: 14, fontFamily: 'MonserratNormal' }}
          onChangeText={(text: string) => {
            changeHandler(text);
          }}
        />
        <Divider style={{ marginVertical: 15 }} />
        <Text level={7} color={colors.blackLight4}>{`${
          (state.form.description || '').length
        }/500`}</Text>
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
