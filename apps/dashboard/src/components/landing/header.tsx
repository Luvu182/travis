'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Icon, Container, Badge } from '@/components/ui';

const navLinks = [
  { label: 'Tính Năng', href: '#features' },
  { label: 'Cách Hoạt Động', href: '#how-it-works' },
  { label: 'Tích Hợp', href: '#integrations' },
  { label: 'Giá', href: '#pricing' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 text-white py-2 text-center text-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-50" />
        <Container className="relative flex items-center justify-center gap-2">
          <Icon name="sparkles" size="xs" className="text-primary-200" />
          <span className="font-medium">Mới: Tích hợp Lark Suite đã có mặt!</span>
          <a href="#integrations" className="underline underline-offset-2 hover:text-primary-100 transition-colors ml-1">
            Tìm hiểu thêm →
          </a>
        </Container>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-neutral-900/5 py-3'
            : 'bg-white/50 backdrop-blur-sm py-4'
        }`}
      >
        <Container>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                {/* Logo glow effect */}
                <div className="absolute inset-0 bg-primary-500 rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center text-white shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 group-hover:scale-105 transition-all duration-300">
                  <Icon name="sparkles" size="md" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-neutral-900 tracking-tight">
                  J.A.R.V.I.S
                </span>
                <span className="text-[10px] font-medium text-neutral-500 -mt-0.5 tracking-wider">
                  AI ASSISTANT
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center">
              <div className="flex items-center bg-neutral-100/80 rounded-full px-2 py-1.5">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-primary-600 hover:bg-white rounded-full transition-all duration-200"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-neutral-600">
                  Đăng Nhập
                </Button>
              </Link>
              <Link href="/dashboard/chat">
                <Button
                  size="sm"
                  rightIcon={<Icon name="arrow-right" size="xs" />}
                  className="shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow"
                >
                  Dùng Thử Miễn Phí
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              <Icon name={isMobileMenuOpen ? 'x' : 'menu'} size="md" />
            </button>
          </div>
        </Container>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-white border-t border-neutral-100 shadow-xl transition-all duration-300 ${
            isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <Container>
            <nav className="py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 space-y-2 border-t border-neutral-100 mt-4">
                <Link href="/login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" fullWidth>
                    Đăng Nhập
                  </Button>
                </Link>
                <Link href="/dashboard/chat" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button fullWidth rightIcon={<Icon name="arrow-right" size="xs" />}>
                    Dùng Thử Miễn Phí
                  </Button>
                </Link>
              </div>
            </nav>
          </Container>
        </div>
      </header>
    </>
  );
}
