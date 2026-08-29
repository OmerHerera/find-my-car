import type { CarStyle } from '@/lib/types';

type CarShape = {
  body: string;
  windows: string;
  divider: string;
  wheels: [number, number];
};

const shapes: Record<CarStyle, CarShape> = {
  sedan: {
    body: 'M25 96c10-10 24-15 44-19l31-34c8-9 18-13 31-13h61c16 0 26 5 38 16l31 30c21 4 31 13 35 29l-5 16H20l-5-12c1-6 4-10 10-13Z',
    windows: 'M88 75l25-29c5-5 11-8 20-8h58c10 0 17 4 26 12l24 25H88Z',
    divider: 'M164 38v37',
    wheels: [76, 244],
  },
  suv: {
    body: 'M24 91c10-9 24-14 43-17l24-38c6-10 17-15 31-15h104c13 0 22 5 29 16l19 35c18 4 27 13 30 29l-5 20H18l-4-14c1-8 4-12 10-16Z',
    windows: 'M82 72l20-34c4-7 11-10 21-10h97c8 0 14 4 19 12l17 32H82Z',
    divider: 'M153 28v44m60-44v44',
    wheels: [74, 246],
  },
  hatchback: {
    body: 'M25 96c9-10 22-15 41-18l27-40c6-9 16-14 29-14h68c16 0 27 7 37 21l21 31c22 4 33 13 37 29l-5 16H18l-4-12c1-6 5-10 11-13Z',
    windows: 'M82 75l22-36c4-6 10-9 19-9h64c12 0 20 6 28 17l19 28H82Z',
    divider: 'M158 30v45',
    wheels: [73, 232],
  },
};

export function CarIllustration({
  color,
  carStyle = 'sedan',
}: {
  color: string;
  carStyle?: CarStyle;
}) {
  const shape = shapes[carStyle];
  const gradientId = `paint-${carStyle}-${color.replace('#', '')}`;
  return (
    <svg
      viewBox='0 0 320 150'
      role='img'
      aria-label={`${carStyle} car illustration`}
    >
      <defs>
        <linearGradient id={gradientId} x1='0' y1='0' x2='0.8' y2='1'>
          <stop stopColor='#ffffff' stopOpacity='.2' />
          <stop offset='.18' stopColor={color} />
          <stop offset='.78' stopColor={color} stopOpacity='.8' />
          <stop offset='1' stopColor='#02080c' stopOpacity='.72' />
        </linearGradient>
        <linearGradient id={`glass-${gradientId}`} x1='0' y1='0' x2='1' y2='1'>
          <stop stopColor='#d9f4ff' />
          <stop offset='.48' stopColor='#78a9c4' />
          <stop offset='1' stopColor='#122b3a' />
        </linearGradient>
      </defs>
      <ellipse cx='160' cy='130' rx='135' ry='12' fill='#000' opacity='.36' />
      <path
        d={shape.body}
        fill={`url(#${gradientId})`}
        stroke='#70838d'
        strokeWidth='2'
        strokeLinejoin='round'
      />
      <path
        d={shape.windows}
        fill={`url(#glass-${gradientId})`}
        stroke='#10232d'
        strokeWidth='4'
        strokeLinejoin='round'
      />
      <path d={shape.divider} fill='none' stroke='#10232d' strokeWidth='4' />
      <path
        d='M66 79h195M112 48c25-8 70-10 103 1'
        fill='none'
        stroke='#fff'
        strokeWidth='2.5'
        strokeLinecap='round'
        opacity='.28'
      />
      <path
        d='M156 80v35m53-35v35'
        fill='none'
        stroke='#07131a'
        strokeWidth='2'
        opacity='.46'
      />
      <rect
        x='174'
        y='87'
        width='17'
        height='4'
        rx='2'
        fill='#d8edf7'
        opacity='.68'
      />
      <rect x='44' y='91' width='22' height='9' rx='4' fill='#eaf8ff' />
      <rect x='269' y='89' width='21' height='9' rx='4' fill='#ff626a' />
      <path
        d='M18 110h30m225 0h26'
        stroke='#8d9ba2'
        strokeWidth='5'
        strokeLinecap='round'
      />
      {shape.wheels.map((x) => (
        <g key={x} transform={`translate(${x} 116)`}>
          <circle r='25' fill='#04090d' stroke='#202c33' strokeWidth='3' />
          <circle r='14' fill='#7d8b94' stroke='#d2dde2' strokeWidth='2' />
          <path
            d='M0-11V11M-10-4l20 8M-10 4l20-8'
            stroke='#27343b'
            strokeWidth='3'
            strokeLinecap='round'
          />
          <circle r='4' fill='#c9d5da' />
        </g>
      ))}
    </svg>
  );
}
