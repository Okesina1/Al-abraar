import * as CSC from "country-state-city";

let countriesCache: { name: string; isoCode?: string }[] | null = null;
const statesCache = new Map<string, string[]>();

function getCSCModule() {
  return CSC;
}

export async function fetchCountries(): Promise<string[]> {
  if (countriesCache) return countriesCache.map((c) => c.name);
  const mod = getCSCModule();
  if (
    !mod ||
    !mod.Country ||
    typeof mod.Country.getAllCountries !== "function"
  ) {
    // module missing or unexpected shape
    countriesCache = [];
    return [];
  }
  try {
    const raw: any[] = mod.Country.getAllCountries();
    countriesCache = raw.map((c: any) => ({
      name: c.name,
      isoCode: c.isoCode,
    }));
    return countriesCache.map((c) => c.name).sort((a, b) => a.localeCompare(b));
  } catch (err) {
    console.warn("fetchCountries failed using country-state-city:", err);
    countriesCache = [];
    return [];
  }
}

export async function fetchStates(country: string): Promise<string[]> {
  if (!country) return [];
  const key = country.trim();
  const cached = statesCache.get(key);
  if (cached) return cached;

  // ensure we have country list to map name -> isoCode
  await fetchCountries();
  const matched = countriesCache?.find(
    (c) =>
      c.name.toLowerCase() === key.toLowerCase() ||
      (c.isoCode && c.isoCode.toLowerCase() === key.toLowerCase())
  );
  const mod = getCSCModule();
  if (
    !mod ||
    !mod.State ||
    typeof mod.State.getStatesOfCountry !== "function"
  ) {
    statesCache.set(key, []);
    return [];
  }

  try {
    const iso = matched?.isoCode;
    if (!iso) {
      // try to find by loose match
      const found = countriesCache?.find((c) =>
        c.name.toLowerCase().includes(key.toLowerCase())
      );
      if (found) {
        // use found iso
        const raw = mod.State.getStatesOfCountry(found.isoCode);
        const list = (raw || []).map((s: any) => s.name).filter(Boolean);
        statesCache.set(key, list);
        return list;
      }
      statesCache.set(key, []);
      return [];
    }

    const rawStates: any[] = mod.State.getStatesOfCountry(iso);
    const list = (rawStates || []).map((s) => s.name).filter(Boolean);
    statesCache.set(key, list);
    return list;
  } catch (err) {
    console.warn(
      "fetchStates failed using country-state-city for",
      country,
      err
    );
    statesCache.set(key, []);
    return [];
  }
}
