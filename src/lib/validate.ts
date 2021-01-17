import validate from 'validate.js';

import { OpeningHours } from '../types';

validate.validators.fieldsPresence = (
  _value: any,
  options: any,
  _key: any,
  attributes: { [key: string]: any }
) => {
  if (
    options.fields.every(
      (field: string) => field in attributes && !!attributes[field]
    )
  ) {
    return null;
  }
  return options.message;
};

validate.validators.openingHours = (
  value: OpeningHours,
  options: {
    message: string;
  }
) => {
  if (value) {
    let ok = true;

    value.forEach((dayHours) => {
      if (dayHours.open === 0 && dayHours.close === 0) {
        return;
      }
      if (dayHours.open >= dayHours.close) {
        ok = false;
      }
    });

    if (ok) {
      return null;
    }
  }

  return options.message;
};

validate.validators.arrayWithValues = (
  value: any[],
  options: {
    message: string;
  }
) => {
  if (value && Array.isArray(value) && value.every((v) => !!v)) {
    return null;
  }

  return options.message;
};

validate.validators.notRequiredString = (
  value: string,
  options: {
    message: string;
  }
) => {
  if (
    value === null ||
    typeof value === 'undefined' ||
    (typeof value === 'string' && value.length > 0)
  ) {
    return null;
  }

  return options.message;
};

validate.validators.lessThanMax = (
  _value: any,
  _options: any,
  _key: any,
  attributes: { [key: string]: any }
) => {
  if (parseInt(attributes.gte, 10) < parseInt(attributes.lte, 10)) {
    return null;
  }
  return '^Debe ser menor que el máximo';
};

validate.validators.phone = (
  value: string,
  options: {
    message: string;
  }
) => {
  if (value) {
    // chile
    if (/^\+56/.test(value)) {
      if (/^\+569[\d]{8}$/.test(value)) {
        return null;
      }
    }
    // cuba
    else if (/^\+53/.test(value)) {
      if (/^\+535[\d]{7}$/.test(value)) {
        return null;
      }
    }
    // TODO: add more validations
    else if (value.length > 7) {
      return null;
    }
  }

  return options.message;
};

export default validate;
