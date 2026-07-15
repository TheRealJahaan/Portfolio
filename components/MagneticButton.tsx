"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";

export default function MagneticButton({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    // Control magnetic strength (0.3 is quite strong and satisfying)
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;
  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      onClick={onClick}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
      data-cursor-hover="true"
    >
      {/* Inner text can also move slightly in the opposite direction for parallax if we wanted, 
          but keeping it simple and elegant here */}
      {children}
    </motion.button>
  );
}
