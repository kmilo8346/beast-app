export default {
  lte: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
  gte: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
} as { [key: string]: any };
