export default {
  first_name: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
} as { [key: string]: any };
