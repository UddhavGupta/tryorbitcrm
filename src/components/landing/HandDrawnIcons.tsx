/**
 * Hand-drawn duotone icons for the "How it works" grid.
 * Two layers: a soft filled shape (primary-soft) behind a slightly
 * wobbly outline (primary) drawn with rounded caps. Stroke uses
 * non-uniform vector_effect so it stays expressive at any size.
 */
import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 48 48",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// Color tokens — fills use the soft brand tint, strokes the primary.
const FILL = "hsl(var(--primary) / 0.18)";
const STROKE = "hsl(var(--primary))";
const STROKE_W = 1.6;

export const AddPersonHand = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props}>
    {/* head — slightly oval, off-perfect */}
    <path
      d="M19.2 9.4c4.5-1.4 8.6 1.7 8.9 6 .3 3.9-2.6 7.4-6.6 7.6-4 .2-7.4-3-7.4-6.9 0-3.1 1.8-5.7 5.1-6.7Z"
      fill={FILL}
    />
    <path
      d="M14.4 16c.1-3.9 3.3-6.9 7.3-6.9 4 0 7.3 3.1 7.3 6.9 0 3.9-3.3 7-7.3 7-4 0-7.4-3.1-7.3-7Z"
      stroke={STROKE} strokeWidth={STROKE_W}
    />
    {/* shoulders / torso arc */}
    <path
      d="M8.6 36.2c1.4-5.6 6.8-9 13.1-9 4.4 0 8.4 1.7 10.9 4.6"
      stroke={STROKE} strokeWidth={STROKE_W}
    />
    {/* plus sign — slightly tilted */}
    <path d="M35 30.5h8.2M39.1 26.6v8" stroke={STROKE} strokeWidth={STROKE_W} />
    <circle cx="39.1" cy="30.6" r="6.4" fill={FILL} />
    <circle cx="39.1" cy="30.6" r="6.4" stroke={STROKE} strokeWidth={STROKE_W} />
    <path d="M35.7 30.6h6.8M39.1 27.2v6.8" stroke={STROKE} strokeWidth={STROKE_W} />
  </svg>
);

export const NotebookHand = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props}>
    {/* notebook body — slightly skewed rectangle */}
    <path
      d="M11.2 7.4c.3-.6 1-1 1.7-1l22.6.4c.9 0 1.6.8 1.6 1.7l-.4 30.7c0 .9-.8 1.6-1.7 1.5l-22.6-.5c-.9 0-1.6-.8-1.5-1.7l.3-31.1Z"
      fill={FILL}
    />
    <path
      d="M11.5 8.6c.1-.9.9-1.6 1.8-1.6l21.9.2c.9 0 1.7.8 1.7 1.7l-.2 30.4c0 .9-.8 1.6-1.8 1.6l-22-.2c-.9 0-1.6-.8-1.6-1.7l.2-30.4Z"
      stroke={STROKE} strokeWidth={STROKE_W}
    />
    {/* spiral binding rings */}
    <path d="M14.8 5.4v5M19.4 5.4v5M24 5.4v5M28.6 5.4v5M33.2 5.4v5" stroke={STROKE} strokeWidth={STROKE_W} />
    {/* hand-drawn text lines, slightly wobbly */}
    <path d="M16.4 18.1c4.1-.4 8.4-.3 14.3.1" stroke={STROKE} strokeWidth={STROKE_W} />
    <path d="M16.4 23.4c5.2-.5 10.6-.3 14.1.2" stroke={STROKE} strokeWidth={STROKE_W} opacity={0.7} />
    <path d="M16.5 28.6c3.6-.4 7.3-.3 10 .1" stroke={STROKE} strokeWidth={STROKE_W} opacity={0.55} />
    {/* a little star bookmark */}
    <path
      d="M32.4 30.5l1.1 2.4 2.6.3-1.9 1.7.5 2.5-2.3-1.3-2.3 1.3.5-2.5-1.9-1.7 2.6-.3 1.1-2.4Z"
      fill={FILL} stroke={STROKE} strokeWidth={STROKE_W}
    />
  </svg>
);

export const SendHand = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props}>
    {/* paper plane — duotone with a soft body */}
    <path
      d="M40.8 7.4 6.5 19.6c-1.2.4-1.2 2.1 0 2.5l12.7 4 4.1 12.8c.4 1.2 2 1.3 2.5.2l16.3-30.3c.5-1 -.4-2-1.3-1.4Z"
      fill={FILL}
    />
    <path
      d="M41.4 7.2 6.9 19.5c-1.2.5-1.1 2.2.1 2.6l12.4 3.7 4 12.6c.4 1.2 2 1.3 2.5.1L42.7 8.6c.4-1-.4-1.9-1.3-1.4Z"
      stroke={STROKE} strokeWidth={STROKE_W}
    />
    {/* fold line inside */}
    <path d="M19.4 25.8 41.4 7.6" stroke={STROKE} strokeWidth={STROKE_W} />
    <path d="M19.4 25.8l4.4 6.6 4.7-9" stroke={STROKE} strokeWidth={STROKE_W} opacity={0.7} />
    {/* dotted motion trail */}
    <path d="M5.4 27.3c.1 0 .1 0 0 0" stroke={STROKE} strokeWidth={STROKE_W} />
    <circle cx="5.6" cy="29" r=".9" fill={STROKE} />
    <circle cx="8.6" cy="32.4" r=".7" fill={STROKE} opacity={0.7} />
    <circle cx="12" cy="35.6" r=".6" fill={STROKE} opacity={0.5} />
  </svg>
);
