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
