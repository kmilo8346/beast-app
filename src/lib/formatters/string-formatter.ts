/* eslint-disable prefer-destructuring */
const prefix = '[string formatter]';

class StringFormatter {
  /**
   * Format text as credit card
   * @link https://www.peterbe.com/plog/cc-formatter
   * @param text
   * @return string
   */
  toCreditCard(text: string | undefined) {
    if (!text) {
      return text;
    }
    const v = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    }
    return text;
  }

  /**
   * Format text as credit card expiration date
   * @param text
   * @return string
   */
  toCreditCardExpirationDate(text: string | undefined) {
    if (!text) return text;

    let formatted = '';

    switch (text.length) {
      case 1:
        formatted = text;
        if (text !== '0' && text !== '1') {
          formatted = `0${formatted}`;
        }
        break;
      case 2:
        formatted = text;
        if (
          (text[0] === '0' && text[1] === '0') ||
          (text[0] === '1' && parseInt(text, 10) > 12)
        ) {
          formatted = text[0];
        }
        break;
      default:
        formatted = `${text.substring(0, 2)}/${text.substring(2)}`;
        if (parseInt(text.substring(0, 2), 10) > 12) {
          formatted = `12/${text.substring(2)}`;
        }
        break;
    }

    return formatted;
  }

  toRut(text: string | undefined) {
    if (!text || text.length <= 7) return text;

    return `${text.slice(0, text.length - 1)}-${text.slice(text.length - 1)}`;
  }

  toNumber(text: string | undefined) {
    return text?.replace(/[^0-9]/g, '');
  }

  toHours(text: string | undefined) {
    if (!text) return text;
    const hours = text.split(':')[0];
    const minutes = text.split(':')[1];

    const formattedHour =
      parseInt(hours, 10) > 10 ? hours : `0${parseInt(hours, 10)}`;
    const formattedMinute =
      parseInt(minutes, 10) > 10 ? minutes : `0${parseInt(minutes, 10)}`;

    return `${formattedHour}:${formattedMinute}`;
  }

  toPhone(
    text: string | undefined,
    options = { prefix: false }
  ): string | undefined {
    if (!text) return undefined;

    let result = text;
    result = result.replace(/^\+56/, '');

    // space 1
    if (result.length > 1)
      result = [result.slice(0, 1), ' ', result.slice(1)].join('');

    // space 2
    if (result.length > 6)
      result = [result.slice(0, 6), ' ', result.slice(6)].join('');

    if (options && options.prefix) {
      result = `+56 ${result}`;
    }
    return result;
  }

  /**
   * Format numeric string day as week day
   * @param day string ex: from monday to sunday "1"|"2","3","4","5","6","7"
   */
  toWeekDay(day: string, options = { capitalize: false }): string {
    let text = '';
    switch (day) {
      case '1':
        text = 'lunes';
        break;
      case '2':
        text = 'martes';
        break;
      case '3':
        text = 'miércoles';
        break;
      case '4':
        text = 'jueves';
        break;
      case '5':
        text = 'viernes';
        break;
      case '6':
        text = 'sábado';
        break;
      case '7':
        text = 'domingo';
        break;
      default:
        throw new Error(`${prefix} Invalid param day: ${day}`);
    }
    if (options.capitalize) {
      text = text.charAt(0).toUpperCase() + text.slice(1);
    }
    return text;
  }
}

export default new StringFormatter();
