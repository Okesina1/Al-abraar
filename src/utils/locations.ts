type Country = { name: string };
export type State = { name: string };

const COUNTRIES_URL = 'https://countriesnow.space/api/v0.1/countries/positions';
const STATES_URL = 'https://countriesnow.space/api/v0.1/countries/states';

let countriesCache: string[] | null = null;
const statesCache = new Map<string, string[]>();

// simple fetch with timeout
async function fetchWithTimeout(input: RequestInfo, init: RequestInit = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export async function fetchCountries(): Promise<string[]> {
  if (countriesCache) return countriesCache;
  try {
    const res = await fetchWithTimeout(COUNTRIES_URL);
    const data = await res.json();
    const list: string[] = (data?.data || []).map((c: any) => c.name).sort();
    countriesCache = list;
    return list;
  } catch (e) {
    console.warn('fetchCountries failed:', e);
    return [];
  }
}

export async function fetchStates(country: string): Promise<string[]> {
  if (!country) return [];
  const cached = statesCache.get(country);
  if (cached) return cached;
  try {
    const res = await fetchWithTimeout(STATES_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country }),
    });
    const data = await res.json();
    const list: string[] = data?.data?.states?.map((s: any) => s.name) || [];
    statesCache.set(country, list);
    return list;
  } catch (e) {
    console.warn('fetchStates failed for', country, e);
    return [];
  }
}
