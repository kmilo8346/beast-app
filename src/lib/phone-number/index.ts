/*import { parsePhoneNumber } from 'libphonenumber-js/core';
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



export const parsePhone = (text:string, prefix: string) => {
  return `${prefix}${text.replace(/ /g, '')}`;
}

export const isValid = (phone: string | undefined):boolean => {
  if(!phone) return false;



  return true;
}*/

class PhoneNumber {
  formatPhone(text: string | undefined): string | undefined {
    if (!text) return undefined;

    const makeSpaceInPos = (text: string, pos: number): string => {
      if (text.length > pos) {
        return [text.slice(0, pos), ' ', text.slice(pos)].join('');
      }
      return text;
    };

    if (/^\+56/.test(text)) {
      let result = text.replace(/^\+56/, '');

      result = makeSpaceInPos(result, 1);
      result = makeSpaceInPos(result, 6);

      return result;
    }

    if (/^\+53/.test(text)) {
      let result = text.replace(/^\+53/, '');
      result = makeSpaceInPos(result, 1);
      return result;
    }

    return '';
  }

  parsePhone(text: string, prefix: string) {
    return `${prefix}${text.replace(/ /g, '')}`;
  }

  isValid(text: string | undefined): boolean {
    if (!text) return false;

    if (/^\+56/.test(text)) {
      return /^\+569[\d]{8}/.test(text);
    }

    if (/^\+53/.test(text)) {
      return /^\+535[\d]{7}/.test(text);
    }

    return true;
  }
}

export default new PhoneNumber();
