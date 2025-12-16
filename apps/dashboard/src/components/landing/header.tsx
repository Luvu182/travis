'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Icon, Container } from '@/components/ui';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Integrations', href: '#integrations' },
  { label: 'Demo', href: '#demo' },
  { label: 'Pricing', href: '#pricing' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl shadow-lg shadow-neutral-900/5'
          : 'bg-transparent'
      }`}
    >
      <Container>
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white shadow-lg shadow-primary-600/30 group-hover:shadow-primary-600/50 transition-shadow">
              <Icon name="sparkles" size="sm" />
            </div>
            <span className="text-xl font-bold text-neutral-900 dark:text-white">
              J.A.R.V.I.S
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-neutral-600 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard/chat">
              <Button
                size="sm"
                rightIcon={<Icon name="arrow-right" size="xs" />}
              >
                Try Now
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-neutral-600 dark:text-neutral-300 cursor-pointer"
            aria-label="Toggle menu"
          >
            <Icon name={isMobileMenuOpen ? 'x' : 'menu'} size="md" />
          </button>
        </div>
      </Container>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
          <Container>
            <nav className="py-4 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium text-neutral-600 hover:text-primary-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:text-primary-400 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 space-y-2 border-t border-neutral-200 dark:border-neutral-800 mt-4">
                <Link href="/login" className="block">
                  <Button variant="outline" fullWidth>
                    Sign In
                  </Button>
                </Link>
                <Link href="/dashboard/chat" className="block">
                  <Button fullWidth rightIcon={<Icon name="arrow-right" size="xs" />}>
                    Try Now
                  </Button>
                </Link>
              </div>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
