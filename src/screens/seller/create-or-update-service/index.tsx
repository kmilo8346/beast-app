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
  Checkbox,
  Switch,
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
import { Service } from '../../../types';
// constraints
import constraints from './constraints';
// styles
import globalStyles from '../../../styles';

const serviceImage = require('../../../../assets/icons/hand_shake.png');
const publishedImage = require('../../../../assets/icons/check.png');

// instances outside component
const prefix = '[create or update service component]';
const categories = [
  {
    key: 'REPARACIONES DEL HOGAR',
    title: 'Reparaciones del hogar',
  },
  {
    key: 'BELLEZA Y SALUD',
    title: 'Belleza y salud',
  },
  {
    key: 'MENSAJERÍA',
    title: 'Mensajeria',
  },
  {
    key: 'MASCOTAS',
    title: 'Mascotas',
  },
  {
    key: 'OTROS',
    title: 'Otros',
  },
];
validate.validators.servicePrice = (
  value: any,
  options: {
    message: string;
  }
) => {
  if (value === null || (Number.isInteger(value) && value > 0)) {
    return null;
  }

  return options.message;
};

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
    service?: Service;
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
          service: {
            ...state.form.service,
            [action.attribute]: action.value,
          } as Service,
        },
      };
    case 'validate_value':
      if (!state.form.submitted) return state;

      return {
        ...state,
        form: {
          ...state.form,
          errors: validate(state.form.service, constraints),
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
  const service = route.params?.service;
  const [state, dispatch] = useReducer(reducer, {
    view: 'FORM',
    form: {
      service: { enabled: true, ...service },
      // other form states
      submitted: false,
    },
  });
  const userContainer = UserProvider.useContainer();
  const store = userContainer.getStore();
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);
  const toastRef = useRef<IToast>(null);

  // preconditions
  if (service && service.type !== 'service') {
    throw new Error(
      `${prefix} Service type must be 'service', invalid type: ${service.type}`
    );
  }
  if (!store) {
    throw new Error(`${prefix} Store must be defined`);
  }

  // event handlers
  const createOrUpdateService = async (service: Service) => {
    try {
      loadingOverlayRef.current?.show();
      await productClient.create({
        pathVars: {
          storeId: store.id,
        },
        body: service,
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
    const errors = validate(state.form.service, constraints);
    if (errors) {
      Vibration.vibrate(400);
      dispatch({ type: 'set_form_errors', errors });
      return;
    }

    createOrUpdateService({
      ...state.form.service,
      // set type
      type: 'service',
      // set updated store
      store,
    } as Service);
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
          Servicio publicado con exito!
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

  let title = 'Nuevo servicio';
  if (state.form.service?.id) {
    title = 'Editar servicio';
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
          <Image
            source={serviceImage}
            style={{ width: 51, height: 51, marginRight: 10 }}
          />
          <Text level={2} weight="bold">
            {title}
          </Text>
        </View>
        <Input
          label="Nombre"
          placeholder="Cortes de cabello a domicilio"
          value={state.form.service?.name}
          errors={state.form.errors?.name}
          lengthCounter
          maxLength={30}
          onChangeText={(text) => {
            changeHandler('name', text);
          }}
        />
        <Input
          label="Descripción"
          placeholder="Todo tipo de cortes a domicilio"
          value={state.form.service?.description}
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
          path={`stores/${store.id}/services/images/\${}`}
          errors={state.form.errors?.images}
          onChange={(images) => {
            changeHandler('images', images);
          }}
        />
        <View style={{ flexDirection: 'row' }}>
          <InputNumeric
            label="Precio"
            placeholder="$1000"
            value={state.form.service?.price || undefined}
            errors={state.form.errors?.price}
            formatNumber={numberFormatter.toCurrency}
            parseNumber={stringParser.fromCurrency}
            onChangeValue={(price) => {
              changeHandler('price', price);
            }}
            containerStyle={{ flex: 1 }}
          />
          <View style={{ width: 15 }} />
          <Checkbox
            label="Precio a convenir"
            checked={state.form.service?.price === null}
            onChange={(checked) => {
              changeHandler('price', checked ? null : undefined);
            }}
            style={{ alignSelf: 'flex-end', marginBottom: 30 }}
          />
        </View>
        <InputSelectOptions
          label="Categoría"
          placeholder="Seleccione categoría"
          value={state.form.service?.category}
          errors={state.form.errors?.category}
          modalTitle="Selecciona categoría"
          onChange={(key: string) => {
            changeHandler('category', key);
          }}
          options={categories}
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
              {state.form.service?.enabled
                ? 'Presione para desabilitar el servicio'
                : 'Presione para habilitar el servicio'}
            </Text>
          </View>
          <Switch
            value={state.form.service?.enabled}
            onValueChange={(value) => {
              changeHandler('enabled', value);
            }}
          />
        </View>
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
          title="Publicar servicio"
          onPress={publishHadler}
          style={globalStyles.withMainActionAir}
        />
      </View>
      <LoadingOverlay ref={loadingOverlayRef} />
    </Container>
  );
};
