import { parsePhoneNumber } from 'libphonenumber-js/core';
import metadatePhone from '../../lib/phone-number/metadata.custom.json';

export const parsePhone = (phone: string) =>
  parsePhoneNumber(phone, metadatePhone as any);

export const isValid = (phone: string) => {
  let isValid = false;
  try {
    isValid = parsePhone(phone).isValid();
  } catch (error) {
    isValid = false;
  }
  return isValid;
};
