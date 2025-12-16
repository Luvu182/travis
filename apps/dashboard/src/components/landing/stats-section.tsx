'use client';

import { useEffect, useState } from 'react';
import { Container, Icon } from '@/components/ui';
import { useScrollAnimation } from '@/hooks';

const stats = [
  { value: 3, prefix: '<', suffix: 's', label: 'Phản hồi' },
  { value: 99.9, suffix: '%', label: 'Uptime' },
  { value: 100, prefix: '<', suffix: 'ms', label: 'Tìm kiếm' },
  { value: 85, suffix: '%+', label: 'Chính xác' },
];

const badges = [
  { icon: 'shield' as const, text: 'SOC 2' },
  { icon: 'lock' as const, text: 'E2E Encrypted' },
  { icon: 'globe' as const, text: 'GDPR Ready' },
];

function AnimatedNumber({
  value,
  prefix,
  suffix,
  isVisible,
}: {
  value: number;
  prefix?: string;
  suffix: string;
  isVisible: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 1200;
    const steps = 40;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Number(current.toFixed(1)));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isVisible]);

  return (
    <span className="tabular-nums">
      {prefix}
      {Number.isInteger(value) ? Math.round(displayValue) : displayValue}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });

  return (
    <section className="py-12 bg-white border-y border-neutral-100">
      <Container>
        <div
          ref={ref}
          className={`flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-700 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Stats inline */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                style={{ transitionDelay: isVisible ? `${index * 80}ms` : '0ms' }}
                className={`text-center transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="text-2xl md:text-3xl font-bold text-neutral-900">
                  <AnimatedNumber
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    isVisible={isVisible}
                  />
                </div>
                <p className="text-sm text-neutral-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-12 bg-neutral-200" />

          {/* Trust badges inline */}
          <div className="flex items-center gap-6">
            {badges.map((badge) => (
              <div key={badge.text} className="flex items-center gap-1.5 text-neutral-500">
                <Icon name={badge.icon} size="xs" />
                <span className="text-xs font-medium">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
