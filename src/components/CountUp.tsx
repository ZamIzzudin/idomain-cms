"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  target: number;
  duration?: number;
  decimals?: number;
  locale?: boolean;
  className?: string;
}

export default function CountUp({
  target,
  duration = 1200,
  decimals = 0,
  locale = true,
  className,
}: Props) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          hasAnimated.current = true;
          observer.disconnect();
          const start = performance.now();

          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * target;
            setDisplay(current);
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDisplay(target);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : locale
      ? Math.round(display).toLocaleString()
      : Math.round(display).toString();

  return (
    <span ref={ref} className={className}>
      {formatted}
    </span>
  );
}
