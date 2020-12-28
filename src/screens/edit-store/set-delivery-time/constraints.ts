export default {
  gte: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    lessThanMax: true,
  },
  lte: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
} as { [key: string]: any };
