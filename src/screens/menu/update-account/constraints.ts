export default {
  firstName: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
  lastName: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
  photoUrl: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    arrayWithValues: {
      message: '^La imagen se está subiendo',
    },
  },
} as { [key: string]: any };
