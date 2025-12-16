'use client';

import { Container, Badge, Icon } from '@/components/ui';
import type { IconName } from '@/components/ui';
import { useScrollAnimation, useStaggerAnimation } from '@/hooks';

const features: Array<{
  icon: IconName;
  title: string;
  description: string;
  badge?: string;
  color: string;
}> = [
  {
    icon: 'memory',
    title: 'Long-term Memory',
    description:
      'Remembers conversations, decisions, and context across sessions. Never lose important information again.',
    badge: 'mem0',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: 'sparkles',
    title: 'Auto Task Extraction',
    description:
      'Automatically identifies tasks, deadlines, and assignees from natural conversations.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: 'search',
    title: 'Semantic Search',
    description:
      'Find any past conversation using natural language. Powered by vector embeddings.',
    badge: 'pgvector',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    icon: 'globe',
    title: 'Vietnamese-First',
    description:
      'Optimized for Vietnamese with cultural nuances and date normalization (ngày mai, hôm qua...).',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: 'lightning',
    title: 'Instant Response',
    description:
      'Sub-3 second response with Gemini Flash. GPT-4 fallback ensures 99.9% uptime.',
    badge: 'Fast',
    color: 'from-rose-500 to-pink-600',
  },
  {
    icon: 'shield',
    title: 'Enterprise Security',
    description:
      'End-to-end encryption, no data sharing. Self-hosted option available.',
    color: 'from-slate-600 to-zinc-700',
  },
];

export function FeaturesSection() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation();
  const { getDelay } = useStaggerAnimation(features.length, 80);

  return (
    <section id="features" className="py-28 bg-white relative overflow-hidden">
      {/* Background geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-accent-100 to-accent-50 rounded-full blur-3xl opacity-60" />
      </div>

      <Container className="relative z-10">
        <div
          ref={sectionRef}
          className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-700 ${
            sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Badge variant="primary" className="mb-6 text-sm font-semibold tracking-wide">
            AI CAPABILITIES
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
            Intelligent Features for
            <span className="block text-gradient mt-2">Modern Teams</span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Built with cutting-edge AI technology to help your team work smarter.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              style={{ transitionDelay: sectionVisible ? getDelay(index) : '0ms' }}
              className={`group relative bg-neutral-50 rounded-2xl p-8 border border-neutral-200/80
                transition-all duration-500 hover:bg-white hover:shadow-xl hover:shadow-neutral-200/50 hover:-translate-y-1 hover:border-neutral-300
                ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                ${index === 0 ? 'lg:col-span-2 lg:row-span-1' : ''}
              `}
            >
              {/* Icon with gradient background */}
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color}
                  flex items-center justify-center mb-6 shadow-lg group-hover:scale-110
                  transition-transform duration-300`}
              >
                <Icon name={feature.icon} size="md" className="text-white" />
              </div>

              {/* Content */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-xl font-bold text-neutral-900 group-hover:text-primary-700 transition-colors">
                  {feature.title}
                </h3>
                {feature.badge && (
                  <span className="shrink-0 px-2.5 py-1 text-xs font-semibold bg-neutral-900 text-white rounded-full">
                    {feature.badge}
                  </span>
                )}
              </div>

              <p className="text-neutral-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover accent line */}
              <div
                className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.color} rounded-b-2xl
                  transition-all duration-300 w-0 group-hover:w-full`}
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
