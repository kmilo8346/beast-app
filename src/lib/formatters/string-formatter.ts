class StringFormatter {
  /**
   * Format text as credit card
   * @link https://www.peterbe.com/plog/cc-formatter
   * @param text
   * @return string
   */
  toCreditCard(text: string) {
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
   * @link https://stackoverflow.com/questions/45259196/javascript-regex-credit-card-expiry-date-auto-format
   * @param text
   * @return string
   */
  toCreditCardExpirationDate(text: string) {
    if (!text) return text;
    return text
      .replace(
        /^([1-9]\/|[2-9])$/g,
        '0$1/' // 3 > 03/
      )
      .replace(
        /^(0[1-9]|1[0-2])$/g,
        '$1/' // 11 > 11/
      )
      .replace(
        /^1([3-9])$/g,
        '01/$1' // 13 > 01/3 //UPDATED by NAVNEET
        // ).replace(
        //   /^(0?[1-9]|1[0-2])([0-9]{2})$/g, '$1/$2' // 141 > 01/41
      )
      .replace(
        /^0\/|0+$/g,
        '0' // 0/ > 0 and 00 > 0 //UPDATED by NAVNEET
      )
      .replace(
        /[^\d|^\/]*/g,
        '' // To allow only digits and `/` //UPDATED by NAVNEET
      )
      .replace(
        /\/\//g,
        '/' // Prevent entering more than 1 `/`
      );
  }
}

export default new StringFormatter();
