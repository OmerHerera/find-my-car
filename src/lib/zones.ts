import type { Locale } from './translations';

export type GeoPoint = { lat: number; lng: number };
type LocalizedMessage = Record<Locale, string>;

export type Zone =
  | {
      id: string;
      shape: 'circle';
      center: GeoPoint;
      radiusMeters: number;
      message: LocalizedMessage;
    }
  | {
      id: string;
      shape: 'polygon';
      points: GeoPoint[];
      message: LocalizedMessage;
    };

// Configure parking-area geofences here. To find coordinates: right-click a spot on
// Google Maps to copy its lat/lng, or draw shapes visually on geojson.io and copy the
// values. Zones are matched in order, so list more specific/smaller areas first.
export const zones: Zone[] = [
  {
    id: 'entrance',
    shape: 'polygon',
    points: [
      { lat: 32.1603124, lng: 34.8911047 },
      { lat: 32.1603098, lng: 34.8910817 },
      { lat: 32.1599112, lng: 34.8911002 },
      { lat: 32.1599107, lng: 34.8913666 },
      { lat: 32.1603119, lng: 34.89133 },
    ],
    message: {
      en: 'Parked near the entrance',
      he: 'בכניסה לרחוב',
    },
  },
  {
    id: 'left-side',
    shape: 'polygon',
    points: [
      { lat: 32.1599849, lng: 34.8910971 },
      { lat: 32.1600338, lng: 34.8903796 },
      { lat: 32.159809, lng: 34.8903721 },
      { lat: 32.1597558, lng: 34.8911038 },
    ],
    message: {
      en: 'Parked on the left side',
      he: 'בשמאל',
    },
  },
  {
    id: 'right-side',
    shape: 'polygon',
    points: [
      { lat: 32.1600077, lng: 34.8913555 },
      { lat: 32.1597628, lng: 34.8913768 },
      { lat: 32.159784, lng: 34.8920847 },
      { lat: 32.1600276, lng: 34.8920689 },
    ],
    message: {
      en: 'Parked on the right side',
      he: 'בימין',
    },
  },
];
