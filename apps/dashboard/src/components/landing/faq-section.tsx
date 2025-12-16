'use client';

import { useState } from 'react';
import { Container, Badge, Icon } from '@/components/ui';
import { useScrollAnimation, useStaggerAnimation } from '@/hooks';

const faqs = [
  {
    question: 'How does J.A.R.V.I.S remember conversations?',
    answer:
      'J.A.R.V.I.S uses mem0 and vector embeddings to store conversation context in long-term memory. This allows it to recall past decisions, tasks, and discussions even months later. All data is encrypted and stored securely.',
  },
  {
    question: 'Which platforms does J.A.R.V.I.S support?',
    answer:
      'Currently, J.A.R.V.I.S supports Telegram and Lark Suite. We\'re actively working on Slack, Discord, and Microsoft Teams integrations. Join our waitlist to be notified when new platforms are available.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Absolutely. We use end-to-end encryption, and your data is never shared with third parties. We offer a self-hosted option for enterprises requiring full data control. We\'re SOC 2 compliant and GDPR ready.',
  },
  {
    question: 'How accurate is the task extraction?',
    answer:
      'J.A.R.V.I.S achieves 85%+ accuracy in task extraction, using Gemini Flash as the primary LLM with GPT-4 fallback. It\'s optimized for Vietnamese language and understands local date formats like "ngày mai" or "tuần sau".',
  },
  {
    question: 'Can I use J.A.R.V.I.S for free?',
    answer:
      'Yes! We offer a free tier perfect for small teams. It includes basic features, 1,000 messages/month, and 30-day memory retention. Upgrade to Pro for unlimited messages and extended memory.',
  },
  {
    question: 'How long does setup take?',
    answer:
      'Setup takes less than 2 minutes. Simply add the J.A.R.V.I.S bot to your Telegram group or Lark workspace, grant the necessary permissions, and you\'re ready to go. No technical knowledge required.',
  },
  {
    question: 'What happens if the AI makes a mistake?',
    answer:
      'You can easily correct J.A.R.V.I.S by replying with corrections. The AI learns from feedback and improves over time. You can also review and edit extracted tasks directly from the dashboard.',
  },
  {
    question: 'Do you offer enterprise plans?',
    answer:
      'Yes, we offer custom enterprise plans with dedicated support, SLA guarantees, custom integrations, SSO, and self-hosted deployment options. Contact our sales team for a demo.',
  },
];

export function FAQSection() {
  const { ref, isVisible } = useScrollAnimation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-28 bg-neutral-50 relative overflow-hidden">
      <Container className="relative z-10">
        <div
          ref={ref}
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Badge variant="info" className="mb-6 text-sm font-semibold">
            FAQ
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Frequently Asked{' '}
            <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-xl text-neutral-600">
            Everything you need to know about J.A.R.V.I.S
          </p>
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{ transitionDelay: isVisible ? `${index * 50}ms` : '0ms' }}
              className={`transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`w-full bg-white rounded-xl p-6 text-left border transition-all duration-300 ${
                  openIndex === index
                    ? 'border-primary-300 shadow-lg shadow-primary-100/50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-neutral-900 pr-8">
                    {faq.question}
                  </h3>
                  <div
                    className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      openIndex === index
                        ? 'bg-primary-600 rotate-180'
                        : 'bg-neutral-100'
                    }`}
                  >
                    <Icon
                      name="chevron-down"
                      size="sm"
                      className={openIndex === index ? 'text-white' : 'text-neutral-600'}
                    />
                  </div>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96 mt-4' : 'max-h-0'
                  }`}
                >
                  <p className="text-neutral-600 leading-relaxed pr-12">
                    {faq.answer}
                  </p>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div
          className={`mt-16 text-center transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-neutral-600 mb-4">
            Still have questions?{' '}
            <a
              href="mailto:support@jarvis.ai"
              className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </Container>
    </section>
  );
}
