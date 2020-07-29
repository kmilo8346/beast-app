export default {
  address: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    fieldsPresence: {
      fields: ['address'],
      message: '^Seleccion una dirección válida',
    },
  },
} as { [key: string]: any };
