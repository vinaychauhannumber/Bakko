import React from "react";

const BakkoLogo = ({ className = "size-6" }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left Ear */}
      <path d="M 25 35 L 29 17 C 32 15, 38 18, 41 27 Z" className="fill-primary transition-all duration-300" />
      {/* Right Ear */}
      <path d="M 65 35 L 61 17 C 58 15, 52 18, 49 27 Z" className="fill-primary transition-all duration-300" />
      {/* Speech Bubble Tail */}
      <path d="M 24 64 L 14 78 C 22 78, 28 74, 30 68 Z" className="fill-primary transition-all duration-300" />
      {/* Main Head Circle */}
      <circle cx="45" cy="48" r="24" className="fill-primary transition-all duration-300" />
      
      {/* White Face Mask */}
      <ellipse cx="45" cy="50" rx="17" ry="12" fill="#FFFFFF" />
      
      {/* Eyes */}
      <ellipse cx="39" cy="49" rx="2.5" ry="3.5" fill="#120E43" />
      <ellipse cx="51" cy="49" rx="2.5" ry="3.5" fill="#120E43" />
      
      {/* Nose/Mouth */}
      <ellipse cx="45" cy="53" rx="3" ry="2" fill="#120E43" />
      
      {/* Radiating sound waves on the right */}
      <path d="M 75 34 L 82 28" strokeWidth="3.5" strokeLinecap="round" className="stroke-primary transition-all duration-300" />
      <path d="M 77 46 L 85 46" strokeWidth="3.5" strokeLinecap="round" className="stroke-primary transition-all duration-300" />
      <path d="M 73 58 L 80 64" strokeWidth="3.5" strokeLinecap="round" className="stroke-primary transition-all duration-300" />
    </svg>
  );
};

export default BakkoLogo;
