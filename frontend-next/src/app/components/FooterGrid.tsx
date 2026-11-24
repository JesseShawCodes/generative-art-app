"use client";

import { useId, type CSSProperties } from "react";

const VIEW_W = 60;
const VIEW_H = 8;

const DOT_COLORS = [
  "var(--color-bloom)",
  "var(--color-bloom-pink)",
  "var(--color-bloom-dark)",
  "var(--color-bloom-pink)",
] as const;

type Corner = {
  x: number;
  y: number;
  /** Which of the four cells are always visible (rest chase on hover). */
  staticMask: [boolean, boolean, boolean, boolean];
  colors: readonly [string, string, string, string];
};

const CORNERS: Corner[] = [
  {
    x: 2,
    y: 1,
    staticMask: [true, false, true, false],
    colors: [DOT_COLORS[0], DOT_COLORS[1], DOT_COLORS[2], DOT_COLORS[1]],
  },
  {
    x: VIEW_W - 4,
    y: 1,
    staticMask: [false, true, false, true],
    colors: [DOT_COLORS[1], DOT_COLORS[0], DOT_COLORS[1], DOT_COLORS[2]],
  },
  {
    x: 2,
    y: VIEW_H - 3,
    staticMask: [false, true, true, false],
    colors: [DOT_COLORS[2], DOT_COLORS[1], DOT_COLORS[0], DOT_COLORS[1]],
  },
  {
    x: VIEW_W - 4,
    y: VIEW_H - 3,
    staticMask: [true, false, false, true],
    colors: [DOT_COLORS[1], DOT_COLORS[2], DOT_COLORS[1], DOT_COLORS[0]],
  },
];

const CELL_OFFSETS: [number, number][] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];

function FooterGrid() {
  const uid = useId().replace(/:/g, "");
  const patternId = `footer-grid-pattern-${uid}`;
  const gradientId = `footer-grid-gradient-${uid}`;

  return (
    <svg
      aria-hidden="true"
      className="footer-grid"
      height="100%"
      preserveAspectRatio="none"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
    >
      <defs>
        <pattern
          height="1"
          id={patternId}
          patternUnits="userSpaceOnUse"
          width="1"
        >
          <path
            className="footer-grid__line"
            d="M 1 0 H 0 V 1"
          />
        </pattern>
        <linearGradient
          id={gradientId}
          x1="0"
          x2="0"
          y1="0"
          y2="1"
        >
          <stop offset="0" stopColor="var(--footer-grid-canvas)" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="var(--footer-grid-canvas)" stopOpacity="0.15" />
          <stop offset="1" stopColor="var(--footer-grid-canvas)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect
        fill="var(--footer-grid-canvas)"
        height={VIEW_H}
        width={VIEW_W}
      />
      <rect
        fill={`url(#${patternId})`}
        height={VIEW_H}
        width={VIEW_W}
      />
      <path
        className="footer-grid__line"
        d={`M ${VIEW_W} 0 V ${VIEW_H} H 0`}
      />
      <rect
        fill={`url(#${gradientId})`}
        height={VIEW_H}
        width={VIEW_W}
      />

      {CORNERS.map((corner, cornerIndex) => (
        <g
          className="footer-grid__dots"
          data-animate="true"
          key={cornerIndex}
          transform={`translate(${corner.x} ${corner.y})`}
        >
          {CELL_OFFSETS.map(([dx, dy], i) => (
            <rect
              className="footer-grid__dot"
              data-static={corner.staticMask[i] ? "true" : "false"}
              fill={corner.colors[i]}
              height="1"
              key={i}
              style={{ "--dot-index": i } as CSSProperties}
              width="1"
              x={dx}
              y={dy}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

export default FooterGrid;
