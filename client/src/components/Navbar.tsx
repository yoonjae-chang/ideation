'use client';

import Link from "next/link";
import { AuthButton } from "./auth-button";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        
        // Show navbar when scrolling up or at top
        if (currentScrollY < lastScrollY || currentScrollY < 10) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
        
        setLastScrollY(currentScrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="w-full max-w-7xl mx-auto flex justify-between items-center p-3 px-5">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">P</span>
          </div>
          <Link href="/" className="text-foreground font-semibold text-lg hover:text-accent transition-colors">
            Prototyping Ideas
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/features" className="text-sub-foreground hover:text-accent transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-sub-foreground hover:text-accent transition-colors">
            Pricing
          </Link>
          <Link href="/docs" className="text-sub-foreground hover:text-accent transition-colors">
            Docs
          </Link>
          <AuthButton />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          <AuthButton />
          <button
            onClick={toggleMenu}
            className="text-foreground hover:text-accent transition-colors p-2"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`md:hidden bg-card border-t border-border transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="px-5 py-4 space-y-4">
          <Link 
            href="/features" 
            className="block text-sub-foreground hover:text-accent transition-colors py-2"
            onClick={() => setIsOpen(false)}
          >
            Features
          </Link>
          <Link 
            href="/pricing" 
            className="block text-sub-foreground hover:text-accent transition-colors py-2"
            onClick={() => setIsOpen(false)}
          >
            Pricing
          </Link>
          <Link 
            href="/docs" 
            className="block text-sub-foreground hover:text-accent transition-colors py-2"
            onClick={() => setIsOpen(false)}
          >
            Documentation
          </Link>
        </div>
      </div>
    </nav>
  );
}
