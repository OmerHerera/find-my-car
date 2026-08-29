import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Find My Car',
    short_name: 'My Car',
    description: 'Keep track of where your family cars are parked.',
    start_url: '/',
    display: 'standalone',
    background_color: '#030a10',
    theme_color: '#061b2b',
    orientation: 'any',
  };
}
