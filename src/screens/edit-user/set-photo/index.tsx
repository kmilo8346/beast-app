import React, { useEffect, useReducer, useRef } from 'react';
import {
  GestureResponderEvent,
  Keyboard,
  ScrollView,
  Vibration,
  View,
} from 'react-native';
import isEqual from 'lodash.isequal';
import Constants from 'expo-constants';

// constraints
import constraints from './constraints';
// components
import LoadingOverlay, {
  ILoadingOverlay,
  LoadingStatus,
} from '../../../components/loading-overlay';
import Button from '../../../components/buttons/button';
import Toast, { IToast } from '../../../components/toast';
import InputImages from '../../../components/inputs/input-images';
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
const prefix = '[edit user set photo_url screen]';

type ChangeValueAction = {
  type: 'change_value';
  photo_url: string | null;
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
    photo_url?: string | null;

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
          photo_url: action.photo_url,
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
      photo_url: route.params.photo_url,

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
          photo_url: state.form.photo_url,
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
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      return;
    }
    console.log(state.form.photo_url);

    updateUser();
  };

  const changeHandler = (photo_url: string | null) => {
    dispatch({ type: 'change_value', photo_url });
    dispatch({ type: 'validate_value' });
  };

  const pressSaveHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    Keyboard.dismiss();
    submit();
  };

  useEffect(() => {
    const changed = !isEqual(route.params.photo_url, state.form.photo_url);
    dispatch({ type: 'set_changed', changed });
  }, [state.form.photo_url]);

  // render logic
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white }]}>
      <ScrollView
        style={[globalStyles.withPadding, { flex: 1, paddingTop: 15 }]}
      >
        <InputImages
          size={1}
          label="Imagen"
          path={`beast/${Constants.manifest.extra.BEAST_ENVIRONMENT}/users/${
            route.params.id
          }/${new Date().getTime()}-\${}`}
          value={state.form.photo_url ? [state.form.photo_url] : undefined}
          errors={state.form.errors?.photo_url}
          onChange={(photo) => {
            changeHandler(photo.length > 0 ? photo[0] : null);
          }}
        />
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
