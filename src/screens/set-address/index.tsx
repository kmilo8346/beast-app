import React, { useReducer, useRef } from 'react';
import { View, TextInput, Vibration, ScrollView } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// components
import Input from '../../components/inputs/input';
import Button from '../../components/buttons/button';
import Text from '../../components/text';
import InputPlaceAutocomplete from '../../components/inputs/input-place-autocomplete';
import Toast, { IToast } from '../../components/toast';
import LoadingOverlay, {
  ILoadingOverlay,
} from '../../components/loading-overlay';
import MapPinShadedBlue from '../../components/svgs/icons/map-pin-shaded-blue';
// clients
import userClient from '../../clients/user-client';
// libs
import validate from '../../lib/validate';
// cache
import userCache from '../../cache/user';
// types
import { Place } from '../../types';
// constraints
import constraints from './constraints';
// styles
import globalStyles from '../../styles';
import colors from '../../styles/colors';

// instances outside component
const prefix = '[set address screen]';

type SetAddressView = 'FORM' | 'AUTOCOMPLETE';

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
  view: SetAddressView;
};
type SetSubmittedAction = {
  type: 'set_submitted';
};
type SetFormErrorsAction = {
  type: 'set_form_errors';
  errors: { [key: string]: string[] };
};
type SetSubmitOpIdAction = {
  type: 'set_submit_op_id';
  opId: number;
};

type Action =
  | ChangeValueAction
  | ValidateValueAction
  | ChangeViewAction
  | SetSubmittedAction
  | SetFormErrorsAction
  | SetSubmitOpIdAction;

type State = {
  view: SetAddressView;
  form: {
    // fields
    address?: Place | undefined;
    apartment: string;

    // other states
    submitted: boolean;
    // identify the submit
    submitOpId?: number;
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
    case 'set_submit_op_id':
      return {
        ...state,
        form: { ...state.form, submitOpId: action.opId },
      };
    default:
      return state;
  }
};

interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  const insets = useSafeAreaInsets();
  // state
  const [state, dispatch] = useReducer(reducer, {
    view: 'FORM',
    form: {
      // fields
      apartment: '',

      // other states
      submitted: false,
    },
  });

  const user = userCache.getData();
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const apartmentInput = useRef<TextInput>(null);
  const toastRef = useRef<IToast>(null);
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);

  // event handlers
  const changeHandler = (attribute: string, value: any) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value' });
  };

  const openAutocompleteHandler = () => {
    dispatch({ type: 'change_view', view: 'AUTOCOMPLETE' });
  };

  const closeAutocompleteHandler = () => {
    dispatch({ type: 'change_view', view: 'FORM' });
  };

  const pressContinueHandler = async () => {
    // set submitted
    dispatch({ type: 'set_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      return;
    }

    try {
      loadingOverlayRef.current?.show();
      const user = userCache.getData();
      const address: Place = {
        ...(state.form.address as Place),
        apartment: state.form.apartment,
      };
      const toSave: any = {
        ...user,
        current_address: address.id,
        addresses: [address],
      };

      const created = await userClient.create({
        body: toSave,
      });
      await userCache.setData(created);
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: 'MainTab' }],
        })
      );
    } catch (error) {
      // TODO: log error
      console.log(error);

      toastRef.current?.show({
        type: 'ERROR',
        message: 'Error inesperado, reintente por favor',
        expiration: 3,
      });
    } finally {
      loadingOverlayRef.current?.hide();
    }
  };

  // render logic
  let text = null;
  let apartment = null;

  if (state.view === 'FORM') {
    text = (
      <Text
        level={4}
        weight="light"
        style={{ marginBottom: 40, marginTop: 20, lineHeight: 25 }}
      >
        Para ofrecerte una mejor búsqueda de comercios cerca de ti.
      </Text>
    );
    apartment = (
      <Input
        ref={apartmentInput}
        placeholder="1009"
        label="Departamento"
        returnKeyType="done"
        onSubmitEditing={pressContinueHandler}
        value={state.form.apartment}
        onChangeText={(text) => {
          changeHandler('apartment', text);
        }}
      />
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView style={[{ flex: 1 }, globalStyles.withPadding]}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            marginTop: 20,
          }}
        >
          <MapPinShadedBlue />
          <Text
            level={2}
            weight="bold"
            style={{ marginLeft: 10, letterSpacing: -1 }}
          >
            Agrega tu dirección
          </Text>
        </View>
        {text}
        <InputPlaceAutocomplete
          label="Dirección"
          placeholder="Jose Pedro Alessandri 927"
          value={state.form.address}
          onChange={(address) => {
            changeHandler('address', address);
          }}
          onOpen={openAutocompleteHandler}
          onClose={closeAutocompleteHandler}
          errors={state.form.errors?.address}
        />
        {apartment}
      </ScrollView>
      <View style={[globalStyles.withMargin, { paddingBottom: insets.bottom }]}>
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        <Button
          title="Continuar"
          onPress={pressContinueHandler}
          style={globalStyles.withMainActionAir}
        />
      </View>
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
