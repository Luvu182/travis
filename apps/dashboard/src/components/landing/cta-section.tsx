'use client';

import Link from 'next/link';
import { Container, Button, Icon, Badge } from '@/components/ui';
import { useScrollAnimation } from '@/hooks';

export function CTASection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="pricing" className="py-24 bg-neutral-50 bg-dots-light relative overflow-hidden">
      <Container>
        <div
          ref={ref}
          className={`max-w-4xl mx-auto text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Badge */}
          <Badge variant="primary" className="mb-6">
            BẮT ĐẦU MIỄN PHÍ
          </Badge>

          {/* Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
            Sẵn Sàng Nâng Cấp{' '}
            <span className="text-gradient">Năng Suất Team</span>?
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-neutral-700 mb-10 max-w-2xl mx-auto leading-relaxed">
            Tham gia cùng <span className="text-neutral-900 font-semibold">500+ teams</span> đang dùng J.A.R.V.I.S
            để trích xuất công việc, ghi nhớ quyết định và giữ mọi thứ ngăn nắp.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link href="/dashboard/chat">
              <Button size="lg" rightIcon={<Icon name="arrow-right" size="sm" />}>
                Bắt Đầu Miễn Phí
              </Button>
            </Link>
            <a href="https://t.me/jarvis_assistant_bot" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" leftIcon={<Icon name="telegram" size="sm" />}>
                Thử Trên Telegram
              </Button>
            </a>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-neutral-700">
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <Icon name="check" size="xs" className="text-emerald-600" />
              </div>
              Không cần thẻ tín dụng
            </span>
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <Icon name="check" size="xs" className="text-emerald-600" />
              </div>
              Có gói miễn phí
            </span>
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <Icon name="check" size="xs" className="text-emerald-600" />
              </div>
              Cài đặt trong 2 phút
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
