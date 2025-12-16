'use client';

import { Container, Badge, Icon, Button } from '@/components/ui';
import { useScrollAnimation } from '@/hooks';

const plans = [
  {
    name: 'Starter',
    description: 'Cho cá nhân và team nhỏ',
    price: 'Miễn phí',
    priceNote: 'mãi mãi',
    features: [
      '1 workspace',
      '3 thành viên',
      '1,000 tin nhắn/tháng',
      'Bộ nhớ 7 ngày',
      'Hỗ trợ community',
    ],
    cta: 'Bắt Đầu Miễn Phí',
    popular: false,
  },
  {
    name: 'Pro',
    description: 'Cho team đang phát triển',
    price: '499K',
    priceNote: '/tháng',
    features: [
      '5 workspaces',
      '15 thành viên',
      'Không giới hạn tin nhắn',
      'Bộ nhớ 90 ngày',
      'Tích hợp Telegram & Lark',
      'Trích xuất task tự động',
      'Hỗ trợ email ưu tiên',
    ],
    cta: 'Dùng Thử 14 Ngày',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'Cho doanh nghiệp lớn',
    price: 'Liên hệ',
    priceNote: 'báo giá',
    features: [
      'Không giới hạn workspace',
      'Không giới hạn thành viên',
      'Không giới hạn tin nhắn',
      'Bộ nhớ vĩnh viễn',
      'API access',
      'SSO & SAML',
      'SLA 99.99%',
      'Dedicated support',
    ],
    cta: 'Liên Hệ Sales',
    popular: false,
  },
];

export function PricingSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section id="pricing" className="py-24 bg-neutral-50 bg-dots-light">
      <Container>
        <div
          ref={ref}
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Badge variant="primary" className="mb-6">
            BẢNG GIÁ
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Chọn Gói Phù Hợp <span className="text-gradient">Với Bạn</span>
          </h2>
          <p className="text-xl text-neutral-600">
            Bắt đầu miễn phí, nâng cấp khi cần. Không cần thẻ tín dụng.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
              className={`relative rounded-2xl p-8 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              } ${
                plan.popular
                  ? 'bg-neutral-900 text-white ring-2 ring-primary-500 scale-105'
                  : 'bg-white border border-neutral-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="primary" className="shadow-lg">
                    Phổ biến nhất
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-1 ${plan.popular ? 'text-white' : 'text-neutral-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.popular ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-neutral-900'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ml-1 ${plan.popular ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  {plan.priceNote}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Icon
                      name="check"
                      size="sm"
                      className={`mt-0.5 flex-shrink-0 ${
                        plan.popular ? 'text-primary-400' : 'text-primary-500'
                      }`}
                    />
                    <span className={`text-sm ${plan.popular ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? 'primary' : 'outline'}
                size="lg"
                className="w-full"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ hint */}
        <p className="text-center mt-12 text-neutral-500">
          Có câu hỏi?{' '}
          <a href="#faq" className="text-primary-600 hover:underline font-medium">
            Xem FAQ
          </a>{' '}
          hoặc{' '}
          <a href="mailto:support@jarvis.vn" className="text-primary-600 hover:underline font-medium">
            liên hệ chúng tôi
          </a>
        </p>
      </Container>
    </section>
  );
}
