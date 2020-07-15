export default {
  name: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
  price: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    numericality: {
      greaterThan: 0,
      message: '^Precio inválido',
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
  format: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
  category: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
} as { [key: string]: any };
