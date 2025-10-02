import { COUNTRIES } from './data/countries';
import { STATES_MAP } from './data/states';

export type State = { name: string };

let countriesCache: string[] | null = null;
const statesCache = new Map<string, string[]>();

function normalizeCountryKey(country: string) {
  if (!country) return country;
  return country.trim();
}

export async function fetchCountries(): Promise<string[]> {
  if (countriesCache) return countriesCache;
  // clone and sort to keep deterministic order
  const list = [...COUNTRIES].sort((a, b) => a.localeCompare(b));
  countriesCache = list;
  return list;
}

export async function fetchStates(country: string): Promise<string[]> {
  if (!country) return [];
  const key = normalizeCountryKey(country);
  const cached = statesCache.get(key);
  if (cached) return cached;
  // direct lookup
  const direct = STATES_MAP[key];
  if (direct) {
    statesCache.set(key, direct);
    return direct;
  }
  // try some fuzzy matches
  const lc = key.toLowerCase();
  for (const mapKey of Object.keys(STATES_MAP)) {
    if (mapKey.toLowerCase() === lc) {
      statesCache.set(key, STATES_MAP[mapKey]);
      return STATES_MAP[mapKey];
    }
  }
  // special cases
  if (lc === 'united states' || lc === 'united states of america' || lc === 'usa') {
    const us = STATES_MAP['United States of America'];
    statesCache.set(key, us);
    return us;
  }
  // not available locally
  statesCache.set(key, []);
  return [];
}
