import {
  Header,
  HeroSection,
  TrustedBySection,
  FeaturesSection,
  HowItWorksSection,
  IntegrationsSection,
  TestimonialsSection,
  StatsSection,
  PricingSection,
  FAQSection,
  CTASection,
  Footer,
} from '@/components/landing';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <TrustedBySection />
      <FeaturesSection />
      <StatsSection />
      <HowItWorksSection />
      <IntegrationsSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
