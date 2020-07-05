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
      fields: ['imageUrl'],
      message: '^Imagen aún no se ha subido a la nube',
    },
  },
} as { [key: string]: any };
