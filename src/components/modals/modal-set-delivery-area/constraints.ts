export default {
  address: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    fieldsPresence: {
      fields: ['center'],
      message: '^Selecciona una dirección',
    },
  },
} as { [key: string]: any };
