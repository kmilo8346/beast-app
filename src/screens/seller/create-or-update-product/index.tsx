import React, { useReducer, useRef } from 'react';
import { ScrollView, View, Image, Vibration } from 'react-native';

// components
import {
  Text,
  Input,
  InputNumeric,
  Button,
  LoadingOverlay,
  ILoadingOverlay,
  Toast,
  IToast,
  InputImages,
  Switch,
  InputTags,
} from '../../../components';
// clients
import productClient from '../../../clients/product-client';
// libs
import validate from '../../../lib/validate';
import numberFormatter from '../../../lib/formatters/number-formatter';
import stringParser from '../../../lib/parsers/string-parser';
import { noop } from '../../../lib/utils';
// containers
import UserProvider from '../../../containers/user';
// types
import { Product } from '../../../types';
// constraints
import constraints from './constraints';
// styles
import globalStyles from '../../../styles';
import colors from '../../../styles/colors';

const productImage = require('../../../../assets/icons/tag.png');
const publishedImage = require('../../../../assets/icons/check.png');

// instances outside component
const prefix = '[create or update product component]';

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
type ShowPublishedAction = {
  type: 'show_published';
};
type Action =
  | ChangeValueAction
  | ValidateValueAction
  | SetFormSubmittedAction
  | SetFormErrorsAction
  | ShowPublishedAction;
type State = {
  view: 'FORM' | 'PUBLISHED';
  form: {
    // fields
    product?: Product;
    // other form states
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
          product: {
            ...state.form.product,
            [action.attribute]: action.value,
          } as Product,
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
    case 'show_published':
      return { ...state, view: 'PUBLISHED' };
    default:
      return state;
  }
};

export interface CreateOrUpdateProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: CreateOrUpdateProps) => {
  // state
  const product = route.params?.product;
  const onChangeProduct = route.params?.onChangeProduct || noop;

  const [state, dispatch] = useReducer(reducer, {
    view: 'FORM',
    form: {
      product: { enabled: true, ...product },
      // other form states
      submitted: false,
    },
  });
  const userContainer = UserProvider.useContainer();
  const user = userContainer.get();
  if (!user) {
    throw new Error(`${prefix} User must be defined`);
  }
  const store = user.store;
  if (!store) {
    throw new Error(`${prefix} Store must be defined`);
  }
  if (product && product.type !== 'product') {
    throw new Error(
      `${prefix} Product type must be 'product', invalid type: ${product.type}`
    );
  }
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);
  const toastRef = useRef<IToast>(null);

  // event handlers
  const createOrUpdateProduct = async (product: Product) => {
    try {
      loadingOverlayRef.current?.show();
      if (product.id) {
        await productClient.update({
          pathVars: {
            storeId: store.id,
            id: product.id,
          },
          index: `products-${store.id}`,
          body: product,
        });
        onChangeProduct('updated', product);
      } else {
        const productCreated = await productClient.create({
          pathVars: {
            storeId: store.id,
          },
          body: product,
        });
        onChangeProduct('created', productCreated);
      }

      dispatch({ type: 'show_published' });
    } catch (error) {
      // TODO: log error
      console.log(error);
      toastRef.current?.show({
        message: 'Ocurrió un error, reintenta por favor',
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
  const publishHadler = () => {
    dispatch({ type: 'set_form_submitted' });
    // validate
    const errors = validate(state.form.product, constraints);
    if (errors) {
      Vibration.vibrate(400);
      dispatch({ type: 'set_form_errors', errors });
      return;
    }

    createOrUpdateProduct({
      ...state.form.product,
      // set type
      type: 'product',
      // set updated store
      store,
    } as Product);
  };

  // render logic
  if (state.view === 'PUBLISHED') {
    return (
      <View
        style={[
          {
            flex: 1,
            backgroundColor: colors.white,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <Image
          source={publishedImage}
          style={{ height: 90, width: 90, marginBottom: 20 }}
        />
        <Text level={1} weight="bold" style={{ textAlign: 'center' }}>
          ¡Producto publicado con exito!
        </Text>
        <View
          style={[
            { position: 'absolute', left: 0, right: 0, bottom: 0 },
            globalStyles.withMargin,
          ]}
        >
          <Button
            title="Continuar"
            style={globalStyles.withMainActionAir}
            onPress={() => {
              navigation.goBack();
            }}
          />
        </View>
      </View>
    );
  }

  let title = 'Nuevo producto';
  if (state.form.product?.id) {
    title = 'Editar producto';
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView style={[globalStyles.withPadding, { flex: 1 }]}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 30,
          }}
        >
          <Image source={productImage} style={{ width: 51, height: 51 }} />
          <Text level={2} weight="bold">
            {title}
          </Text>
        </View>
        <Input
          label="Nombre"
          placeholder="Porotos con riendas"
          value={state.form.product?.name}
          errors={state.form.errors?.name}
          lengthCounter
          maxLength={30}
          onChangeText={(text) => {
            changeHandler('name', text);
          }}
        />
        <Input
          label="Descripción"
          placeholder="Porotos con rienda caseros"
          value={state.form.product?.description}
          errors={state.form.errors?.description}
          lengthCounter
          maxLength={100}
          multiline
          onChangeText={(text) => {
            changeHandler('description', text);
          }}
        />
        <InputImages
          label="Imágenes"
          tip="Agrega imágenes para mostrar a los clientes detalles y funciones del producto."
          path={`stores/${store.id}/products/images/\${}`}
          value={state.form.product?.images}
          errors={state.form.errors?.images}
          onChange={(images) => {
            changeHandler('images', images);
          }}
        />
        <View style={{ flexDirection: 'row' }}>
          <Input
            label="Marca"
            placeholder="Don Pepe"
            value={state.form.product?.brand}
            errors={state.form.errors?.brand}
            onChangeText={(text) => {
              changeHandler('brand', text);
            }}
            containerStyle={{ flex: 1 }}
          />
          <View style={{ width: 15 }} />
          <InputNumeric
            label="Precio"
            placeholder="$1000"
            value={state.form.product?.price}
            errors={state.form.errors?.price}
            formatNumber={numberFormatter.toCurrency}
            parseNumber={stringParser.fromCurrency}
            onChangeValue={(price) => {
              changeHandler('price', price);
            }}
            containerStyle={{ flex: 1 }}
          />
        </View>
        <InputTags
          label="Tags"
          placeHolder="desayuno, once"
          size={3}
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
          <View style={{ flex: 1 }}>
            <Text level={6} style={{ marginBottom: 10 }}>
              Habilitar
            </Text>
            <Text level={7}>
              {state.form.product?.enabled
                ? 'Presione para desabilitar el producto'
                : 'Presione para habilitar el producto'}
            </Text>
          </View>
          <Switch
            value={state.form.product?.enabled}
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
          title="Publicar producto"
          onPress={publishHadler}
          style={globalStyles.withMainActionAir}
        />
      </View>
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
