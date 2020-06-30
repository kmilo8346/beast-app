export default {
  address: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    fieldsPresence: {
      fields: ['place'],
      message: '^Seleccion una dirección',
    },
  },
} as { [key: string]: any };
