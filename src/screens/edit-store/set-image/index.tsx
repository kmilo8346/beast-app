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
import storeClient from '../../../clients/store-client';
// cache
import storeCache from '../../../cache/store';
// libs
import validate from '../../../lib/validate';
import { capture } from '../../../lib/sentry';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

// instances outside component
const prefix = '[edit store set image screen]';

type ChangeValueAction = {
  type: 'change_value';
  images: string[];
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
    images: string[];

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
          images: action.images,
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
      images: route.params.images,

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
          images: state.form.images,
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
    dispatch({ type: 'set_form_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      return;
    }

    updateStore();
  };

  const changeHandler = (images: string[]) => {
    dispatch({ type: 'change_value', images });
    dispatch({ type: 'validate_value' });
  };

  const pressSaveHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    Keyboard.dismiss();
    submit();
  };

  useEffect(() => {
    const changed = !isEqual(route.params.images, state.form.images);
    dispatch({ type: 'set_changed', changed });
  }, [state.form.images]);

  // render logic
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white }]}>
      <ScrollView
        style={[globalStyles.withPadding, { flex: 1, paddingTop: 15 }]}
      >
        <InputImages
          size={1}
          label="Imagen"
          path={`beast/${Constants.manifest.extra.BEAST_ENVIRONMENT}/stores/${
            route.params.reference
          }/${new Date().getTime()}-\${}`}
          value={state.form.images}
          errors={state.form.errors?.images}
          onChange={(images) => {
            changeHandler(images);
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
