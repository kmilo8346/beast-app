import React, { useState, useEffect } from 'react';
import { View, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios, { CancelTokenSource } from 'axios';

// components
import Touchable from '../../touchable';
import Icon from '../../icon';
import Text from '../../text';
import ButtonIcon from '../../buttons/button-icon';
import ActionSheet from '../../modals/action-sheet';
// libs
import cloudinary from '../../../lib/cloudinary';
// styles
import colors from '../../../styles/colors';

// instances outside component
const prefix = '[input images component]';
const sources: { [key: string]: CancelTokenSource } = {};
interface InputImage {
  id: string;
  uri: string;
  url: string;
  uploading: boolean;
}
const fromValue = (value?: string[]): InputImage[] => {
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
    };
  });
};

const getAvailableId = (images: InputImage[], size: number): string | null => {
  const checks = new Array<boolean>(size);
  images.forEach((image) => {
    checks[parseInt(image.id, 10)] = true;
  });
  let available: string | null = null;
  for (let index = 0; index < checks.length; index++) {
    const check = checks[index];
    if (!check) {
      available = `${index}`;
      break;
    }
  }
  return available;
};

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
  const [images, setImages] = useState<InputImage[]>(fromValue(value));
  const [selector, setSelector] = useState(false);

  // event handlers
  const addImage = (uri: string) => {
    const id = getAvailableId(images, size);
    if (id === null) {
      throw new Error(`${prefix} Available id is null`);
    }
    const newImage = {
      id,
      uri,
      url: '',
      uploading: true,
    };

    setImages((prevImages) => {
      return [...prevImages, newImage];
    });

    return newImage;
  };

  const updateImage = (id: string, update: Partial<InputImage>) => {
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

    if (sources[id]) {
      sources[id].cancel();
    }
  };

  const imagePickedHandler = async (result: ImagePicker.ImagePickerResult) => {
    // preconditions
    if (result.cancelled) {
      throw new Error(`${prefix} Cant manage image picked if user cancelled`);
    }

    // set image to immediately feedback
    const newImage = addImage(result.uri);

    try {
      if (sources[newImage.id]) {
        sources[newImage.id].cancel();
      }
      sources[newImage.id] = axios.CancelToken.source();
      // upload to cloudinary
      const public_id = path.replace('${}', newImage.id);
      const url = await cloudinary.upload(
        {
          file: {
            uri: result.uri,
            name: `${newImage.id}.jpg`,
            type: 'image/jpeg',
          },
          public_id,
        },
        sources[newImage.id].token
      );
      updateImage(newImage.id, { url });
    } catch (error) {
      if (!axios.isCancel(error)) {
        // TODO: Log error
        console.log(error);

        onError(error);
      }
    } finally {
      updateImage(newImage.id, { uploading: false });
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
        aspect: [4, 4],
        quality: 1,
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
        aspect: [4, 4],
        quality: 1,
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
      Object.keys(sources).forEach((key) => {
        if (sources[key]) {
          sources[key].cancel();
        }
      });
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
      <Text level={6} style={{ marginLeft: 4, marginBottom: 10 }}>
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
          const uri = image.uri
            ? image.uri
            : cloudinary.dynamicUrl(image.url, 'w_107,h_107,c_scale');
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
                source={{ uri }}
                style={{
                  width: 107,
                  height: 107,
                  borderRadius: 10,
                }}
              />
              <Text level={8} style={{ marginTop: 10, textAlign: 'center' }}>
                {image.uploading ? `Subiendo...` : ''}
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
