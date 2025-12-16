'use client';

import { Container } from '@/components/ui';

const trustedCompanies = [
  { name: 'VNG Corporation', abbr: 'VNG' },
  { name: 'FPT Software', abbr: 'FPT' },
  { name: 'Tiki', abbr: 'TIKI' },
  { name: 'VinGroup', abbr: 'VIN' },
  { name: 'Momo', abbr: 'MOMO' },
  { name: 'Grab Vietnam', abbr: 'GRAB' },
];

export function TrustedBySection() {
  // Quadruple to ensure no gaps on wide screens
  const scrollItems = [...trustedCompanies, ...trustedCompanies, ...trustedCompanies, ...trustedCompanies];

  return (
    <section className="py-12 bg-white border-y border-neutral-100 overflow-hidden">
      <Container>
        <p className="text-center text-sm font-medium text-neutral-500 mb-8 uppercase tracking-wider">
          Được tin dùng bởi các công ty hàng đầu Việt Nam
        </p>
      </Container>

      {/* Infinite scroll carousel - two identical rows for seamless loop */}
      <div className="relative flex">
        <div className="flex animate-scroll">
          {scrollItems.map((company, index) => (
            <div
              key={`a-${index}`}
              className="flex-shrink-0 px-8 md:px-12"
            >
              <div
                className="text-2xl font-bold text-neutral-300 hover:text-neutral-400 transition-colors cursor-default whitespace-nowrap"
                title={company.name}
              >
                {company.abbr}
              </div>
            </div>
          ))}
        </div>
        <div className="flex animate-scroll">
          {scrollItems.map((company, index) => (
            <div
              key={`b-${index}`}
              className="flex-shrink-0 px-8 md:px-12"
            >
              <div
                className="text-2xl font-bold text-neutral-300 hover:text-neutral-400 transition-colors cursor-default whitespace-nowrap"
                title={company.name}
              >
                {company.abbr}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
