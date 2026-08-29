import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createCar, listCars } from '@/lib/server/database';
import { apiError } from '@/lib/server/http';

const carSchema = z.object({
  name: z.string().trim().min(1).max(80),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
  carStyle: z.enum(['sedan', 'suv', 'hatchback']),
  plate: z.string().trim().max(30).optional(),
});
export async function GET() {
  try {
    return NextResponse.json(await listCars());
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(request: Request) {
  try {
    return NextResponse.json(
      await createCar(carSchema.parse(await request.json())),
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}
