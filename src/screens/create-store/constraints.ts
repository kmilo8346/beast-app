export default {
  images: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    arrayWithValues: {
      message: '^Imágenes se están subiendo',
    },
  },
  name: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
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
  delivery_area: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
  delivery_time: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
  opening_hours: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
} as { [key: string]: any };
