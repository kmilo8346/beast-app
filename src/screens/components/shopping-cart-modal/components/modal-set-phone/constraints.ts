export default {
  phone: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    format: {
      pattern: /^\+569\d{8}$/,
      message: '^Número de teléfono inválido',
    },
  },
} as { [key: string]: any };
