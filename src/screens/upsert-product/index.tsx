import React, { useLayoutEffect, useReducer, useRef } from 'react';
import {
  GestureResponderEvent,
  Keyboard,
  ScrollView,
  Vibration,
  View,
} from 'react-native';

import Constants from 'expo-constants';

// constraints
import constraints from './constraints';
// screen components
import ConfirmDialog from '../components/dialogs/confirm-dialog';
// components
import Input from '../../components/inputs/input';
import InputImages from '../../components/inputs/input-images';
import Text from '../../components/text';
import Button from '../../components/buttons/button';
import LoadingOverlay, {
  ILoadingOverlay,
} from '../../components/loading-overlay';
import Toast, { IToast } from '../../components/toast';
import Switch from '../../components/switch';
import InputNumeric from '../../components/inputs/input-numeric';
import InputTags from '../../components/inputs/input-tags';
import Touchable from '../../components/touchable';
import Icon from '../../components/icon';
// clients
import productClient from '../../clients/product-client';
// cache
import userCache from '../../cache/user';
import storeCache from '../../cache/store';
// libs
import validate from '../../lib/validate';
import { v4 as uuidv4 } from '../../lib/uuid';
import numberFormatter from '../../lib/formatters/number-formatter';
import stringParser from '../../lib/parsers/string-parser';
import { capture } from '../../lib/sentry';
// types
import { Product, Store } from '../../types';
// styles
import colors from '../../styles/colors';
import globalStyles from '../../styles';

// instances outside component
const prefix = '[upsert product screen]';

type ChangeValueAction = {
  type: 'change_value';
  attribute: string;
  value: any;
};
type ValidateValueAction = {
  type: 'validate_value';
  attribute: string;
  value: any;
};
type SetFormSubmittedAction = {
  type: 'set_form_submitted';
};
type SetFormErrorsAction = {
  type: 'set_form_errors';
  errors: { [key: string]: string[] };
};
type SetConfirmDialogAction = {
  type: 'set_confirm_dialog';
  confirm_dialog: boolean;
};
type Action =
  | ChangeValueAction
  | ValidateValueAction
  | SetFormSubmittedAction
  | SetFormErrorsAction
  | SetConfirmDialogAction;
