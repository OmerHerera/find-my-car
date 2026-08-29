import { NextResponse } from 'next/server';
import { listCars } from '@/lib/server/database';

export async function GET() {
  try {
    await listCars();
    return NextResponse.json({ status: 'ok', database: true });
  } catch {
    return NextResponse.json(
      { status: 'degraded', database: false },
      { status: 503 },
    );
  }
}
