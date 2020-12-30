export default {
  phone: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    phone: {
      message: '^Número de teléfono inválido',
    },
  },
} as { [key: string]: any };
