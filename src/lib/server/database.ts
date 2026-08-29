import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import type { Car, NewCar, ParkingEvent, ParkingLocation } from '../types';

const globalDatabase = globalThis as typeof globalThis & { carPool?: Pool };
const connectionString = process.env.DATABASE_URL;
const pool = connectionString
  ? (globalDatabase.carPool ??
    new Pool({
      connectionString,
      max: 5,
      connectionTimeoutMillis: 2_500,
    }))
  : undefined;
if (pool && process.env.NODE_ENV !== 'production')
  globalDatabase.carPool = pool;

export class DatabaseUnavailableError extends Error {}
function requirePool() {
  if (!pool) throw new DatabaseUnavailableError('Database is not configured');
  return pool;
}

export async function listCars(): Promise<Car[]> {
  const result = await requirePool()
    .query(`SELECT c.id, c.name, c.color, c.car_style, c.plate,
    COALESCE(json_agg(json_build_object('id', e.id, 'carId', e.car_id, 'memberName', e.member_name, 'parkedAt', e.parked_at, 'location', e.location) ORDER BY e.parked_at DESC) FILTER (WHERE e.id IS NOT NULL), '[]') AS history
    FROM cars c LEFT JOIN parking_events e ON e.car_id = c.id GROUP BY c.id ORDER BY c.created_at`);
  return result.rows.map((row) => {
    const history = row.history as ParkingEvent[];
    return {
      id: row.id,
      name: row.name,
      color: row.color,
      carStyle: row.car_style,
      plate: row.plate ?? undefined,
      parking: history[0],
      history,
    };
  });
}

export async function createCar(input: NewCar): Promise<Car> {
  const result = await requirePool().query(
    'INSERT INTO cars (id, name, color, car_style, plate) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, color, car_style, plate',
    [
      randomUUID(),
      input.name,
      input.color,
      input.carStyle,
      input.plate ?? null,
    ],
  );
  return {
    ...result.rows[0],
    carStyle: result.rows[0].car_style,
    plate: result.rows[0].plate ?? undefined,
    history: [],
  } as Car;
}

export async function updateCar(
  carId: string,
  input: NewCar,
): Promise<Car | undefined> {
  const result = await requirePool().query(
    'UPDATE cars SET name = $2, color = $3, car_style = $4, plate = $5 WHERE id = $1 RETURNING id',
    [carId, input.name, input.color, input.carStyle, input.plate ?? null],
  );
  if (!result.rowCount) return undefined;
  return (await listCars()).find((car) => car.id === carId);
}

export async function deleteCar(carId: string): Promise<boolean> {
  const result = await requirePool().query('DELETE FROM cars WHERE id = $1', [
    carId,
  ]);
  return Boolean(result.rowCount);
}

export async function createParking(
  carId: string,
  memberName: string | null,
  location: ParkingLocation,
): Promise<Car | undefined> {
  const result = await requirePool().query(
    'INSERT INTO parking_events (id, car_id, member_name, location) SELECT $1, id, $3, $4 FROM cars WHERE id = $2 RETURNING id',
    [randomUUID(), carId, memberName, location],
  );
  if (!result.rowCount) return undefined;
  return (await listCars()).find((car) => car.id === carId);
}
