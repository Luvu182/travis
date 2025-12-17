'use client';

import { useState } from 'react';
import { Container, Badge, Icon } from '@/components/ui';
import { useScrollAnimation } from '@/hooks';

const faqs = [
  {
    question: 'J.A.R.V.I.S ghi nhớ hội thoại như thế nào?',
    answer:
      'J.A.R.V.I.S sử dụng vector embeddings để lưu trữ ngữ cảnh hội thoại vào bộ nhớ dài hạn. Điều này cho phép nó nhớ lại các quyết định, công việc và thảo luận trong quá khứ. Tất cả dữ liệu đều được mã hóa và lưu trữ an toàn.',
  },
  {
    question: 'J.A.R.V.I.S hỗ trợ những nền tảng nào?',
    answer:
      'Hiện tại, J.A.R.V.I.S hỗ trợ Telegram và Lark Suite. Chúng tôi đang phát triển tích hợp Slack, Discord và Microsoft Teams. Đăng ký để được thông báo khi có nền tảng mới.',
  },
  {
    question: 'Dữ liệu của tôi có an toàn không?',
    answer:
      'Hoàn toàn. Chúng tôi sử dụng mã hóa đầu cuối và dữ liệu của bạn không bao giờ được chia sẻ với bên thứ ba. Chúng tôi tuân thủ SOC 2 và sẵn sàng GDPR.',
  },
  {
    question: 'Độ chính xác trích xuất công việc là bao nhiêu?',
    answer:
      'J.A.R.V.I.S đạt độ chính xác 85%+ trong trích xuất công việc, sử dụng AI tiên tiến với hệ thống dự phòng tự động. Được tối ưu cho tiếng Việt và hiểu các format ngày tháng như "ngày mai" hoặc "tuần sau".',
  },
  {
    question: 'Tôi có thể dùng J.A.R.V.I.S miễn phí không?',
    answer:
      'Có! Chúng tôi có gói miễn phí phù hợp cho team nhỏ. Bao gồm tính năng cơ bản, 1,000 tin nhắn/tháng, và lưu trữ bộ nhớ 30 ngày. Nâng cấp Pro để có tin nhắn không giới hạn và bộ nhớ mở rộng.',
  },
  {
    question: 'Cài đặt mất bao lâu?',
    answer:
      'Cài đặt mất dưới 2 phút. Chỉ cần thêm bot J.A.R.V.I.S vào nhóm Telegram hoặc workspace Lark, cấp quyền cần thiết và bạn đã sẵn sàng. Không cần kiến thức kỹ thuật.',
  },
];

export function FAQSection() {
  const { ref, isVisible } = useScrollAnimation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-neutral-50 bg-dots-light relative overflow-hidden">
      <Container className="relative z-10">
        <div
          ref={ref}
          className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Badge variant="info" className="mb-4">
            CÂU HỎI THƯỜNG GẶP
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Câu Hỏi <span className="text-gradient">Thường Gặp</span>
          </h2>
          <p className="text-lg text-neutral-600">Mọi thứ bạn cần biết về J.A.R.V.I.S</p>
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto space-y-3">
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
                className={`w-full bg-white rounded-xl p-5 text-left transition-all duration-300 ${
                  openIndex === index ? 'shadow-md' : 'shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-neutral-900">{faq.question}</h3>
                  <div
                    className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      openIndex === index ? 'bg-primary-600 rotate-180' : 'bg-neutral-100'
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
                    openIndex === index ? 'max-h-96 mt-3' : 'max-h-0'
                  }`}
                >
                  <p className="text-neutral-600 leading-relaxed pr-10">{faq.answer}</p>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div
          className={`mt-12 text-center transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-neutral-600">
            Vẫn còn thắc mắc?{' '}
            <a
              href="mailto:support@jarvis.ai"
              className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              Liên hệ đội hỗ trợ
            </a>
          </p>
        </div>
      </Container>
    </section>
  );
}
