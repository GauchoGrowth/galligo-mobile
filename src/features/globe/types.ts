export type CountryGlobeStatus =
  | 'home'
  | 'lived'
  | 'visited'
  | 'wishlist'
  | 'friends-only'
  | 'unseen';

export interface CountryGlobeData {
  iso3: string;
  iso2: string;
  name: string;
  status: CountryGlobeStatus;
  tripCount: number;
  placeCount: number;
  friendCount: number;
  lastVisitedAt?: string;
}
