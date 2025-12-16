import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative bg-hero-gradient pt-32 pb-20 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <Container className="relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white animate-fade-in-up">
            <Badge variant="blue" className="bg-white/20 text-white mb-6">
              AI for Teams
            </Badge>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              J.A.R.V.I.S
              <span className="block text-blue-200">Executive Assistant</span>
            </h1>

            <p className="text-xl text-blue-100 mb-8 max-w-lg">
              Your intelligent Vietnamese AI assistant with long-term memory.
              Seamlessly integrated with Telegram and Lark Suite for team collaboration.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <StatItem value="70%" label="Time Saved" />
              <StatItem value="4.4x" label="Productivity" />
              <StatItem value="24/7" label="Available" />
            </div>
          </div>

          {/* Right - Hero Image */}
          <div className="relative animate-fade-in-right">
            <div className="relative">
              <PlaceholderImage
                variant="isometric"
                height={450}
                label="Hero Dashboard"
                className="w-full animate-float"
              />
              {/* Floating stat cards */}
              <div className="absolute top-8 right-0 bg-white rounded-xl p-4 shadow-glow animate-zoom-in">
                <div className="text-2xl font-bold text-blue-600">70%</div>
                <div className="text-sm text-gray-500">Faster Response</div>
              </div>
              <div className="absolute bottom-8 left-0 bg-white rounded-xl p-4 shadow-glow animate-zoom-in" style={{ animationDelay: '0.2s' }}>
                <div className="text-2xl font-bold text-lime-600">4.4x</div>
                <div className="text-sm text-gray-500">More Productive</div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-blue-200 text-sm">{label}</div>
    </div>
  );
}
