export default {
  center: {
    presence: {
      allowEmpty: false,
      message: '^Seleccione una dirección con calle y número',
    },
  },
  radius: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
} as { [key: string]: any };
