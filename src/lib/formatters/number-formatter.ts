const prefix = '[number formatter]';

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
    if (time < 0 || time >= 2400) {
      throw new Error(`${prefix} Invalid argument, time: ${time}`);
    }
    let s_time = `${time}`;
    s_time = s_time.padStart(4, '0');
    let hours = s_time.slice(0, 2);
    const minutes = s_time.slice(2, 4);

    let meridiem_time = 'am';
    if (parseInt(hours, 10) >= 12) {
      hours = `${parseInt(hours, 10) - 12}`;
      meridiem_time = 'pm';
    }
    if (parseInt(hours, 10) === 0) {
      hours = '12';
    }

    return `${hours}:${minutes} ${meridiem_time}`;
  };
}

export default new NumberFormatter();
