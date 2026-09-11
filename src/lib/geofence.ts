import type { Locale } from './translations';
import type { GeoPoint, Zone } from './zones';
import { zones } from './zones';

const EARTH_RADIUS_METERS = 6_371_000;

export function haversineMeters(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

// Ray-casting; assumes a simple (non-self-intersecting) polygon ring.
export function pointInPolygon(point: GeoPoint, polygon: GeoPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    const intersects =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function isInsideZone(point: GeoPoint, zone: Zone): boolean {
  return zone.shape === 'circle'
    ? haversineMeters(point, zone.center) <= zone.radiusMeters
    : pointInPolygon(point, zone.points);
}

export function findZoneId(
  latitude: number,
  longitude: number,
): string | undefined {
  const point: GeoPoint = { lat: latitude, lng: longitude };
  return zones.find((zone) => isInsideZone(point, zone))?.id;
}

export function zoneMessage(
  zoneId: string | undefined,
  locale: Locale,
): string | undefined {
  if (!zoneId) return undefined;
  return zones.find((zone) => zone.id === zoneId)?.message[locale];
}
