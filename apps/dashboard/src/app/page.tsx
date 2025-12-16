import {
  Header,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  IntegrationsSection,
  TestimonialsSection,
  StatsSection,
  FAQSection,
  CTASection,
  Footer,
} from '@/components/landing';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <HowItWorksSection />
      <IntegrationsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
