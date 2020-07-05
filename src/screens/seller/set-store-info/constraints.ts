export default {
  name: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
  image: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    fieldsPresence: {
      fields: ['imageBase64'],
      message: '^Imagen incorrecta, agregue otra',
    },
  },
} as { [key: string]: any };
