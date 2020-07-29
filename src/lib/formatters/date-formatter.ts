import dateFormat from 'date-fns/format';
import es from 'date-fns/locale/es';

class DateFormatter {
  format(date: Date | number, format: string): string {
    return dateFormat(date, format, {
      locale: es,
    });
  }
}

export default new DateFormatter();
