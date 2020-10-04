export default {
  name: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    length: {
      maximum: 30,
      tooLong: '^No debe exceder los %{count} caracteres',
    },
  },
  phone: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    format: {
      pattern: /^\+569\d{8}$/,
      message: '^Número de teléfono inválido',
    },
  },
  images: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    arrayWithValues: {
      message: '^Imágenes se están subiendo',
    },
  },
} as { [key: string]: any };
