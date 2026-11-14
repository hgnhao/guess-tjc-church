/**
 * Semua negara/wilayah yang muncul di field `country` file lokasi.
 * Kunci = nilai `country` persis seperti di JSON.
 * Hong Kong dan Macau diperlakukan sebagai wilayah tersendiri.
 */
export interface CountryInfo {
  /** Nama tampilan dalam Bahasa Indonesia */
  name: string;
  /** Kode ISO 3166-1 alpha-2, dipakai untuk membuat emoji bendera */
  iso: string;
}

export const COUNTRIES: Record<string, CountryInfo> = {
  Argentina: { name: 'Argentina', iso: 'AR' },
  Australia: { name: 'Australia', iso: 'AU' },
  Austria: { name: 'Austria', iso: 'AT' },
  Benin: { name: 'Benin', iso: 'BJ' },
  Bolivia: { name: 'Bolivia', iso: 'BO' },
  Brazil: { name: 'Brasil', iso: 'BR' },
  Brunei: { name: 'Brunei Darussalam', iso: 'BN' },
  Cambodia: { name: 'Kamboja', iso: 'KH' },
  Canada: { name: 'Kanada', iso: 'CA' },
  Chile: { name: 'Cile', iso: 'CL' },
  China: { name: 'Tiongkok', iso: 'CN' },
  'DR Congo': { name: 'Republik Demokratik Kongo', iso: 'CD' },
  'Dominican Republic': { name: 'Republik Dominika', iso: 'DO' },
  Ecuador: { name: 'Ekuador', iso: 'EC' },
  Fiji: { name: 'Fiji', iso: 'FJ' },
  France: { name: 'Prancis', iso: 'FR' },
  Georgia: { name: 'Georgia', iso: 'GE' },
  Germany: { name: 'Jerman', iso: 'DE' },
  Ghana: { name: 'Ghana', iso: 'GH' },
  'Hong Kong': { name: 'Hong Kong', iso: 'HK' },
  Hungary: { name: 'Hungaria', iso: 'HU' },
  India: { name: 'India', iso: 'IN' },
  Indonesia: { name: 'Indonesia', iso: 'ID' },
  Ireland: { name: 'Irlandia', iso: 'IE' },
  Italy: { name: 'Italia', iso: 'IT' },
  Japan: { name: 'Jepang', iso: 'JP' },
  Kenya: { name: 'Kenya', iso: 'KE' },
  Liberia: { name: 'Liberia', iso: 'LR' },
  Macau: { name: 'Makau', iso: 'MO' },
  Malaysia: { name: 'Malaysia', iso: 'MY' },
  Mexico: { name: 'Meksiko', iso: 'MX' },
  Myanmar: { name: 'Myanmar', iso: 'MM' },
  Netherlands: { name: 'Belanda', iso: 'NL' },
  'New Zealand': { name: 'Selandia Baru', iso: 'NZ' },
  Nigeria: { name: 'Nigeria', iso: 'NG' },
  Philippines: { name: 'Filipina', iso: 'PH' },
  Russia: { name: 'Rusia', iso: 'RU' },
  'Sierra Leone': { name: 'Sierra Leone', iso: 'SL' },
  Singapore: { name: 'Singapura', iso: 'SG' },
  'South Africa': { name: 'Afrika Selatan', iso: 'ZA' },
  'South Korea': { name: 'Korea Selatan', iso: 'KR' },
  Spain: { name: 'Spanyol', iso: 'ES' },
  Switzerland: { name: 'Swiss', iso: 'CH' },
  Taiwan: { name: 'Taiwan', iso: 'TW' },
  Tanzania: { name: 'Tanzania', iso: 'TZ' },
  Thailand: { name: 'Thailand', iso: 'TH' },
  Uganda: { name: 'Uganda', iso: 'UG' },
  'United Kingdom': { name: 'Inggris Raya', iso: 'GB' },
  'United States': { name: 'Amerika Serikat', iso: 'US' },
  Vietnam: { name: 'Vietnam', iso: 'VN' },
};

/** "ID" -> 🇮🇩 */
export function isoToFlag(iso: string): string {
  return String.fromCodePoint(...iso.toUpperCase().split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** Nama Indonesia + bendera. Kalau negara tidak dikenal, tetap aman (nama asli + 🌍). */
export function countryDisplay(country: string): { name: string; flag: string } {
  const info = COUNTRIES[country];
  if (!info) return { name: country, flag: '🌍' };
  return { name: info.name, flag: isoToFlag(info.iso) };
}
