import React, { useReducer, useRef } from 'react';
import { View, ScrollView, Linking, Image, Vibration } from 'react-native';
import validate from 'validate.js';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';

// components
import {
  Container,
  Text,
  Input,
  Button,
  Touchable,
  Icon,
  ActionSheet,
  Toast,
  IToast,
  ButtonIcon,
} from '../../../components';
// constraints
import constraints from './constraints';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

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
type SetFormSubmittedAction = {
  type: 'set_form_submitted';
};
type SetFormErrorsAction = {
  type: 'set_form_errors';
  errors: { [key: string]: string[] };
};
type ShowSelectorAction = {
  type: 'show_selector';
};
type HideSelectorAction = {
  type: 'hide_selector';
};
type SetImageAction = {
  type: 'set_image';
  image: string;
  imageBase64: string;
};
type Action =
  | ChangeValueAction
  | ValidateValueAction
  | SetFormSubmittedAction
  | SetFormErrorsAction
  | ShowSelectorAction
  | HideSelectorAction
  | SetImageAction;
type State = {
  form: {
    // fields
    name: string;
    image: string;

    // hidden fields
    imageBase64: string;
    // other form states
    submitted: boolean;
    errors?: { [key: string]: string[] };
  };
  selector: boolean;
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
          errors: validate(state.form, constraints),
        },
      };
    case 'set_form_submitted':
      return { ...state, form: { ...state.form, submitted: true } };
    case 'set_form_errors':
      return { ...state, form: { ...state.form, errors: action.errors } };
    case 'show_selector':
      return { ...state, selector: true };
    case 'hide_selector':
      return { ...state, selector: false };
    case 'set_image':
      return {
        ...state,
        form: {
          ...state.form,
          image: action.image,
          imageBase64: action.imageBase64,
        },
      };
    default:
      return state;
  }
};

export interface ScreenProps {
  navigation: any;
}

