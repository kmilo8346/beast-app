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
}

export default new StringParser();
