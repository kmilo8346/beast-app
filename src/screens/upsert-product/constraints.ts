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
  price: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    numericality: {
      greaterThanOrEqualTo: 100,
      lessThanOrEqualTo: 3000000,
      notGreaterThanOrEqualTo: '^Debe ser mayor o igual a 100',
      notLessThanOrEqualTo: '^Debe ser menor o igual que 3 000 000',
    },
  },
} as { [key: string]: any };
