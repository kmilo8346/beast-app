export default {
  name: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
  description: {
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
} as { [key: string]: any };
