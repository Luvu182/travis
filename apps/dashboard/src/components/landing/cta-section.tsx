'use client';

import Link from 'next/link';
import { Container, Button, Icon, Badge } from '@/components/ui';
import { useScrollAnimation } from '@/hooks';

export function CTASection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="pricing" className="relative overflow-hidden">
      {/* Full-width gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-neutral-900" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-primary-400/20 rounded-full blur-2xl animate-float" />
      </div>

      <Container className="relative z-10 py-32">
        <div
          ref={ref}
          className={`max-w-4xl mx-auto text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Badge */}
          <Badge
            variant="default"
            className="mb-8 bg-white/20 text-white border-white/30 backdrop-blur-sm text-sm"
          >
            START FREE TODAY
          </Badge>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            Ready to Transform
            <span className="block mt-2">
              Your Team's{' '}
              <span className="relative">
                <span className="relative z-10">Productivity</span>
                <span className="absolute bottom-2 left-0 right-0 h-4 bg-accent-500/40 -skew-x-3" />
              </span>
              ?
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-primary-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join{' '}
            <span className="text-white font-semibold">500+ teams</span>{' '}
            using J.A.R.V.I.S to extract tasks, remember decisions, and stay organized.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/dashboard/chat">
              <Button
                size="lg"
                variant="secondary"
                rightIcon={<Icon name="arrow-right" size="sm" />}
                className="bg-white text-primary-700 hover:bg-primary-50 shadow-xl shadow-black/20 text-lg px-8 py-6"
              >
                Get Started Free
              </Button>
            </Link>
            <a href="https://t.me/jarvis_assistant_bot" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                leftIcon={<Icon name="telegram" size="sm" />}
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-lg px-8 py-6"
              >
                Try on Telegram
              </Button>
            </a>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-primary-200">
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <Icon name="check" size="xs" className="text-emerald-400" />
              </div>
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <Icon name="check" size="xs" className="text-emerald-400" />
              </div>
              Free tier available
            </span>
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <Icon name="check" size="xs" className="text-emerald-400" />
              </div>
              Setup in 2 minutes
            </span>
          </div>
        </div>
      </Container>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#171717"
          />
        </svg>
      </div>
    </section>
  );
}
