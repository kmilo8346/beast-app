export default {
  openingHours: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    openingHours: {
      message: '^Horas de cierre deben ser mayor',
    },
  },
} as { [key: string]: any };
