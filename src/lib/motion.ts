import type { Variants } from "framer-motion";

export const EASE_SMOOTH = [0.4, 0, 0.2, 1] as [number, number, number, number];
export const EASE_SPRING = [0.34, 1.56, 0.64, 1] as [
  number,
  number,
  number,
  number,
];
export const EASE_OUT = [0, 0, 0.2, 1] as [number, number, number, number];

export const fadeUp = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT, delay },
  },
});

export const fadeIn = (delay = 0): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.4, ease: EASE_OUT, delay },
  },
});

export const stagger = (staggerChildren = 0.08): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren } },
});

export const slideRight = (delay = 0): Variants => ({
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: EASE_OUT, delay },
  },
});

export const slideLeft = (delay = 0): Variants => ({
  hidden: { opacity: 0, x: 24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: EASE_OUT, delay },
  },
});
