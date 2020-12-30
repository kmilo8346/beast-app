import validate from 'validate.js';

import { OpeningHours } from '../types';
import * as phoneNumber from './phone-number';

// extending validate validators
validate.validators.cardExpirationDate = (
  value: string,
  options: {
    message: string;
  }
) => {
  if (value.length === 4) {
    const month = parseInt(value.substr(0, 2), 10);
    const year = parseInt(value.substr(-2), 10);
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = parseInt(
      new Date().getFullYear().toString().substr(-2),
      10
    );
    if (year > currentYear) {
      return null;
    }
    if (year === currentYear && month >= currentMonth) {
      return null;
    }
  }

  return options.message;
};

/**
 * Rut validator
 * @site https://github.com/jlobos/rut.js/blob/master/index.js
 * @param value
 * @param options
 */
validate.validators.rut = (
  value: string,
  options: {
    message: string;
  }
) => {
  if (value) {
    let rut = value;
    if (/^0*(\d{1,3}(\.?\d{3})*)-?([\dkK])$/.test(rut)) {
      rut = value.replace(/^0+|[^0-9kK]+/g, '').toUpperCase();
      let t = parseInt(rut.slice(0, -1), 10);
      let m = 0;
      let s = 1;

      while (t > 0) {
        // eslint-disable-next-line no-plusplus
        s = (s + (t % 10) * (9 - (m++ % 6))) % 11;
        t = Math.floor(t / 10);
      }

      const v = s > 0 ? `${s - 1}` : 'K';
      if (v === rut.slice(-1)) {
        return null;
      }
    }
  }

  return options.message;
};

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
    typeof value === 'undefined' ||
    (typeof value === 'string' && value.length > 0)
  ) {
    return null;
  }

  return options.message;
};

validate.validators.phone = (
  value: string,
  options: {
    message: string;
  }
) => {
  if (phoneNumber.isValid(value)) {
    return null;
  }

  return options.message;
};

export default validate;
