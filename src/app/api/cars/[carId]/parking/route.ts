import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createParking } from '@/lib/server/database';
import { apiError } from '@/lib/server/http';

const location = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('gps'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().nonnegative().optional(),
  }),
  z.object({
    type: z.literal('manual'),
    text: z.string().trim().min(1).max(300),
  }),
]);
const input = z.object({
  memberName: z.string().trim().min(1).max(80).nullable(),
  location,
});
export async function POST(
  request: Request,
  { params }: { params: Promise<{ carId: string }> },
) {
  try {
    const values = input.parse(await request.json());
    const car = await createParking(
      (await params).carId,
      values.memberName,
      values.location,
    );
    return car
      ? NextResponse.json(car, { status: 201 })
      : NextResponse.json({ error: 'CAR_NOT_FOUND' }, { status: 404 });
  } catch (error) {
    return apiError(error);
  }
}
