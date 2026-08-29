export type ParkingLocation =
  | { type: 'gps'; latitude: number; longitude: number; accuracy?: number }
  | { type: 'manual'; text: string };

export type ParkingEvent = {
  id: string;
  carId: string;
  memberName: string | null;
  parkedAt: string;
  location: ParkingLocation;
};

export type CarStyle = 'sedan' | 'suv' | 'hatchback';

export type Car = {
  id: string;
  name: string;
  color: string;
  carStyle: CarStyle;
  plate?: string;
  parking?: ParkingEvent;
  history: ParkingEvent[];
};

export type NewCar = Pick<Car, 'name' | 'color' | 'carStyle' | 'plate'>;
