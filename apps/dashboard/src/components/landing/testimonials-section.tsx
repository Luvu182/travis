'use client';

import { Container, Badge, Icon } from '@/components/ui';
import { useScrollAnimation } from '@/hooks';

// Row 1 - scroll left
const testimonialsRow1 = [
  {
    quote: 'J.A.R.V.I.S thay đổi hoàn toàn cách team chúng tôi theo dõi công việc. Không còn quên task hay mất quyết định nữa.',
    author: 'Minh Trần',
    role: 'CEO, TechStartup VN',
    avatar: 'MT',
    rating: 5,
  },
  {
    quote: 'Khả năng hiểu tiếng Việt tuyệt vời. Nó hiểu ngữ cảnh địa phương và format ngày tháng hoàn hảo.',
    author: 'Linh Nguyễn',
    role: 'Product Manager, FinTech Corp',
    avatar: 'LN',
    rating: 5,
  },
  {
    quote: 'Chúng tôi giảm 80% thời gian follow-up họp. J.A.R.V.I.S tự động trích xuất action items từ chat.',
    author: 'Đức Phạm',
    role: 'Operations Lead, E-commerce Co',
    avatar: 'DP',
    rating: 5,
  },
  {
    quote: 'Cuối cùng cũng có AI assistant thực sự nhớ được hội thoại. Thay đổi cuộc chơi cho quản lý dự án.',
    author: 'Hoa Lê',
    role: 'Project Manager, Agency X',
    avatar: 'HL',
    rating: 5,
  },
  {
    quote: 'Tích hợp Telegram siêu mượt, team không cần học tool mới. Dùng luôn trong group chat đang có.',
    author: 'Quang Đinh',
    role: 'Founder, AI Agency',
    avatar: 'QĐ',
    rating: 5,
  },
];

// Row 2 - scroll right
const testimonialsRow2 = [
  {
    quote: 'Cài đặt mất 2 phút và ROI ngay lập tức. Team chúng tôi năng suất gấp 3 lần với theo dõi công việc.',
    author: 'Tuấn Võ',
    role: 'Team Lead, SaaS Startup',
    avatar: 'TV',
    rating: 5,
  },
  {
    quote: 'Tìm kiếm ngữ nghĩa như ma thuật. Tôi có thể tìm bất kỳ quyết định hay hội thoại nào trong vài giây.',
    author: 'Mai Hoàng',
    role: 'CTO, DevOps Team',
    avatar: 'MH',
    rating: 5,
  },
  {
    quote: 'Bot nhớ context cực tốt. Hỏi về project tuần trước vẫn trả lời chính xác, không cần giải thích lại.',
    author: 'Khánh Vũ',
    role: 'Engineering Manager, Corp',
    avatar: 'KV',
    rating: 5,
  },
  {
    quote: 'Đội ngũ hỗ trợ nhiệt tình, response nhanh. Có vấn đề gì fix trong ngày. Rất recommend cho team Việt.',
    author: 'Thảo Lương',
    role: 'Head of Ops, Logistics',
    avatar: 'TL',
    rating: 5,
  },
  {
    quote: 'Giá cả hợp lý cho startup. Chức năng memory là killer feature, đáng từng đồng bỏ ra.',
    author: 'Bình Ngô',
    role: 'Co-founder, EdTech',
    avatar: 'BN',
    rating: 5,
  },
];

function TestimonialCard({ testimonial }: { testimonial: typeof testimonialsRow1[0] }) {
  return (
    <div className="flex-shrink-0 w-[350px] md:w-[400px] mx-3">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-lg hover:border-neutral-200 transition-all duration-300 h-full">
        {/* Rating */}
        <div className="flex gap-0.5 mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Icon key={i} name="star" size="xs" className="text-amber-400 fill-amber-400" />
          ))}
        </div>

        {/* Quote */}
        <p className="text-neutral-700 mb-5 leading-relaxed text-sm">"{testimonial.quote}"</p>

        {/* Author */}
        <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
            {testimonial.avatar}
          </div>
          <div>
            <p className="font-semibold text-neutral-900 text-sm">{testimonial.author}</p>
            <p className="text-xs text-neutral-500">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const { ref, isVisible } = useScrollAnimation();

  // Duplicate arrays for seamless infinite scroll
  const row1Duplicated = [...testimonialsRow1, ...testimonialsRow1];
  const row2Duplicated = [...testimonialsRow2, ...testimonialsRow2];

  return (
    <section className="py-24 bg-neutral-50 bg-dots-light relative overflow-hidden">
      {/* Header */}
      <Container className="relative z-10">
        <div
          ref={ref}
          className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Badge variant="success" className="mb-4">
            ĐÁNH GIÁ
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Được Yêu Thích Bởi <span className="text-gradient">Các Team</span>
          </h2>
          <p className="text-lg text-neutral-600">
            Xem người dùng nói gì về trải nghiệm với J.A.R.V.I.S
          </p>
        </div>
      </Container>

      {/* Row 1 - Scroll Left */}
      <div className="relative mb-6">
        <div className="flex animate-scroll-left">
          {row1Duplicated.map((testimonial, index) => (
            <TestimonialCard key={`row1-${testimonial.author}-${index}`} testimonial={testimonial} />
          ))}
        </div>
      </div>

      {/* Row 2 - Scroll Right */}
      <div className="relative">
        <div className="flex animate-scroll-right">
          {row2Duplicated.map((testimonial, index) => (
            <TestimonialCard key={`row2-${testimonial.author}-${index}`} testimonial={testimonial} />
          ))}
        </div>
      </div>

      {/* Social proof stats */}
      <Container>
        <div
          className={`mt-16 pt-8 border-t border-neutral-200 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex flex-wrap justify-center gap-10 text-center">
            <div>
              <p className="text-3xl font-bold text-neutral-900 mb-1">500+</p>
              <p className="text-sm text-neutral-500">Team Đang Dùng</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900 mb-1">50K+</p>
              <p className="text-sm text-neutral-500">Task Đã Trích Xuất</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900 mb-1">1M+</p>
              <p className="text-sm text-neutral-500">Tin Nhắn Đã Xử Lý</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-neutral-900 mb-1">4.9/5</p>
              <p className="text-sm text-neutral-500">Đánh Giá Trung Bình</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
