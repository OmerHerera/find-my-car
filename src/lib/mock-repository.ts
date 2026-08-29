import type { Car, NewCar, ParkingEvent, ParkingLocation } from './types';

const storageKey = 'find-my-car/cars';
const now = Date.now();
export const seedCars: Car[] = [
  {
    id: 'blue-family-car',
    name: 'Blue car',
    color: '#159bf3',
    carStyle: 'sedan',
    plate: '42-718-63',
    parking: {
      id: 'parking-1',
      carId: 'blue-family-car',
      memberName: 'Daniel',
      parkedAt: new Date(now - 22 * 60_000).toISOString(),
      location: {
        type: 'gps',
        latitude: 32.0809,
        longitude: 34.7806,
        accuracy: 12,
      },
    },
    history: [],
  },
  {
    id: 'white-family-car',
    name: 'White car',
    color: '#e7edf4',
    carStyle: 'suv',
    plate: '18-305-22',
    parking: {
      id: 'parking-2',
      carId: 'white-family-car',
      memberName: 'Maya',
      parkedAt: new Date(now - 3 * 60 * 60_000).toISOString(),
      location: {
        type: 'manual',
        text: 'Behind the building, near the red gate',
      },
    },
    history: [],
  },
  {
    id: 'green-family-car',
    name: 'Green car',
    color: '#50c99a',
    carStyle: 'hatchback',
    plate: '73-904-11',
    history: [],
  },
];
seedCars[0].history = [seedCars[0].parking!];
seedCars[1].history = [seedCars[1].parking!];

const cloneSeed = () => structuredClone(seedCars);
export function loadCars(): Car[] {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored
      ? (JSON.parse(stored) as Car[]).map((car) => ({
          ...car,
          carStyle: car.carStyle ?? 'sedan',
        }))
      : cloneSeed();
  } catch {
    return cloneSeed();
  }
}
function saveCars(cars: Car[]) {
  localStorage.setItem(storageKey, JSON.stringify(cars));
}
export function addCar(cars: Car[], input: NewCar) {
  const car: Car = { ...input, id: crypto.randomUUID(), history: [] };
  const next = [...cars, car];
  saveCars(next);
  return next;
}
export function updateCar(cars: Car[], carId: string, input: NewCar) {
  const next = cars.map((car) =>
    car.id === carId ? { ...car, ...input } : car,
  );
  saveCars(next);
  return next;
}
export function removeCar(cars: Car[], carId: string) {
  const next = cars.filter((car) => car.id !== carId);
  saveCars(next);
  return next;
}
export function parkCar(
  cars: Car[],
  carId: string,
  location: ParkingLocation,
  memberName: string | null,
) {
  const event: ParkingEvent = {
    id: crypto.randomUUID(),
    carId,
    memberName,
    parkedAt: new Date().toISOString(),
    location,
  };
  const next = cars.map((car) =>
    car.id === carId
      ? { ...car, parking: event, history: [event, ...car.history] }
      : car,
  );
  saveCars(next);
  return next;
}
