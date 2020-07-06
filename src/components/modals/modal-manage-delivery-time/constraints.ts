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
    greaterThanMin: true,
  },
} as { [key: string]: any };