type State = {
  form: {
    product: Product;

    submitted: boolean;
    errors?: { [key: string]: string[] };
  };
  confirm_dialog: boolean;
};
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'change_value':
      return {
        ...state,
        form: {
          ...state.form,
          product: { ...state.form.product, [action.attribute]: action.value },
        },
      };
    case 'validate_value':
      if (!state.form.submitted) return state;

      return {
        ...state,
        form: {
          ...state.form,
          errors: validate(state.form.product, constraints),
        },
      };
    case 'set_form_submitted':
      return { ...state, form: { ...state.form, submitted: true } };
    case 'set_form_errors':
      return { ...state, form: { ...state.form, errors: action.errors } };
    case 'set_confirm_dialog':
      return { ...state, confirm_dialog: action.confirm_dialog };
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
  const user = userCache.getData();
  const store = storeCache.getData() as Store;
  const [state, dispatch] = useReducer(reducer, {
    form: {
      product: route.params?.product
        ? {
            ...route.params?.product,
            store_info: {
              id: store.id,
              enabled: store.enabled,
              delivery_area: store.delivery_area.geometry,
              opening_hours: store.opening_hours,
            },
          }
        : (({
            tags: [],
            images: [],
            enabled: true,
            reference: `${`${user?.id as string}`.substring(0, 6)}-${uuidv4()}`,
            store_info: {
              id: store.id,
              enabled: store.enabled,
              delivery_area: store.delivery_area.geometry,
              opening_hours: store.opening_hours,
            },
          } as unknown) as Product),

      submitted: false,
    },
    confirm_dialog: false,
  });
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);
  const toastRef = useRef<IToast>(null);

  // event handlers
  const createProduct = async () => {
    try {
      loadingOverlayRef.current?.show();
      const created = await productClient.create({
        pathVars: {
          storeId: store.id,
        },
        body: state.form.product,
      });
      navigation.navigate('MyStore', { add: created });
    } catch (error) {
      capture(prefix, 'Create product error', error);

      Vibration.vibrate(400);
      toastRef.current?.show({
        message: 'No se puedo crear, reintenta por favor',
        type: 'ERROR',
        expiration: 3,
      });
    } finally {
      loadingOverlayRef.current?.hide();
    }
  };

  const updateProduct = async () => {
    try {
      loadingOverlayRef.current?.show();
      await productClient.update({
        pathVars: { storeId: store.id, id: state.form.product.id },
        body: state.form.product,
      });
      navigation.navigate('MyStore', { update: state.form.product });
    } catch (error) {
      capture(prefix, 'Update product error', error);

      Vibration.vibrate(400);
      toastRef.current?.show({
        message: 'No se pudo actualizar, reintenta por favor',
        type: 'ERROR',
        expiration: 3,
      });
    } finally {
      loadingOverlayRef.current?.hide();
    }
  };

  const deleteProduct = async () => {
    try {
      loadingOverlayRef.current?.show();
      await productClient.delete({
        pathVars: { storeId: store.id, id: state.form.product.id },
      });
      navigation.navigate('MyStore', { delete: state.form.product.id });
    } catch (error) {
      capture(prefix, 'Delete product error', error);

      Vibration.vibrate(400);
      toastRef.current?.show({
        message: 'No se pudo eliminar, reintenta por favor',
        type: 'ERROR',
        expiration: 3,
      });
    } finally {
      loadingOverlayRef.current?.hide();
    }
  };

  const changeHandler = (attribute: string, value: any) => {
    dispatch({ type: 'change_value', attribute, value });
    dispatch({ type: 'validate_value', attribute, value });
  };

  const pressSaveHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    Keyboard.dismiss();
    dispatch({ type: 'set_form_submitted' });
    // validate
    const errors = validate(state.form.product, constraints);
    if (errors) {
      dispatch({ type: 'set_form_errors', errors });
      Vibration.vibrate(400);
      toastRef.current?.show({
        message: 'Revise formulario, por favor',
        type: 'ERROR',
        expiration: 3,
      });
      return;
    }

    if (!state.form.product.id) {
      createProduct();
    } else {
      updateProduct();
    }
  };

  const pressDeleteHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    dispatch({ type: 'set_confirm_dialog', confirm_dialog: true });
  };

  const confirmDialogOkHandler = () => {
    dispatch({ type: 'set_confirm_dialog', confirm_dialog: false });
    setTimeout(() => {
      deleteProduct();
    }, 500);
  };

  const confirmDialogCancelHandler = () => {
    dispatch({ type: 'set_confirm_dialog', confirm_dialog: false });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params?.product ? 'Editar producto' : 'Crear producto',
      headerRight: () => {
        if (!route.params?.product) {
          return null;
        }
        return (
          <Touchable
            style={{
              paddingVertical: 5,
              paddingHorizontal: 20,
            }}
            onPress={pressDeleteHandler}
          >
            <Icon name="trash-2" size={20} />
          </Touchable>
        );
      },
    });
  }, [route.params?.product]);

  // render logic
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white }]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={[globalStyles.withPadding, { flex: 1 }]}
      >
        <InputImages
          required
          label="Imágenes"
          path={`beast/${Constants.manifest.extra.BEAST_ENVIRONMENT}/stores/${
            store.reference
          }/products/${
            state.form.product.reference
          }/${new Date().getTime()}-\${}`}
          value={state.form.product?.images}
          errors={state.form.errors?.images}
          onChange={(images) => {
            changeHandler('images', images);
          }}
        />
        <Input
          required
          label="Nombre"
          lengthCounter
          maxLength={30}
          placeholder="Porotos con riendas"
          value={state.form.product?.name}
          errors={state.form.errors?.name}
          onChangeText={(text) => {
            changeHandler('name', text);
          }}
        />
        <Input
          multiline
          label="Descripción"
          lengthCounter
          maxLength={200}
          placeholder="Ricos porotos con rienda caseros"
          value={state.form.product?.description}
          errors={state.form.errors?.description}
          onChangeText={(text) => {
            changeHandler('description', text);
          }}
        />
        <InputNumeric
          required
          label="Precio"
          maxLength={15}
          placeholder="$1000"
          value={state.form.product?.price}
          errors={state.form.errors?.price}
          formatNumber={numberFormatter.toCurrency}
          parseNumber={stringParser.fromCurrency}
          clearButtonMode="never"
          onChangeValue={(price) => {
            changeHandler('price', price);
          }}
        />
        <InputTags
          label="Tags"
          placeHolder="Agrega palabras claves. Ej: colación"
          size={3}
          maxLength={23}
          value={state.form.product?.tags}
          onChange={(key: string[]) => {
            changeHandler('tags', key);
          }}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text level={6}>Visibilidad</Text>
          <View style={{ flex: 1 }} />
          <Text level={6} weight="light" style={{ marginRight: 5 }}>
            {state.form.product.enabled ? 'Visible' : 'No visible'}
          </Text>
          <Switch
            defaultValue
            value={state.form.product.enabled}
            onValueChange={(value) => {
              changeHandler('enabled', value);
            }}
          />
        </View>
        <View style={globalStyles.withScreenAir} />
      </ScrollView>
      <View style={[globalStyles.withMargin]}>
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        <Button
          title="Guardar"
          style={globalStyles.withMainActionAir}
          onPress={pressSaveHandler}
        />
      </View>
      <LoadingOverlay ref={loadingOverlayRef} />
      {state.confirm_dialog && (
        <ConfirmDialog
          title="¿Seguro que quieres eliminar el producto?"
          okText="Eliminar"
          onOk={confirmDialogOkHandler}
          onCancel={confirmDialogCancelHandler}
        />
      )}
    </View>
  );
};
