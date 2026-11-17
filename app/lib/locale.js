const SUPPORTED_LANGUAGES = ['EN', 'FR'];
const DEFAULT_LANGUAGE = 'FR';
const DEFAULT_COUNTRY = 'GB';

export function getLocaleFromRequest(request) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)lang=([a-zA-Z]{2})/);
  const lang = match?.[1]?.toUpperCase();
  const language = SUPPORTED_LANGUAGES.includes(lang)
    ? lang
    : DEFAULT_LANGUAGE;

  const country = (
    request.headers.get('oxygen-buyer-country') || DEFAULT_COUNTRY
  ).toUpperCase();

  return {language, country};
}