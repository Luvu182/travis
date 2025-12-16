'use client';

import { Container, Badge, Icon, IntegrationLogo } from '@/components/ui';
import { useScrollAnimation } from '@/hooks';

const platforms = [
  { type: 'telegram' as const, name: 'Telegram', status: 'Live', color: 'from-sky-400 to-blue-500' },
  { type: 'lark' as const, name: 'Lark Suite', status: 'Live', color: 'from-blue-500 to-indigo-600' },
  { type: 'slack' as const, name: 'Slack', status: 'Coming Soon', color: 'from-purple-500 to-pink-500' },
  { type: 'discord' as const, name: 'Discord', status: 'Coming Soon', color: 'from-indigo-500 to-purple-600' },
];

const techStack = [
  { type: 'gemini' as const, name: 'Gemini Flash', role: 'Primary LLM' },
  { type: 'openai' as const, name: 'GPT-4', role: 'Fallback LLM' },
  { type: 'postgresql' as const, name: 'PostgreSQL', role: 'Database' },
];

export function IntegrationsSection() {
  const { ref, isVisible } = useScrollAnimation();
  const { ref: techRef, isVisible: techVisible } = useScrollAnimation();

  return (
    <section id="integrations" className="relative overflow-hidden">
      {/* Platform Integrations - Full width dark section */}
      <div className="bg-neutral-900 py-28 relative">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl" />

        <Container className="relative z-10">
          <div
            ref={ref}
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
              <div className="max-w-2xl">
                <Badge variant="default" className="mb-6 bg-white/10 text-white border-white/20">
                  INTEGRATIONS
                </Badge>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Works Where
                  <span className="block text-gradient">You Work</span>
                </h2>
                <p className="text-xl text-neutral-400">
                  Native integration with your favorite platforms. Zero context switching.
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">2</p>
                  <p className="text-sm text-neutral-500">Live Platforms</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">2</p>
                  <p className="text-sm text-neutral-500">Coming Soon</p>
                </div>
              </div>
            </div>

            {/* Platform cards - horizontal scroll on mobile */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {platforms.map((platform, index) => (
                <div
                  key={platform.name}
                  style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
                  className={`group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10
                    hover:bg-white/10 hover:border-white/20 transition-all duration-500
                    ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                >
                  {/* Status badge */}
                  <div
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                      platform.status === 'Live'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {platform.status}
                  </div>

                  {/* Logo */}
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${platform.color}
                      flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IntegrationLogo type={platform.type} size="lg" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{platform.name}</h3>
                  <p className="text-sm text-neutral-500">
                    {platform.status === 'Live'
                      ? 'Fully integrated and ready to use'
                      : 'Join waitlist for early access'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Tech Stack - Light section with asymmetric layout */}
      <div className="bg-white py-28">
        <Container>
          <div
            ref={techRef}
            className={`grid lg:grid-cols-2 gap-16 items-center transition-all duration-700 ${
              techVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Left - Content */}
            <div>
              <Badge variant="default" className="mb-6">
                POWERED BY
              </Badge>
              <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
                Enterprise-Grade
                <span className="block text-gradient">AI Infrastructure</span>
              </h3>
              <p className="text-lg text-neutral-600 mb-8">
                Built on battle-tested technologies. Gemini Flash for speed, GPT-4 for reliability,
                PostgreSQL with pgvector for lightning-fast semantic search.
              </p>

              {/* Features list */}
              <div className="space-y-4">
                {[
                  'Automatic LLM failover for 99.9% uptime',
                  'Vector embeddings for semantic search',
                  'Horizontal scaling ready',
                  'Self-hosted deployment option',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Icon name="check" size="xs" className="text-emerald-600" />
                    </div>
                    <span className="text-neutral-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Tech cards */}
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-3xl -z-10" />

              <div className="space-y-4 p-4">
                {techStack.map((tech, index) => (
                  <div
                    key={tech.name}
                    style={{ transitionDelay: techVisible ? `${index * 150}ms` : '0ms' }}
                    className={`group flex items-center gap-6 bg-white rounded-xl p-6 shadow-lg shadow-neutral-200/50
                      border border-neutral-100 hover:shadow-xl hover:border-primary-200
                      transition-all duration-500 ${
                        techVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                      }`}
                  >
                    <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                      <IntegrationLogo type={tech.type} size="lg" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-neutral-900">{tech.name}</h4>
                      <p className="text-sm text-neutral-500">{tech.role}</p>
                    </div>
                    <Icon
                      name="arrow-right"
                      size="sm"
                      className="text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
