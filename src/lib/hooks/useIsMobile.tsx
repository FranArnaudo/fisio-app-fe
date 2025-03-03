import { useState, useEffect } from 'react';

const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

    // Set the initial value
    setIsMobile(mediaQuery.matches);

    const handleChange = (e:any) => setIsMobile(e.matches);

    // Listen for changes in the viewport size
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;
