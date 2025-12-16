import { Container } from '@/components/ui/container';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Nguyễn Minh Anh',
    role: 'Product Manager',
    company: 'TechViet',
    content: 'JARVIS đã giúp team chúng tôi tiết kiệm hàng giờ mỗi ngày. Khả năng nhớ ngữ cảnh cực kỳ ấn tượng!',
    avatar: 'MA',
  },
  {
    name: 'David Chen',
    role: 'Engineering Lead',
    company: 'StartupX',
    content: 'The best AI assistant we\'ve used. It integrates perfectly with our Telegram workflow.',
    avatar: 'DC',
  },
  {
    name: 'Trần Hương Giang',
    role: 'Operations Director',
    company: 'FinanceHub',
    content: 'Tính năng memory của JARVIS thật sự khác biệt. Nó nhớ mọi thứ và đưa ra gợi ý chính xác.',
    avatar: 'TG',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-gray-50">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Over 18k+ Customers
            <span className="block text-gradient">Used JARVIS</span>
          </h2>
          <p className="text-lg text-gray-600">
            See what our users say about their experience with JARVIS.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} hover className="p-0">
              <CardContent className="p-6">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Customer Logos */}
        <div className="mt-16 pt-16 border-t border-gray-200">
          <p className="text-center text-gray-500 mb-8">Trusted by leading companies</p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {['TechCorp', 'StartupX', 'FinanceHub', 'MediaPro', 'CloudNet'].map((company) => (
              <div key={company} className="text-2xl font-bold text-gray-300 hover:text-gray-400 transition-colors">
                {company}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
