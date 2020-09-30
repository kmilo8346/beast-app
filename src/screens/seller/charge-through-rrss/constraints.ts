export default {
  price: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    numericality: {
      greaterThanOrEqualTo: 1000,
      lessThanOrEqualTo: 3000000,
      notGreaterThanOrEqualTo: '^Debe ser mayor o igual a 1000',
      notLessThanOrEqualTo: '^Debe ser menor o igual que 3 000 000',
    },
  },
  name: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
} as { [key: string]: any };
