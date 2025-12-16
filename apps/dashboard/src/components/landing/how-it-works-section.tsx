'use client';

import { Container, Badge, Icon } from '@/components/ui';
import type { IconName } from '@/components/ui';
import { useScrollAnimation, useStaggerAnimation } from '@/hooks';

const steps: Array<{
  step: number;
  icon: IconName;
  title: string;
  description: string;
}> = [
  {
    step: 1,
    icon: 'message',
    title: 'Kết Nối Nền Tảng',
    description: 'Thêm bot vào nhóm Telegram hoặc workspace Lark. Cài đặt chỉ mất 2 phút.',
  },
  {
    step: 2,
    icon: 'sparkles',
    title: 'Chat Tự Nhiên',
    description: 'Trò chuyện với team như bình thường. AI lắng nghe và hiểu ngữ cảnh.',
  },
  {
    step: 3,
    icon: 'memory',
    title: 'AI Ghi Nhớ',
    description: 'Công việc và quyết định được tự động lưu vào bộ nhớ dài hạn.',
  },
  {
    step: 4,
    icon: 'search',
    title: 'Tìm & Truy Xuất',
    description: 'Hỏi bằng ngôn ngữ tự nhiên để tìm mọi thông tin trong quá khứ.',
  },
];

export function HowItWorksSection() {
  const { ref, isVisible } = useScrollAnimation();
  const { getDelay } = useStaggerAnimation(steps.length, 120);

  return (
    <section
      id="how-it-works"
      className="py-28 bg-white relative overflow-hidden"
    >
      <Container className="relative z-10">
        <div
          ref={ref}
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Badge variant="default" className="mb-6 text-sm font-semibold">
            CÁCH HOẠT ĐỘNG
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Bắt Đầu Trong <span className="text-gradient">Vài Phút</span>
          </h2>
          <p className="text-xl text-neutral-700">
            4 bước đơn giản để nâng cấp giao tiếp team
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <div
              key={step.step}
              style={{ transitionDelay: isVisible ? getDelay(index) : '0ms' }}
              className={`group relative transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {/* Card */}
              <div className="relative bg-neutral-50 rounded-2xl p-6 h-full border border-neutral-100 hover:bg-white hover:shadow-lg hover:shadow-neutral-200/50 hover:border-neutral-200 transition-all duration-300">
                {/* Step number + icon */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl font-bold text-neutral-200 group-hover:text-primary-200 transition-colors">
                    {step.step}
                  </span>
                  <Icon
                    name={step.icon}
                    size="md"
                    className="text-neutral-400 group-hover:text-primary-500 transition-colors"
                  />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary-700 transition-colors">
                  {step.title}
                </h3>
                <p className="text-neutral-700 text-sm leading-relaxed">
                  {step.description}
                </p>

                {/* Connector for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <Icon name="chevron-right" size="sm" className="text-neutral-300" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
