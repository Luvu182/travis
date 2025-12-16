import { Container } from '@/components/ui/container';

export function StatsSection() {
  return (
    <section className="py-24 bg-gray-50">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Generative,
            <span className="block text-gradient">Predictive AI</span>
          </h2>
          <p className="text-lg text-gray-600">
            Powered by advanced language models for accurate, context-aware responses.
          </p>
        </div>

        {/* Stats Display */}
        <div className="relative max-w-4xl mx-auto">
          {/* Circular Progress Ring */}
          <div className="flex justify-center mb-12">
            <div className="relative">
              {/* Outer ring */}
              <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 200 200">
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                {/* Progress circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="534"
                  strokeDashoffset="107"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-blue-600">80%</span>
                <span className="text-gray-500 text-sm">Accuracy Rate</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            <StatCard
              value="18x"
              label="Faster Responses"
              description="Compared to manual research"
              color="blue"
            />
            <StatCard
              value="300+"
              label="Integrations"
              description="Connect with your tools"
              color="purple"
            />
            <StatCard
              value="99.9%"
              label="Uptime"
              description="Always available for your team"
              color="lime"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

function StatCard({
  value,
  label,
  description,
  color,
}: {
  value: string;
  label: string;
  description: string;
  color: 'blue' | 'purple' | 'lime';
}) {
  const colorClasses = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    lime: 'text-lime-600',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft text-center transition-spring hover:shadow-glow">
      <div className={`text-4xl font-bold ${colorClasses[color]} mb-2`}>{value}</div>
      <div className="font-semibold text-gray-900 mb-1">{label}</div>
      <div className="text-sm text-gray-500">{description}</div>
    </div>
  );
}
