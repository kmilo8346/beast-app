import React, { useReducer, useRef, useEffect, usePrevious } from 'react';
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
// containers
import UserProvider from '../../../containers/user';
// libs
import firebase from '../../../lib/firebase';
import { generatePushID } from '../../../lib/uuid';
// types
import { Place } from '../../../types';
// constraints
import constraints from './constraints';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

const PREFIX = '[set store info]';
let uploadTaskRef: firebase.storage.UploadTask | null = null;

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
type ShowUploadingAction = {
  type: 'show_uploading';
};
type HideUploadingAction = {
  type: 'hide_uploading';
};
type SetUploadingProgressAction = {
  type: 'set_uploading_progress';
  uploadingProgress: number;
};
type SetSubmitOpIdAction = {
  type: 'set_submit_op_id';
};
type Action =
  | ChangeValueAction
  | ValidateValueAction
  | SetFormSubmittedAction
  | SetFormErrorsAction
  | ShowSelectorAction
  | HideSelectorAction
  | ShowUploadingAction
  | HideUploadingAction
  | SetUploadingProgressAction
  | SetSubmitOpIdAction;
type State = {
  form: {
    // fields
    name: string;
    image: string;

    // hidden fields
    imageUrl: string;
    // other form states
    submitted: boolean;
    // identify the submit
    submitOpId?: number;
    errors?: { [key: string]: string[] };
  };
  selector: boolean;
  uploading: boolean;
  uploadingProgress: number;
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
      return {
        ...state,
        form: {
          ...state.form,
          submitted: true,
        },
      };
    case 'set_form_errors':
      return { ...state, form: { ...state.form, errors: action.errors } };
    case 'show_selector':
      return { ...state, selector: true };
    case 'hide_selector':
      return { ...state, selector: false };
    case 'show_uploading':
      return { ...state, uploading: true };
    case 'hide_uploading':
      return { ...state, uploading: false, uploadingProgress: 0 };
    case 'set_uploading_progress':
      return { ...state, uploadingProgress: action.uploadingProgress };
    case 'set_submit_op_id':
      return {
        ...state,
        form: { ...state.form, submitOpId: new Date().getTime() },
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
      imageUrl: '',
      // other form states
      submitted: false,
    },
    selector: false,
    uploading: false,
    uploadingProgress: 0,
  });
  const toastRef = useRef<IToast>(null);
  const userContainer = UserProvider.useContainer();
  const user = userContainer.getUser();
  const store = userContainer.getStore();

  // events handlers
  const changeHandler = (attribute: string, value: string) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
  };
  const showUnexpectedError = (error: Error) => {
    console.log(error);
    toastRef.current?.show({
      message: 'Ocurrió un error inesperado',
      expiration: 5,
    });
  };
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
  const imagePickedHandler = async (result: ImagePicker.ImagePickerResult) => {
    try {
      // preconditions
      if (result.cancelled) {
        throw new Error(`${PREFIX} Cant manage image picked if user cancelled`);
      }
      if (!store) {
        throw new Error(`${PREFIX} Store must be initialized`);
      }
      // set image uri to show to the user
      changeHandler('image', result.uri);

      // use this notation to override images and avoid clean tasks
      const fileName = '1.jpg';
      const metadata = {
        contentType: 'image/jpeg',
      };
      const response = await fetch(result.uri);
      const blob = await response.blob();

      const storageRef = firebase.storage().ref();
      uploadTaskRef = storageRef
        .child(`stores/${store?.id}/images/${fileName}`)
        .put(blob, metadata);

      dispatch({ type: 'show_uploading' });
      // Listen for state changes, errors, and completion of the upload.
      uploadTaskRef.on(
        firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        (snapshot) => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const uploadingProgress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          dispatch({ type: 'set_uploading_progress', uploadingProgress });
        },
        (error: any) => {
          dispatch({ type: 'hide_uploading' });

          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          // eslint-disable-next-line no-underscore-dangle
          const code = error.code || error.code_;
          if (code !== 'storage/canceled') {
            console.log(`${PREFIX} Error uploading image`, error);
            showUnexpectedError(error);
          }
        },
        async () => {
          dispatch({ type: 'hide_uploading' });
          try {
            // Upload completed successfully, now we can get the download URL
            const imageUrl = await uploadTaskRef?.snapshot.ref.getDownloadURL();
            changeHandler('imageUrl', imageUrl);
          } catch (error) {
            showUnexpectedError(error);
          }
        }
      );
    } catch (error) {
      showUnexpectedError(error);
    }
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

      imagePickedHandler(result);
    } catch (error) {
      showUnexpectedError(error);
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

      imagePickedHandler(result);
    } catch (error) {
      showUnexpectedError(error);
    }
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
    dispatch({ type: 'change_value', attribute: 'image', value: '' });
    dispatch({ type: 'change_value', attribute: 'imageUrl', value: '' });

    if (uploadTaskRef) {
      try {
        uploadTaskRef.cancel();
      } catch (error) {
        // TODO: manage error
        console.log(`${PREFIX} Error canceling task`);
      }
    }
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
    // update store
    userContainer.updateStore({
      name: state.form.name,
      images: [state.form.imageUrl],
    });
    // mark end of submit
    dispatch({ type: 'set_submit_op_id' });
  };

  useEffect(() => {
    // if not store initilized, initialized one with default values
    if (!store) {
      userContainer.updateStore({
        id: generatePushID(),
        phone: user?.phone,
        deliveryArea: {
          center: userContainer.getCurrentAddress() as Place,
          radius: '50m',
        },
        // TODO: add opening hours
      });
    }
  }, []);
  useEffect(() => {
    return () => {
      if (uploadTaskRef) {
        try {
          uploadTaskRef.cancel();
        } catch (error) {
          // TODO: manage error
          console.log(`${PREFIX} Error canceling task`);
        }
      }
    };
  }, []);
  useEffect(() => {
    if (state.form.submitOpId && store && store.name && store.images) {
      navigation.navigate('SetStoreDeliveryInfo');
    }
  }, [state.form.submitOpId, store, store?.name, store?.images]);

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
      {!!state.form.errors?.image && (
        <Text
          level={8}
          color={colors.red}
          style={{ marginTop: 10, textAlign: 'center' }}
        >
          {state.form.errors?.image[0]}
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
        {state.uploading && (
          <Text
            level={8}
            style={{ marginTop: 10, textAlign: 'center' }}
          >{`Subiendo imagen ${Math.round(state.uploadingProgress)}%`}</Text>
        )}
        {!!state.form.errors?.image && (
          <Text
            level={8}
            color={colors.red}
            style={{ marginTop: 10, textAlign: 'center' }}
          >
            {state.form.errors?.image[0]}
          </Text>
        )}
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
