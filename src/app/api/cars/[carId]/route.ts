import { NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteCar, updateCar } from '@/lib/server/database';
import { apiError } from '@/lib/server/http';

const carSchema = z.object({
  name: z.string().trim().min(1).max(80),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
  carStyle: z.enum(['sedan', 'suv', 'hatchback']),
  plate: z.string().trim().max(30).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ carId: string }> },
) {
  try {
    const car = await updateCar(
      (await params).carId,
      carSchema.parse(await request.json()),
    );
    return car
      ? NextResponse.json(car)
      : NextResponse.json({ error: 'CAR_NOT_FOUND' }, { status: 404 });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ carId: string }> },
) {
  try {
    return (await deleteCar((await params).carId))
      ? NextResponse.json({ deleted: true })
      : NextResponse.json({ error: 'CAR_NOT_FOUND' }, { status: 404 });
  } catch (error) {
    return apiError(error);
  }
}
