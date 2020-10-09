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

  humanizeTime = (time: number): string => {
    const t = `${time}`.slice(0, 4);
    const hour = t.length > 3 ? t.slice(0, 2) : t.slice(0, 1);
    const minutes = t.slice(-2);
    const newHour = `${
      Number(hour) > 12 ? Number(hour) - 12 : hour
    }:${minutes}`;
    const timeOfTheDay = Number(hour) >= 12 ? 'pm' : 'am';

    return `${newHour} ${timeOfTheDay}`;
  };
}

export default new NumberFormatter();
