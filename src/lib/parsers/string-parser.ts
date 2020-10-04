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
    if (!text) return 0;
    return parseInt(text?.replace(/[^0-9]/g, ''), 10);
  }

  fromPhone(text: string): string {
    return `+56${text.replace(/ /g, '')}`;
  }
}

export default new StringParser();
