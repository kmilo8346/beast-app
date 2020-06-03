class NumberFormatter {
	toCurrency(value: number) {
		if (!value) {
			return "$0";
		}
		const formatted = value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&.");
		return "$" + formatted.substring(0, formatted.length - 3);
	}
}

export default new NumberFormatter();
