export default {
  images: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    arrayWithValues: {
      message: '^Imagen se esta subiendo',
    },
  },
} as { [key: string]: any };
