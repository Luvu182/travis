import { Container } from '@/components/ui/container';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Brain, Database, MessageSquare, Shield } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Advanced Memory',
    description: 'Remembers context from all conversations using mem0 for personalized, intelligent responses.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Database,
    title: 'Unified Data Access',
    description: 'Seamlessly connects to your team\'s knowledge base and business systems.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: MessageSquare,
    title: 'Multi-Platform',
    description: 'Works natively with Telegram and Lark Suite group chats for team collaboration.',
    color: 'text-lime-600',
    bgColor: 'bg-lime-50',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Your data stays private with enterprise-grade encryption and access controls.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white">
      <Container>
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            One Unified Platform
            <span className="block text-gradient">for Generative AI</span>
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to supercharge your team's productivity with AI-powered assistance.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} hover className="p-0">
              <CardContent className="p-6">
                <div className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Showcase */}
        <div className="mt-24 grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <PlaceholderImage
              variant="gradient"
              height={400}
              label="Feature Showcase"
              className="w-full"
            />
          </div>
          <div className="order-1 lg:order-2">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Unlocking AI for
              <span className="block text-blue-600">Your Work</span>
            </h3>
            <div className="space-y-6">
              <FeatureItem
                title="Easy Operator"
                description="Simple commands and natural language make JARVIS easy to use for everyone."
              />
              <FeatureItem
                title="Accurate Results"
                description="Powered by Gemini Flash with intelligent fallback to ensure reliable responses."
              />
              <FeatureItem
                title="Get Reports"
                description="Generate comprehensive reports and summaries from your conversations instantly."
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-6 h-6 bg-lime-500 rounded-full flex items-center justify-center mt-1">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}
