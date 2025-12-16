import {
  Header,
  HeroSection,
  FeaturesSection,
  StatsSection,
  AICapabilitiesSection,
  TestimonialsSection,
  ContactSection,
  Footer,
} from '@/components/landing';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <AICapabilitiesSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
