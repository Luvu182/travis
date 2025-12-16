import { Container } from '@/components/ui/container';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { Globe, Languages, Sparkles, Zap } from 'lucide-react';

const capabilities = [
  {
    icon: Languages,
    title: 'Vietnamese Native',
    description: 'Built specifically for Vietnamese language with natural understanding.',
  },
  {
    icon: Globe,
    title: 'Multi-Language',
    description: 'Supports English and other languages for international teams.',
  },
  {
    icon: Sparkles,
    title: 'Context Aware',
    description: 'Understands conversation history and user preferences.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Powered by Gemini Flash for instant responses.',
  },
];

export function AICapabilitiesSection() {
  return (
    <section id="ai-capabilities" className="py-24 bg-white">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <Badge variant="purple" className="mb-6">
              AI Capabilities
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Generate in
              <span className="block text-gradient">Your Language</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              JARVIS understands Vietnamese naturally and can communicate in multiple
              languages, making it perfect for diverse teams.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {capabilities.map((cap) => (
                <Card key={cap.title} className="p-0 border-0 shadow-none bg-gray-50">
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg shadow-soft flex items-center justify-center flex-shrink-0">
                      <cap.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{cap.title}</h4>
                      <p className="text-gray-500 text-xs mt-1">{cap.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right - Image */}
          <div className="relative">
            <PlaceholderImage
              variant="gradient"
              height={500}
              label="Language Demo"
              className="w-full rounded-2xl"
            />
            {/* Chat bubble overlays */}
            <div className="absolute top-8 right-8 bg-white rounded-2xl rounded-tr-none p-4 shadow-glow max-w-[200px]">
              <p className="text-sm text-gray-700">Xin chào! Tôi có thể giúp gì cho bạn?</p>
            </div>
            <div className="absolute bottom-8 left-8 bg-blue-600 rounded-2xl rounded-bl-none p-4 shadow-glow max-w-[200px]">
              <p className="text-sm text-white">Schedule a meeting for tomorrow at 2pm</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
