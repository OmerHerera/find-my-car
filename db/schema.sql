CREATE TABLE IF NOT EXISTS cars (
  id UUID PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  color CHAR(7) NOT NULL,
  car_style VARCHAR(20) NOT NULL DEFAULT 'sedan' CONSTRAINT valid_car_style CHECK (car_style IN ('sedan', 'suv', 'hatchback')),
  plate VARCHAR(30),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS parking_events (
  id UUID PRIMARY KEY,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  member_name VARCHAR(80),
  parked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location JSONB NOT NULL,
  CONSTRAINT valid_location_type CHECK (location->>'type' IN ('gps', 'manual'))
);
CREATE INDEX IF NOT EXISTS parking_events_car_time_idx ON parking_events(car_id, parked_at DESC);

-- Safe migration for databases initialized before anonymous parking was supported.
ALTER TABLE parking_events ALTER COLUMN member_name DROP NOT NULL;

ALTER TABLE cars ADD COLUMN IF NOT EXISTS car_style VARCHAR(20) NOT NULL DEFAULT 'sedan';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_car_style'
  ) THEN
    ALTER TABLE cars ADD CONSTRAINT valid_car_style
      CHECK (car_style IN ('sedan', 'suv', 'hatchback'));
  END IF;
END $$;