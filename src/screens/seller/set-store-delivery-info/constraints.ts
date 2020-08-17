export default {
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
