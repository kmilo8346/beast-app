export default {
  photo_url: {
    notRequiredString: {
      message: '^Imágen se está subiendo',
    },
  },
  first_name: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
  email: {
    email: {
      message: '^Correo inválido',
    },
    presence: false,
  },
} as { [key: string]: any };
