import React, { useRef, useState } from 'react';

/**
 * 3D Interactive Tilt Card with dynamic highlight glare.
 * Creates an Apple-like tactile depth effect on product photography.
 */
export default function TiltCard({
  children,
  className = '',
  maxTilt = 7,
  glare = true,
  scale = 1.02,
}) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50, isHovered: false });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = ((y - centerY) / centerY) * -maxTilt;
    const tiltY = ((x - centerX) / centerX) * maxTilt;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: tiltX, y: tiltY, glareX, glareY, isHovered: true });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50, isHovered: false });
  };

  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const transformStyle = prefersReduced || !tilt.isHovered
    ? 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
    : `perspective(1000px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg) scale3d(${scale}, ${scale}, 1)`;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: tilt.isHovered ? 'transform 120ms ease-out' : 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        transformStyle: 'preserve-3d',
      }}
      className={`relative ${className}`}
    >
      {children}

      {/* Dynamic light glare on hover */}
      {glare && tilt.isHovered && !prefersReduced && (
        <div
          className="pointer-events-none absolute inset-0 rounded-inherit opacity-25 transition-opacity"
          style={{
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.4) 0%, transparent 65%)`,
            borderRadius: 'inherit',
          }}
        />
      )}
    </div>
  );
}