export default ({ navigation }: ScreenProps) => {
  // state
  const [state, dispatch] = useReducer(reducer, {
    form: {
      // fields
      name: '',
      image: '',
      // hidden fields
      imageBase64: '',
      // other form states
      submitted: false,
    },
    selector: false,
  });
  const toastRef = useRef<IToast>(null);

  // events handlers
  const permisionNotGrantedHandler = () => {
    toastRef.current?.show({
      message: 'Se necesita asignar permisos',
      action: (
        <Button
          type="link"
          title="Asignar"
          onPress={() => {
            Linking.openURL('app-settings:');
          }}
        />
      ),
      type: 'WARNING',
      expiration: 5,
    });
  };
  const pickImageFromImageLibrary = async () => {
    try {
      if (Constants.platform?.ios) {
        // Permissions.CAMERA_ROLL on iOS 10 is required
        const permisionResponse = await ImagePicker.requestCameraRollPermissionsAsync();
        if (permisionResponse.status !== 'granted') {
          permisionNotGrantedHandler();
          return;
        }
      }
      // launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });
      if (result.cancelled) {
        return;
      }

      // set image uri and image base 64
      dispatch({
        type: 'set_image',
        image: result.uri,
        imageBase64: result.base64 as string,
      });
    } catch (error) {
      toastRef.current?.show({
        message: 'Ocurrió un error inesperado',
        expiration: 5,
      });
    }
  };
  const takePhotoUsingCamera = async () => {
    try {
      const cameraRollPermisionResponse = await ImagePicker.requestCameraRollPermissionsAsync();
      if (cameraRollPermisionResponse.status !== 'granted') {
        permisionNotGrantedHandler();
        return;
      }
      const cameraPermisionResponse = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermisionResponse.status !== 'granted') {
        permisionNotGrantedHandler();
        return;
      }

      // launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });
      if (result.cancelled) {
        return;
      }

      // set image uri and image base 64
      dispatch({
        type: 'set_image',
        image: result.uri,
        imageBase64: result.base64 as string,
      });
    } catch (error) {
      toastRef.current?.show({
        message: 'Ocurrió un error inesperado',
        expiration: 5,
      });
    }
  };
  const changeHandler = (attribute: string, value: string) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
  };
  const selectorRequestCloseHandler = () => {
    dispatch({ type: 'hide_selector' });
  };
  const selectorCallActionHandler = async (key: string) => {
    try {
      switch (key) {
        case 'take_picture':
          await takePhotoUsingCamera();
          break;
        case 'select_from_roll':
          await pickImageFromImageLibrary();
          break;
        default:
          break;
      }
    } finally {
      dispatch({ type: 'hide_selector' });
    }
  };
  const pressAddImageHandler = () => {
    dispatch({ type: 'show_selector' });
  };
  const pressClearImageHandler = () => {
    dispatch({ type: 'set_image', image: '', imageBase64: '' });
  };
  const pressContinueHandler = () => {
    dispatch({ type: 'set_form_submitted' });
    // validate
    const errors = validate(state.form, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      return;
    }
    console.log('submit image, navigate to set store delivery info');
  };

  // render logic
  let image = (
    <View style={{ alignSelf: 'center', marginTop: 20 }}>
      <Touchable onPress={pressAddImageHandler}>
        <View
          style={{
            height: 200,
            width: 200,
            justifyContent: 'center',
            alignItems: 'center',
            borderColor: colors.blue,
            borderWidth: 1,
            borderRadius: 100,
          }}
        >
          <Icon name="plus" color={colors.blue} />
          <Text level={5} color={colors.blue}>
            Agregar Imagen
          </Text>
        </View>
      </Touchable>
      {!!state.form.errors && (
        <Text
          level={8}
          color={colors.red}
          style={{ marginTop: 10, textAlign: 'center' }}
        >
          {state.form.errors?.image}
        </Text>
      )}
    </View>
  );
  if (state.form.image) {
    image = (
      <View
        style={{ position: 'relative', alignSelf: 'center', marginTop: 20 }}
      >
        <ButtonIcon
          icon="x"
          onPress={pressClearImageHandler}
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            backgroundColor: colors.blackLight6,
            zIndex: 9,
            borderRadius: 10,
          }}
        />
        <Image
          source={{ uri: state.form.image }}
          style={{
            width: 300,
            height: 300,

            borderRadius: 10,
          }}
        />
      </View>
    );
  }
  return (
    <Container>
      <ScrollView style={[{ flex: 1 }, globalStyles.withPadding]}>
        <Text level={2} weight="bold" style={{ marginBottom: 10 }}>
          Información de tienda
        </Text>
        <Text level={5} style={{ marginBottom: 30, lineHeight: 23 }}>
          Te pediremos algúnos datos necesarios para crear tu tienda
        </Text>
        <Input
          placeholder="Minimarket Don Juan"
          label="Nombre de tienda"
          value={state.form.name}
          errors={state.form.errors?.name}
          onChangeText={(text) => {
            changeHandler('name', text);
          }}
        />
        <Text level={2} weight="bold" style={{ marginTop: 10 }}>
          Imagen de tienda
        </Text>
        {image}

        <View style={globalStyles.withScreenAir} />
      </ScrollView>
      <View
        style={[
          { position: 'absolute', left: 0, right: 0, bottom: 0 },
          globalStyles.withMargin,
        ]}
      >
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        <Button
          title="Continuar"
          onPress={pressContinueHandler}
          style={globalStyles.withMainActionAir}
        />
      </View>
      {state.selector && (
        <ActionSheet
          options={[
            {
              key: 'take_picture',
              text: 'Saca una foto',
            },
            {
              key: 'select_from_roll',
              text: 'Seleccionar foto de la galería',
            },

            { key: 'cancel', text: 'Cancelar', type: 'cancel' },
          ]}
          onRequestClose={selectorRequestCloseHandler}
          onCallAction={selectorCallActionHandler}
        />
      )}
    </Container>
  );
};
