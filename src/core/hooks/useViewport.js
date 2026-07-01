// src/core/hooks/useViewport.js
import { useEffect, useState } from 'react';

export function useViewport() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return {
    width,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    isMobile: width < 768,
  };
}
