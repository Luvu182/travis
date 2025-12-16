import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Bot } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Integrations', href: '#integrations' },
    { label: 'API Docs', href: '/docs' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '#contact' },
  ],
  Resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Help Center', href: '/help' },
    { label: 'Status', href: '/status' },
    { label: 'Changelog', href: '/changelog' },
  ],
  Legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Security', href: '/security' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-footer-gradient text-white">
      {/* CTA Section */}
      <div className="py-20 relative overflow-hidden">
        <Container className="relative">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Realize Value from AI. Fast.
              <span className="block text-blue-200">Get Started Today.</span>
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of teams already using JARVIS to supercharge their productivity.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#contact">
                <Button variant="outline" size="lg">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </Container>

        {/* Background text */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
          <div className="text-[200px] font-bold text-white/5 whitespace-nowrap leading-none">
            JARVIS
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="border-t border-white/10 py-16">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Logo & Description */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold">J.A.R.V.I.S</span>
              </Link>
              <p className="text-blue-200 text-sm">
                Your intelligent AI assistant for team collaboration.
              </p>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="font-semibold mb-4">{title}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-blue-200 hover:text-white text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-blue-200 text-sm">
              © {new Date().getFullYear()} J.A.R.V.I.S. All rights reserved.
            </p>
            <div className="flex gap-6">
              {['Telegram', 'Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-blue-200 hover:text-white text-sm transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
