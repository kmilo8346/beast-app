import React, { useState, useEffect } from 'react';
import { View, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// components
import {
  Touchable,
  Icon,
  Text,
  ButtonIcon,
  ActionSheet,
} from '../../../../../components';
// libs
import firebase from '../../../../../lib/firebase';
import { generatePushID } from '../../../../../lib/uuid';
// styles
import colors from '../../../../../styles/colors';

// instances outside component
const prefix = '[input images component]';
interface Image {
  id: string;
  uri: string;
  url: string;
  uploading: boolean;
  progress: number;
}
const fromValue = (value?: string[]): Image[] => {
  if (!value) {
    return [];
  }
  return value.map((v) => {
    let parts = v.split('/');
    parts = parts[parts.length - 1].split('.');

    return {
      id: parts[0],
      url: v,
      uri: '',
      uploading: false,
      progress: 0,
    };
  });
};
let uploadTaskRef: firebase.storage.UploadTask | null = null;

export interface InputImagesProps {
  label?: string;
  tip?: string;
  value?: string[];
  size?: number;
  path: string;
  errors?: string[];
  onChange?: (value: string[]) => void;
  onPermisionNotGranted?: () => void;
  onError?: (error: Error) => void;
}

export default ({
  label,
  tip,
  value,
  size = 3,
  path,
  errors,
  onChange = () => null,
  onPermisionNotGranted = () => null,
  onError = () => null,
}: InputImagesProps) => {
  // state
  const [images, setImages] = useState<Image[]>(fromValue(value));
  const [selector, setSelector] = useState(false);

  // event handlers
  const addImage = (uri: string) => {
    const newImage = {
      id: generatePushID(),
      uri,
      url: '',
      uploading: false,
      progress: 0,
    };

    setImages((prevImages) => {
      return [...prevImages, newImage];
    });

    return newImage;
  };
  const updateImage = (id: string, update: Partial<Image>) => {
    setImages((prevImages) => {
      return prevImages.map((image) => {
        if (image.id === id) {
          return { ...image, ...update };
        }
        return image;
      });
    });
  };
  const removeImage = (id: string) => {
    setImages((prevImages) => {
      return prevImages.filter((image) => image.id !== id);
    });
  };
  const pressClearImageHandler = (id: string) => {
    removeImage(id);

    if (uploadTaskRef) {
      try {
        uploadTaskRef.cancel();
      } catch (error) {
        // TODO: manage error
        console.log(`${prefix} Error canceling task`);
      }
    }
  };
  const imagePickedHandler = async (result: ImagePicker.ImagePickerResult) => {
    try {
      // preconditions
      if (result.cancelled) {
        throw new Error(`${prefix} Cant manage image picked if user cancelled`);
      }
      // set image uri to show to the user
      const newImage = addImage(result.uri);

      // use this notation to override images and avoid clean tasks
      const fileName = `${newImage.id}.jpg`;
      const metadata = {
        contentType: 'image/jpeg',
      };
      const response = await fetch(result.uri);
      const blob = await response.blob();

      const storageRef = firebase.storage().ref();
      uploadTaskRef = storageRef
        .child(path.replace('${}', fileName))
        .put(blob, metadata);

      updateImage(newImage.id, { uploading: true });
      // Listen for state changes, errors, and completion of the upload.
      uploadTaskRef.on(
        firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        (snapshot) => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          updateImage(newImage.id, { progress });
        },
        (error: any) => {
          updateImage(newImage.id, { uploading: false });

          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          // eslint-disable-next-line no-underscore-dangle
          const code = error.code || error.code_;
          if (code !== 'storage/canceled') {
            onError(error);
          }
        },
        async () => {
          updateImage(newImage.id, { uploading: false });
          try {
            // Upload completed successfully, now we can get the download URL
            const url = await uploadTaskRef?.snapshot.ref.getDownloadURL();
            updateImage(newImage.id, { url });
          } catch (error) {
            onError(error);
          }
        }
      );
    } catch (error) {
      onError(error);
    }
  };
  const pickImageFromImageLibrary = async () => {
    try {
      if (Platform.OS === 'ios') {
        // Permissions.CAMERA_ROLL on iOS 10 is required
        const permisionResponse = await ImagePicker.requestCameraRollPermissionsAsync();
        if (permisionResponse.status !== 'granted') {
          onPermisionNotGranted();
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
      onError(error);
    }
  };
  const takePhotoUsingCamera = async () => {
    try {
      const cameraRollPermisionResponse = await ImagePicker.requestCameraRollPermissionsAsync();
      if (cameraRollPermisionResponse.status !== 'granted') {
        onPermisionNotGranted();
        return;
      }
      const cameraPermisionResponse = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPermisionResponse.status !== 'granted') {
        onPermisionNotGranted();
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
      onError(error);
    }
  };
  const selectorRequestCloseHandler = () => {
    setSelector(false);
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
      setSelector(false);
    }
  };
  const pressAddImageHandler = () => {
    setSelector(true);
  };
  useEffect(() => {
    return () => {
      if (uploadTaskRef) {
        try {
          uploadTaskRef.cancel();
        } catch (error) {
          // TODO: manage error
          console.log(`${prefix} Error canceling task`);
        }
      }
    };
  }, []);
  useEffect(() => {
    onChange(images.map((image) => (image.url ? image.url : '')));
  }, [images]);

  // render logic
  let labelComponent = null;
  let tipComponent = null;
  let addComponent = null;
  if (label) {
    labelComponent = (
      <Text level={6} style={{ marginLeft: 4 }}>
        {label}
      </Text>
    );
  }
  if (tip) {
    tipComponent = (
      <Text
        level={7}
        style={{
          marginLeft: 4,
          lineHeight: 20,
          marginTop: 10,
          marginBottom: 10,
        }}
      >
        {tip}
      </Text>
    );
  }
  if (images.length < size) {
    addComponent = (
      <Touchable onPress={pressAddImageHandler}>
        <View
          style={{
            marginLeft: 10,
            height: 107,
            width: 107,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: colors.blueLight2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon name="plus" color={colors.blue} />
        </View>
      </Touchable>
    );
  }
  const error = Array.isArray(errors) && errors.length ? errors[0] : null;
  return (
    <View style={{ marginBottom: 5 }}>
      {labelComponent}
      {tipComponent}
      <View style={{ flexDirection: 'row' }}>
        {images.map((image) => {
          return (
            <View
              key={image.id}
              style={{ position: 'relative', marginRight: 5 }}
            >
              <ButtonIcon
                icon="x"
                onPress={() => {
                  pressClearImageHandler(image.id);
                }}
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
                source={{ uri: image.url || image.uri }}
                style={{
                  width: 107,
                  height: 107,
                  borderRadius: 10,
                }}
              />
              <Text level={8} style={{ marginTop: 10, textAlign: 'center' }}>
                {image.uploading && image.progress
                  ? `Subiendo ${Math.round(image.progress)}%`
                  : ''}
              </Text>
            </View>
          );
        })}
        {addComponent}
      </View>
      <Text
        level={8}
        color={colors.red}
        style={{ marginTop: 3, marginLeft: 4 }}
      >
        {error || ' '}
      </Text>
      {selector && (
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
    </View>
  );
};
