'use client';

import { Container, Badge, Icon } from '@/components/ui';
import type { IconName } from '@/components/ui';
import { useScrollAnimation, useStaggerAnimation } from '@/hooks';

const steps: Array<{
  step: number;
  icon: IconName;
  title: string;
  description: string;
}> = [
  {
    step: 1,
    icon: 'message',
    title: 'Connect Your Platforms',
    description:
      'Add J.A.R.V.I.S bot to your Telegram group or Lark workspace. Setup takes less than 2 minutes.',
  },
  {
    step: 2,
    icon: 'sparkles',
    title: 'Chat Naturally',
    description:
      'Talk to your team as usual. J.A.R.V.I.S listens, understands context, and extracts important information.',
  },
  {
    step: 3,
    icon: 'memory',
    title: 'AI Remembers Everything',
    description:
      'Tasks, decisions, and context are automatically saved to long-term memory for future reference.',
  },
  {
    step: 4,
    icon: 'search',
    title: 'Search & Retrieve',
    description:
      'Ask questions in natural language to find past conversations, decisions, and action items instantly.',
  },
];

export function HowItWorksSection() {
  const { ref, isVisible } = useScrollAnimation();
  const { getDelay } = useStaggerAnimation(steps.length, 150);

  return (
    <section id="how-it-works" className="py-28 bg-neutral-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-gradient-to-r from-primary-200/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-gradient-to-l from-accent-200/40 to-transparent rounded-full blur-3xl" />
      </div>

      <Container className="relative z-10">
        <div
          ref={ref}
          className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Badge variant="default" className="mb-6 text-sm font-semibold">
            HOW IT WORKS
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Get Started in{' '}
            <span className="text-gradient">Minutes</span>
          </h2>
          <p className="text-xl text-neutral-600">
            Four simple steps to transform your team communication
          </p>
        </div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary-300 via-accent-300 to-primary-300" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.step}
                style={{ transitionDelay: isVisible ? getDelay(index) : '0ms' }}
                className={`group relative transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                {/* Step card */}
                <div className="relative bg-white rounded-2xl p-8 shadow-lg shadow-neutral-200/50 border border-neutral-100 hover:shadow-xl hover:border-primary-200 transition-all duration-300 hover:-translate-y-1">
                  {/* Step number */}
                  <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center mb-6 group-hover:from-primary-50 group-hover:to-primary-100 transition-colors duration-300">
                    <Icon
                      name={step.icon}
                      size="lg"
                      className="text-neutral-600 group-hover:text-primary-600 transition-colors"
                    />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-4 top-24 z-10">
                    <Icon name="chevron-right" size="sm" className="text-primary-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
