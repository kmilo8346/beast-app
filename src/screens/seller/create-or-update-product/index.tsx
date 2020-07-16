import React, { useReducer, useRef } from 'react';
import { ScrollView, View, Image, Vibration } from 'react-native';

// components
import {
  Container,
  Text,
  Input,
  InputNumeric,
  InputSelectOptions,
  Button,
  LoadingOverlay,
  ILoadingOverlay,
  Toast,
  IToast,
  InputImages,
} from '../../../components';
// clients
import productClient from '../../../clients/product-client';
// libs
import validate from '../../../lib/validate';
import numberFormatter from '../../../lib/formatters/number-formatter';
import stringParser from '../../../lib/parsers/string-parser';
// containers
import UserProvider from '../../../containers/user';
// types
import { Product } from '../../../types';
// constraints
import constraints from './constraints';
// styles
import globalStyles from '../../../styles';

const productImage = require('../../../../assets/icons/tag.png');
const publishedImage = require('../../../../assets/icons/check.png');

// instances outside component
const prefix = '[create or update product component]';
const categories = [
  {
    key: 'DESPENSA',
    title: 'Despensa',
  },
  {
    key: 'COMIDAS PREPARADAS',
    title: 'Comidas preparadas',
  },
  {
    key: 'COMIDA ITALIANA Y PASTAS',
    title: 'Comida italiana y pastas',
  },
  {
    key: 'COMIDA VENEZOLANA',
    title: 'Comida Venezolana',
  },
  {
    key: 'FRUTAS Y VERDURAS',
    title: 'Frutas y verduras',
  },
  {
    key: 'LÁCTEOS Y HUEVOS',
    title: 'Lácteos y huevos',
  },
  {
    key: 'PANADERÍA Y PASTELERÍA',
    title: 'Panadería y pastelería',
  },
  {
    key: 'CARNES, AVES Y MARISCOS',
    title: 'Carnes, aves y mariscos',
  },
  {
    key: 'HOGAR',
    title: 'Hogar',
  },
  {
    key: 'BEBÉS',
    title: 'Bebés',
  },
  {
    key: 'CUIDADO PERSONAL Y SALUD',
    title: 'Cuidado personal y salud',
  },
  {
    key: 'MASCOTAS',
    title: 'Mascotas',
  },
  {
    key: 'FIESTAS Y CELEBRACIONES',
    title: 'Fiestas y celebraciones',
  },
  {
    key: 'VEGETARIANO Y VEGANO',
    title: 'Vegetariano y vegano',
  },
  {
    key: 'DEPORTE',
    title: 'Deporte',
  },
  {
    key: 'CERVEZAS, VINOS Y LICORES',
    title: 'Cervezas, vinos Y licores',
  },
  {
    key: 'OTROS',
    title: 'Otros',
  },
];

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
  const [state, dispatch] = useReducer(reducer, {
    view: 'FORM',
    form: {
      product,
      // other form states
      submitted: false,
    },
  });
  const userContainer = UserProvider.useContainer();
  const store = userContainer.getStore();
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);
  const toastRef = useRef<IToast>(null);

  // preconditions
  if (product && product.type !== 'product') {
    throw new Error(
      `${prefix} Product type must be 'product', invalid type: ${product.type}`
    );
  }
  if (!store) {
    throw new Error(`${prefix} Store must be defined`);
  }

  // event handlers
  const createOrUpdateProduct = async (product: Product) => {
    try {
      loadingOverlayRef.current?.show();
      await productClient.create({
        pathVars: {
          storeId: store.id,
        },
        body: product,
      });
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
      <Container
        safeArea
        withMargin
        style={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <Image
          source={publishedImage}
          style={{ height: 90, width: 90, marginBottom: 20 }}
        />
        <Text level={1} weight="bold" style={{ textAlign: 'center' }}>
          ¡Producto publicado con exito!
        </Text>
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
          <Button
            title="Continuar"
            style={globalStyles.withMainActionAir}
            onPress={() => {
              navigation.goBack();
            }}
          />
        </View>
      </Container>
    );
  }

  let title = 'Nuevo producto';
  if (state.form.product?.id) {
    title = 'Editar producto';
  }
  return (
    <Container safeArea fakeHeader>
      <ScrollView style={[globalStyles.withPadding]}>
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
          numberOfLines={10}
          onChangeText={(text) => {
            changeHandler('description', text);
          }}
        />
        <InputImages
          label="Imágenes"
          tip="Agrega imágenes para mostrar a los clientes detalles y funciones del producto."
          path={`stores/${store.id}/products/images/\${}`}
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
            containerStyle={{ width: '60%' }}
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
        <InputSelectOptions
          label="Categoría"
          placeholder="Seleccione categoría"
          value={state.form.product?.category}
          errors={state.form.errors?.category}
          modalTitle="Selecciona categoría"
          onChange={(key: string) => {
            changeHandler('category', key);
          }}
          options={categories}
        />
        <View style={globalStyles.withScreenAir} />
      </ScrollView>
      <View
        style={[
          { position: 'relative', left: 0, right: 0, bottom: 0 },
          globalStyles.withMargin,
        ]}
      >
        <Toast ref={toastRef} containerStyle={{ marginBottom: 10 }} />
        <Button
          title="Publicar producto"
          onPress={publishHadler}
          style={globalStyles.withMainActionAir}
        />
      </View>
      <LoadingOverlay ref={loadingOverlayRef} />
    </Container>
  );
};
