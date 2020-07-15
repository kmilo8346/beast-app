/* eslint-disable class-methods-use-this */

class NumberFormatter {
  toCurrency(value: number | undefined): string {
    if (!value) {
      return '';
    }
    const formatted = value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&.');
    return `$${formatted.substring(0, formatted.length - 3)}`;
  }
}

export default new NumberFormatter();
