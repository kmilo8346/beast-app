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
    notLessThanOrEqualToMin: true,
  },
} as { [key: string]: any };
