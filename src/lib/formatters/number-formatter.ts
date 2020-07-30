class NumberFormatter {
  toCurrency(value: number | undefined): string {
    if (!value) {
      return '';
    }
    const formatted = value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&.');
    return `$${formatted.substring(0, formatted.length - 3)}`;
  }

  /**
   *
   * @param distance distance in km
   */
  humanizeDistance(distance: number): string {
    if (distance < 1) {
      return `${(Math.round(distance * 100) / 100) * 1000} mts`;
    }

    return `${Math.round(distance * 10) / 10} kms`;
  }
}

export default new NumberFormatter();
