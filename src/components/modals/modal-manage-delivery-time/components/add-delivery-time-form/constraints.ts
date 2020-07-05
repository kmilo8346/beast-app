export default {
  deliveryFom: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
  deliveryTo: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
} as { [key: string]: any };
