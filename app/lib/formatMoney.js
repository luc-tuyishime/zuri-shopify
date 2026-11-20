export function formatMoney({amount, currencyCode}, language = 'en', country = 'US') {
    const value = parseFloat(amount);
    try {
      return new Intl.NumberFormat(`${language}-${country}`, {
        style: 'currency',
        currency: currencyCode,
      }).format(value);
    } catch {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
      }).format(value);
    }
  }