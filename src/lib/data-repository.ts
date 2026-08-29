import {
  addCar as addMockCar,
  loadCars as loadMockCars,
  parkCar as parkMockCar,
  removeCar as removeMockCar,
  updateCar as updateMockCar,
} from './mock-repository';
import type { Car, NewCar, ParkingLocation } from './types';

export const apiMode = process.env.NEXT_PUBLIC_DATA_MODE === 'api';
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) throw new Error('Backend unavailable');
  return response.json() as Promise<T>;
}
export async function loadData(): Promise<{
  cars: Car[];
  backendUnavailable: boolean;
}> {
  if (!apiMode) return { cars: loadMockCars(), backendUnavailable: false };
  try {
    return {
      cars: await request<Car[]>('/api/cars'),
      backendUnavailable: false,
    };
  } catch {
    return { cars: loadMockCars(), backendUnavailable: true };
  }
}
export async function addData(cars: Car[], input: NewCar) {
  if (!apiMode) return addMockCar(cars, input);
  const car = await request<Car>('/api/cars', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return [...cars, car];
}
export async function updateData(cars: Car[], carId: string, input: NewCar) {
  if (!apiMode) return updateMockCar(cars, carId, input);
  const car = await request<Car>(`/api/cars/${carId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return cars.map((current) => (current.id === car.id ? car : current));
}
export async function removeData(cars: Car[], carId: string) {
  if (!apiMode) return removeMockCar(cars, carId);
  await request<{ deleted: true }>(`/api/cars/${carId}`, { method: 'DELETE' });
  return cars.filter((car) => car.id !== carId);
}
export async function parkData(
  cars: Car[],
  carId: string,
  location: ParkingLocation,
  memberName: string | null,
) {
  if (!apiMode) return parkMockCar(cars, carId, location, memberName);
  const car = await request<Car>(`/api/cars/${carId}/parking`, {
    method: 'POST',
    body: JSON.stringify({ memberName, location }),
  });
  return cars.map((current) => (current.id === car.id ? car : current));
}
