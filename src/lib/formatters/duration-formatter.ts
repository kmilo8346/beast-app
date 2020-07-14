/* eslint-disable prefer-destructuring */
class DurationFormatter {
  /**
   * Humanize duration value to eloquent duration measurement
   * @param duration
   * @return string
   */
  humanizeDuration = (duration: number): string => {
    let message = '';
    // value less than 60 -> minutes
    if (duration < 60) {
      message = `${duration} minutos`;
    }
    // value equal or greater than 60 -> hour/s
    if (duration >= 60) {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      // hours and minutes
      if (minutes > 0) {
        const min = minutes < 10 ? `0${minutes}` : minutes;
        message = `${hours}:${min} horas`;
      } else {
        message = hours === 1 ? '1 hora' : `${hours} horas`;
      }
    }
    return message;
  };

  /**
   * Humanize Duration Rage to eloquent text message
   * @param min
   * @param max
   * @return string
   */
  humanizeDurationRange = (gte: number, lte: number): string => {
    const rowGte = this.humanizeDuration(gte);
    const rowLte = this.humanizeDuration(lte);
    const gteValue = rowGte.split(' ')[0];
    const lteValue = rowLte.split(' ')[0];
    const gteType = rowGte.split(' ')[1];
    const lteType = rowLte.split(' ')[1];

    if (lteType.charAt(0) === gteType.charAt(0)) {
      return `Entregas entre ${gteValue} y ${lteValue} ${gteType}`;
    }
    return `Entregas entre ${rowGte} y ${rowLte}`;
  };
}

export default new DurationFormatter();
