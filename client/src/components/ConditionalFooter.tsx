'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  const [showFooter, setShowFooter] = useState(true);
  const [mouseY, setMouseY] = useState(0);

  const isIdeatingPage = pathname === '/ideating';

  useEffect(() => {
    if (!isIdeatingPage) {
      setShowFooter(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
      const windowHeight = window.innerHeight;
      const threshold = windowHeight - 100; // Show footer when mouse is within 100px of bottom
      
      setShowFooter(e.clientY > threshold);
    };

    const handleMouseLeave = () => {
      setShowFooter(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Initially hide footer on ideating page
    setShowFooter(false);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isIdeatingPage]);

  if (isIdeatingPage) {
    return (
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out ${
          showFooter ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <Footer />
      </div>
    );
  }

  return <Footer />;
}
