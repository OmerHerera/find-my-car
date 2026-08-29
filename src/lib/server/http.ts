import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { DatabaseUnavailableError } from './database';

export function apiError(error: unknown) {
  if (error instanceof ZodError)
    return NextResponse.json(
      { error: 'INVALID_REQUEST', details: error.issues },
      { status: 400 },
    );
  if (error instanceof DatabaseUnavailableError)
    return NextResponse.json(
      {
        error: 'DATABASE_UNAVAILABLE',
        message: 'The database is not configured or unavailable.',
      },
      { status: 503 },
    );
  console.error(error);
  return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
}
