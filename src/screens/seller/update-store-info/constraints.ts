export default {
  name: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
  images: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    arrayWithValues: {
      message: '^La imagen se está subiendo',
    },
  },
  deliveryArea: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
  deliveryTime: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
  openingHours: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
} as { [key: string]: any };
