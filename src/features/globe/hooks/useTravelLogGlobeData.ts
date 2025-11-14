import { useMemo } from 'react';
import { usePlaces, useTrips, useHomes } from '@/lib/api-hooks';
import {
  getTripsByCountry,
  getHomesByCountry,
  normalizeCountryCode,
} from '@/lib/travel-data-utils';
import { getISOFromCountryName } from '@/lib/maps/isoCodeMapping';
import { getCountryCode } from '@/utils/countryUtils';
import type { CountryGlobeData, CountryGlobeStatus } from '../types';

const ISO2_TO_ISO3_OVERRIDES: Record<string, string> = {
  us: 'USA',
  ca: 'CAN',
  gb: 'GBR',
  fr: 'FRA',
  de: 'DEU',
  es: 'ESP',
  it: 'ITA',
  br: 'BRA',
  ar: 'ARG',
  mx: 'MEX',
  au: 'AUS',
  jp: 'JPN',
  cn: 'CHN',
  in: 'IND',
  za: 'ZAF',
  kr: 'KOR',
  ru: 'RUS',
  tr: 'TUR',
  eg: 'EGY',
};

function toIsoCodes(countryName: string): { iso2: string; iso3: string } | null {
  const iso2 =
    (normalizeCountryCode(countryName) || getISOFromCountryName(countryName) || getCountryCode(countryName))?.toLowerCase();
  if (!iso2) return null;
  const iso3 = ISO2_TO_ISO3_OVERRIDES[iso2] || iso2.toUpperCase();
  return { iso2: iso2.toUpperCase(), iso3 };
}

function buildStatus(homeCount: number, tripCount: number): CountryGlobeStatus {
  if (homeCount > 0) {
    return 'home';
  }
  if (tripCount > 0) {
    return 'visited';
  }
  return 'unseen';
}

export function useTravelLogGlobeData(): {
  countriesByIso3: Record<string, CountryGlobeData>;
  isLoading: boolean;
  error?: unknown;
} {
  const {
    data: places = [],
    isLoading: placesLoading,
    error: placesError,
  } = usePlaces();
  const {
    data: trips = [],
    isLoading: tripsLoading,
    error: tripsError,
  } = useTrips();
  const {
    data: homes = [],
    isLoading: homesLoading,
    error: homesError,
  } = useHomes();

  const countriesByIso3 = useMemo(() => {
    const tripsByCountry = getTripsByCountry(trips);
    const homesByCountry = getHomesByCountry(homes);

    const record: Record<string, CountryGlobeData> = {};

    const addCountry = (countryName: string | null | undefined) => {
      if (!countryName) return;
      const codes = toIsoCodes(countryName);
      if (!codes) return;
      if (!record[codes.iso3]) {
        record[codes.iso3] = {
          iso3: codes.iso3,
          iso2: codes.iso2,
          name: countryName,
          status: 'unseen',
          tripCount: 0,
          placeCount: 0,
          friendCount: 0,
        };
      }
      record[codes.iso3].name = countryName;
    };

    trips.forEach(trip => addCountry(trip.country));
    homes.forEach(home => addCountry(home.country));
    places.forEach(place => addCountry(place.country));

    Object.values(record).forEach(countryData => {
      const isoKey = countryData.iso2.toLowerCase();
      const tripsCount = tripsByCountry.get(isoKey) || 0;
      const homesCount = homesByCountry.get(isoKey) || 0;
      countryData.tripCount = tripsCount;
      countryData.placeCount = places.filter(p => {
        const codes = toIsoCodes(p.country);
        return codes?.iso2 === countryData.iso2;
      }).length;
      countryData.status = buildStatus(homesCount, tripsCount);
    });

    return record;
  }, [homes, places, trips]);

  return {
    countriesByIso3,
    isLoading: placesLoading || tripsLoading || homesLoading,
    error: placesError || tripsError || homesError,
  };
}
