'use client';

import Link from 'next/link';
import { Container, Icon, Badge } from '@/components/ui';
import { useScrollAnimation } from '@/hooks';

const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Integrations', href: '#integrations' },
    { label: 'Pricing', href: '#pricing' },
  ],
  resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Status', href: '#' },
    { label: 'Changelog', href: '#' },
  ],
  company: [
    { label: 'About Us', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Security', href: '#' },
  ],
};

export function Footer() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <footer className="bg-neutral-900 text-white relative overflow-hidden">
      {/* Top section with newsletter */}
      <div className="border-b border-white/10">
        <Container>
          <div
            ref={ref}
            className={`py-16 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="max-w-xl">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                Stay Updated
              </h3>
              <p className="text-neutral-400">
                Get the latest updates on new features and integrations.
              </p>
            </div>

            {/* Newsletter form */}
            <form className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 lg:w-80 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors flex items-center justify-center gap-2"
              >
                Subscribe
                <Icon name="arrow-right" size="sm" />
              </button>
            </form>
          </div>
        </Container>
      </div>

      {/* Main footer content */}
      <Container>
        <div className="py-16 grid md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Icon name="sparkles" size="md" className="text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold block">J.A.R.V.I.S</span>
                <span className="text-xs text-neutral-500">AI Executive Assistant</span>
              </div>
            </Link>
            <p className="text-neutral-400 mb-6 max-w-xs leading-relaxed">
              AI-powered Vietnamese executive assistant with long-term memory for Telegram and Lark Suite.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              <a
                href="https://t.me/jarvis_assistant_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-sky-500/20 hover:text-sky-400 flex items-center justify-center transition-all"
              >
                <Icon name="telegram" size="sm" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-blue-500/20 hover:text-blue-400 flex items-center justify-center transition-all"
              >
                <Icon name="lark" size="sm" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-neutral-700 flex items-center justify-center transition-all"
              >
                <Icon name="github" size="sm" />
              </a>
            </div>
          </div>

          {/* Links columns */}
          <div>
            <h4 className="font-semibold text-white mb-5">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-5">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-5">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-5">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} J.A.R.V.I.S. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
              All Systems Operational
            </Badge>
            <p className="text-sm text-neutral-500">
              Made with <span className="text-red-500">❤</span> in Vietnam
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
