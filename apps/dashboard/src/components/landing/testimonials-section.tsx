'use client';

import { Container, Badge, Icon } from '@/components/ui';
import { useScrollAnimation, useStaggerAnimation } from '@/hooks';

const testimonials = [
  {
    quote:
      'J.A.R.V.I.S completely changed how our team handles follow-ups. No more forgotten tasks or lost decisions.',
    author: 'Minh Tran',
    role: 'CEO, TechStartup VN',
    avatar: 'MT',
    rating: 5,
  },
  {
    quote:
      'The Vietnamese language support is incredible. It understands our local context and date formats perfectly.',
    author: 'Linh Nguyen',
    role: 'Product Manager, FinTech Corp',
    avatar: 'LN',
    rating: 5,
  },
  {
    quote:
      'We reduced meeting follow-up time by 80%. J.A.R.V.I.S extracts action items automatically from our chats.',
    author: 'Duc Pham',
    role: 'Operations Lead, E-commerce Co',
    avatar: 'DP',
    rating: 5,
  },
  {
    quote:
      'Finally, an AI assistant that actually remembers our past conversations. Game changer for project management.',
    author: 'Hoa Le',
    role: 'Project Manager, Agency X',
    avatar: 'HL',
    rating: 5,
  },
  {
    quote:
      'Setup took 2 minutes and the ROI was immediate. Our team is 3x more productive with task tracking.',
    author: 'Tuan Vo',
    role: 'Team Lead, SaaS Startup',
    avatar: 'TV',
    rating: 5,
  },
  {
    quote:
      'The semantic search is magic. I can find any past decision or conversation in seconds.',
    author: 'Mai Hoang',
    role: 'CTO, DevOps Team',
    avatar: 'MH',
    rating: 5,
  },
];

export function TestimonialsSection() {
  const { ref, isVisible } = useScrollAnimation();
  const { getDelay } = useStaggerAnimation(testimonials.length, 100);

  return (
    <section className="py-28 bg-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-50/50 to-white pointer-events-none" />

      <Container className="relative z-10">
        <div
          ref={ref}
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Badge variant="success" className="mb-6 text-sm font-semibold">
            TESTIMONIALS
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Loved by Teams{' '}
            <span className="text-gradient">Everywhere</span>
          </h2>
          <p className="text-xl text-neutral-600">
            See what our users say about their experience with J.A.R.V.I.S
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              style={{ transitionDelay: isVisible ? getDelay(index) : '0ms' }}
              className={`group relative bg-neutral-50 rounded-2xl p-8 border border-neutral-200
                hover:bg-white hover:shadow-xl hover:shadow-neutral-200/50 hover:border-neutral-300
                transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
            >
              {/* Quote icon */}
              <div className="absolute -top-3 right-8 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 text-2xl font-serif leading-none">"</span>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Icon key={i} name="star" size="xs" className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-neutral-700 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t border-neutral-200">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">{testimonial.author}</p>
                  <p className="text-sm text-neutral-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof stats */}
        <div
          className={`mt-16 pt-12 border-t border-neutral-200 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex flex-wrap justify-center gap-12 text-center">
            <div>
              <p className="text-4xl font-bold text-neutral-900 mb-1">500+</p>
              <p className="text-sm text-neutral-500">Active Teams</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-neutral-900 mb-1">50K+</p>
              <p className="text-sm text-neutral-500">Tasks Extracted</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-neutral-900 mb-1">1M+</p>
              <p className="text-sm text-neutral-500">Messages Processed</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-neutral-900 mb-1">4.9/5</p>
              <p className="text-sm text-neutral-500">Average Rating</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
