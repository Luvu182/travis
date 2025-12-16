'use client';

import { useEffect, useState, useRef } from 'react';
import { Container, Icon } from '@/components/ui';
import type { IconName } from '@/components/ui';
import { useScrollAnimation } from '@/hooks';

const stats: Array<{
  label: string;
  value: number;
  prefix?: string;
  suffix: string;
  icon: IconName;
  description: string;
}> = [
  {
    label: 'Response Time',
    value: 3,
    prefix: '<',
    suffix: 'sec',
    icon: 'lightning',
    description: 'Average response',
  },
  {
    label: 'Uptime SLA',
    value: 99.9,
    suffix: '%',
    icon: 'shield',
    description: 'System availability',
  },
  {
    label: 'Vector Search',
    value: 100,
    prefix: '<',
    suffix: 'ms',
    icon: 'search',
    description: 'Query latency',
  },
  {
    label: 'Accuracy',
    value: 85,
    suffix: '%+',
    icon: 'check',
    description: 'Task extraction',
  },
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

    const duration = 1500;
    const steps = 60;
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
    <section className="py-20 bg-neutral-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-500 to-transparent" />

      <Container className="relative z-10">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Performance You Can{' '}
              <span className="text-gradient">Trust</span>
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Built for enterprise-grade reliability and speed
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
                className={`group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10
                  hover:bg-white/10 hover:border-white/20 transition-all duration-500
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon name={stat.icon} size="sm" className="text-white" />
                </div>

                {/* Value */}
                <div className="mb-2">
                  <span className="text-4xl md:text-5xl font-bold text-white">
                    <AnimatedNumber
                      value={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      isVisible={isVisible}
                    />
                  </span>
                </div>

                {/* Label */}
                <p className="text-lg font-semibold text-white mb-1">{stat.label}</p>
                <p className="text-sm text-neutral-500">{stat.description}</p>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/0 to-accent-500/0 group-hover:from-primary-500/5 group-hover:to-accent-500/5 transition-all duration-500" />
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-12 border-t border-white/10">
            <div className="flex items-center gap-2 text-neutral-400">
              <Icon name="shield" size="sm" />
              <span className="text-sm font-medium">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <Icon name="lock" size="sm" />
              <span className="text-sm font-medium">End-to-End Encryption</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <Icon name="server" size="sm" />
              <span className="text-sm font-medium">Self-Hosted Option</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <Icon name="globe" size="sm" />
              <span className="text-sm font-medium">GDPR Ready</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
