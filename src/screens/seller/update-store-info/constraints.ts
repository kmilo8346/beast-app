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
