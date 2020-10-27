class StringParser {
  fromCreditCard(text: string) {
    return text.replace(/ /g, '');
  }

  fromCreditCardExpirationDate(text: string) {
    return text.replace(/\//g, '');
  }

  fromRut(text: string) {
    return text.replace(/-/g, '');
  }

  fromCurrency(text: string): number {
    const t = text?.replace(/[^0-9]/g, '');
    if (!t) return 0;
    return parseInt(t, 10);
  }

  fromPhone(text: string): string {
    return `+56${text.replace(/ /g, '')}`;
  }
}

export default new StringParser();
