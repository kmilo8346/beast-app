import React, { useReducer } from 'react';
import { ScrollView, View, Image, Vibration } from 'react-native';

// components
import {
  Container,
  Text,
  Input,
  InputNumeric,
  InputSelectOptions,
  Button,
} from '../../../components';
// local components
import { InputImages } from './components';
// libs
import validate from '../../../lib/validate';
import numberFormatter from '../../../lib/formatters/number-formatter';
import stringParser from '../../../lib/parsers/string-parser';
// containers
import UserProvider from '../../../containers/user';
// types
import { Store } from '../../../types';
// constraints
import constraints from './constraints';
// styles
import globalStyles from '../../../styles';

const productImage = require('../../../../assets/icons/tag.png');

// instances outside component
const prefix = '[create or update product component]';
const categories = [
  {
    key: 'DESPENSA',
    title: 'Despensa',
  },
  {
    key: 'COMIDA',
    title: 'Comida',
  },
];

interface Product {
  id: string;
  type: 'product';
  name: string;
  description?: string;
  images: string[];
  price: number;
  brand: string;
  format: string;
  tags: string[];
  category: string;
  store: Store;
}

interface Service {
  id: string;
  type: 'service';
  name: string;
  description?: string;
  images: string[];
  price: number | null;
  tags: string[];
  category: string;
  store: Store;
}

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
type Action =
  | ChangeValueAction
  | ValidateValueAction
  | SetFormSubmittedAction
  | SetFormErrorsAction;
type State = {
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
    default:
      return state;
  }
};

export interface ScreenProps {
  navigation: any;
  route: any;
}

export default ({ navigation, route }: ScreenProps) => {
  // state
  const product = route.params?.product;
  const [state, dispatch] = useReducer(reducer, {
    form: {
      product,
      // other form states
      submitted: false,
    },
  });
  const userContainer = UserProvider.useContainer();
  const store = userContainer.getStore();

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
  };

  // render logic
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
        <Input
          label="Marca"
          placeholder="Don Pepe"
          value={state.form.product?.brand}
          errors={state.form.errors?.description}
          onChangeText={(text) => {
            changeHandler('brand', text);
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
          <View style={{ width: 15 }} />
          <Input
            label="Formato"
            placeholder="1 unidad"
            value={state.form.product?.format}
            errors={state.form.errors?.format}
            onChangeText={(text) => {
              changeHandler('format', text);
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
        <Button
          title="Publicar producto"
          onPress={publishHadler}
          style={globalStyles.withMainActionAir}
        />
      </View>
    </Container>
  );
};
