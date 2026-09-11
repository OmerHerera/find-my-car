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
      { lat: 32.1603166, lng: 34.8911792 },
      { lat: 32.1599004, lng: 34.8912121 },
      { lat: 32.1599034, lng: 34.8912739 },
      { lat: 32.1603165, lng: 34.8912425 },
    ],
    message: {
      en: 'Parked near the entrance',
      he: 'חניתי ליד הכניסה',
    },
  },
  {
    id: 'left-side',
    shape: 'polygon',
    points: [
      { lat: 32.1599004, lng: 34.8912121 },
      { lat: 32.1599603, lng: 34.8904843 },
      { lat: 32.1598972, lng: 34.8904857 },
      { lat: 32.159857, lng: 34.8912201 },
    ],
    message: {
      en: 'Parked on the left side',
      he: 'חניתי בצד שמאל',
    },
  },
  {
    id: 'right-side',
    shape: 'polygon',
    points: [
      { lat: 32.1599034, lng: 34.8912739 },
      { lat: 32.1598591, lng: 34.8912736 },
      { lat: 32.1598736, lng: 34.8919787 },
      { lat: 32.1599256, lng: 34.8919802 },
    ],
    message: {
      en: 'Parked on the right side',
      he: 'חניתי בצד ימין',
    },
  },
];
