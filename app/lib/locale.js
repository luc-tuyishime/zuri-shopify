const SUPPORTED_LANGUAGES = ['EN', 'FR'];
const DEFAULT_LANGUAGE = 'EN';
const DEFAULT_COUNTRY = 'US';

export function getLocaleFromRequest(request) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)lang=([a-zA-Z]{2})/);
  const lang = match?.[1]?.toUpperCase();
  const language = SUPPORTED_LANGUAGES.includes(lang)
    ? lang
    : DEFAULT_LANGUAGE;

    let country = (request.headers.get('oxygen-buyer-country') || DEFAULT_COUNTRY).toUpperCase();
    if (import.meta.env?.DEV) {
      const override = new URL(request.url).searchParams.get('country');
      if (override) country = override.toUpperCase();
    }

  return {language, country};
}