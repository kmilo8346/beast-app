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
      return `Entre ${gteValue} y ${lteValue} ${gteType}`;
    }
    return `Entre ${rowGte} y ${rowLte}`;
  };

  /**
   * Calculate the duration to finish
   * if duration <= threshold return threshold
   * @param start Date
   * @param maxDuration number in minutes
   * @param threshold number in minutes
   * @returns duration string
   */
  humanizeDurationToFinish(
    start: Date,
    maxDuration: number,
    threshold: number
  ): string {
    const duration = Math.round(
      maxDuration -
        (new Date().getTime() - new Date(start).getTime()) / 1000 / 60
    );
    return duration <= threshold
      ? `menos de ${this.humanizeDuration(threshold)}`
      : this.humanizeDuration(duration);
  }
}

export default new DurationFormatter();
