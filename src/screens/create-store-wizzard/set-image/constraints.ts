export default {
  images: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    arrayWithValues: {
      message: '^Imagen se está subiendo',
    },
  },
} as { [key: string]: any };
