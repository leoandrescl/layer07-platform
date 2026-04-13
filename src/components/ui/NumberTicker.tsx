"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

interface NumberTickerProps {
  value: number | string;
  duration?: number;
  delay?: number;
  className?: string;
  decimals?: number;
}

export const NumberTicker = ({
  value,
  duration = 2,
  delay = 0,
  className = "",
  decimals = -1,
}: NumberTickerProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px" });
  
  // Clean the value: extract numeric portion
  const stringValue = value.toString();
  const numericMatch = stringValue.match(/[-+]?[0-9]*\.?[0-9]+/);
  const targetValue = numericMatch ? parseFloat(numericMatch[0]) : 0;
  
  // Extract static parts
  const prefix = numericMatch ? stringValue.split(numericMatch[0])[0] : "";
  const suffix = numericMatch ? stringValue.split(numericMatch[0])[1] : stringValue;
  
  // Determine precision
  const resolvedDecimals = decimals >= 0 
    ? decimals 
    : (numericMatch?.[0].split('.')[1]?.length || 0);

  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    const timer = setTimeout(() => {
      const controls = animate(0, targetValue, {
        duration,
        ease: "easeOut",
        onUpdate: (latest) => {
          // Robust formatting to prevent NaN
          const formatted = typeof latest === "number" && !isNaN(latest)
            ? latest.toFixed(resolvedDecimals)
            : "0";
          setDisplayValue(formatted);
        },
      });
      return () => controls.stop();
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [isInView, targetValue, duration, delay, resolvedDecimals]);

  return (
    <span
      ref={ref}
      className={`inline-block tabular-nums ${className}`}
    >
      {prefix}{displayValue}{suffix}
    </span>
  );
};
