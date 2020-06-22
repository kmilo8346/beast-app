export default {
  cardNumber: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    paymentMethodIdPresence: true,
  },
  expirationDate: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    cardExpirationDate: {
      message: '^Fecha incorrecta',
    },
  },
  securityCode: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
  cardHolderName: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
  },
  docNumber: {
    presence: {
      allowEmpty: false,
      message: '^Es requerido',
    },
    rut: {
      message: '^Rut incorrecto',
    },
  },
} as { [key: string]: any };
