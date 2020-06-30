export default {
  email: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    email: {
      message: '^Email es incorrecto',
    },
  },
} as { [key: string]: any };
