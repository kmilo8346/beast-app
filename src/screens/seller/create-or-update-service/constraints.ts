export default {
  name: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
  description: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
  images: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    arrayWithValues: {
      message: '^Imágenes se están subiendo',
    },
  },
  price: {
    servicePrice: {
      message: '^Defina el precio o marque a convenir',
    },
  },
} as { [key: string]: any };
