'use client';

import { useState } from 'react';
import { Container, Badge, Icon, IntegrationLogo } from '@/components/ui';
import type { IconName } from '@/components/ui';
import { useScrollAnimation } from '@/hooks';

const platforms = [
  { type: 'telegram' as const, name: 'Telegram', status: 'Đang hoạt động' },
  { type: 'lark' as const, name: 'Lark Suite', status: 'Đang hoạt động' },
  { type: 'slack' as const, name: 'Slack', status: 'Sắp ra mắt' },
  { type: 'discord' as const, name: 'Discord', status: 'Sắp ra mắt' },
];

const useCases: Array<{
  icon: IconName;
  team: string;
  description: string;
  example: string;
  features: string[];
  stat: { value: string; label: string };
}> = [
  {
    icon: 'megaphone',
    team: 'Marketing',
    description: 'Theo dõi chiến dịch, tổng hợp feedback, lưu trữ ý tưởng brainstorm tự động. Không bao giờ bỏ lỡ insight quan trọng từ team.',
    example: 'Tổng hợp feedback tuần trước về chiến dịch Black Friday',
    features: ['Auto-track campaign metrics', 'Lưu trữ brainstorm ideas', 'Deadline reminders', 'Performance insights'],
    stat: { value: '3x', label: 'tăng tốc tổng hợp báo cáo' },
  },
  {
    icon: 'briefcase',
    team: 'Sales',
    description: 'Ghi nhớ mọi yêu cầu khách hàng, theo dõi follow-up và tổng hợp meeting notes. Không để mất deal vì quên thông tin.',
    example: 'Khách hàng ABC nói gì về pricing hôm qua?',
    features: ['Customer request tracking', 'Follow-up reminders', 'Meeting notes summary', 'Deal history timeline'],
    stat: { value: '40%', label: 'giảm thời gian tìm kiếm' },
  },
  {
    icon: 'rocket',
    team: 'Product',
    description: 'Tổng hợp user feedback, track feature requests và quản lý sprint tasks. Prioritize backlog dựa trên data thực tế.',
    example: 'Liệt kê các bug được report trong tháng này',
    features: ['User feedback aggregation', 'Feature request tracking', 'Sprint task management', 'Bug report summary'],
    stat: { value: '2x', label: 'nhanh hơn prioritize backlog' },
  },
  {
    icon: 'users',
    team: 'HR',
    description: 'Theo dõi tuyển dụng, onboarding và các yêu cầu từ nhân viên. Đảm bảo không ai bị bỏ quên trong process.',
    example: 'Tổng hợp feedback từ buổi phỏng vấn hôm qua',
    features: ['Candidate tracking', 'Onboarding checklist', '1-on-1 feedback logs', 'Employee request inbox'],
    stat: { value: '50%', label: 'giảm thời gian onboarding' },
  },
];

export function IntegrationsSection() {
  const { ref, isVisible } = useScrollAnimation();
  const { ref: useCaseRef, isVisible: useCaseVisible } = useScrollAnimation();
  const [activeCase, setActiveCase] = useState(0);

  return (
    <section id="integrations" className="relative overflow-hidden">
      {/* Platform Integrations */}
      <div className="bg-neutral-50 bg-dots-light py-24">
        <Container>
          <div
            ref={ref}
            className={`transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="primary" className="mb-4">
                TÍCH HỢP
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Hoạt Động Nơi <span className="text-gradient">Bạn Làm Việc</span>
              </h2>
              <p className="text-lg text-neutral-700">
                Tích hợp gốc với các nền tảng yêu thích. Không cần chuyển đổi.
              </p>
            </div>

            {/* Platform cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {platforms.map((platform, index) => (
                <div
                  key={platform.name}
                  style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
                  className={`group relative bg-white rounded-2xl p-6 border border-neutral-100 hover:shadow-lg hover:border-neutral-200
                    transition-all duration-300 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                >
                  {/* Status badge */}
                  <div
                    className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-medium ${
                      platform.status === 'Đang hoạt động'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {platform.status}
                  </div>

                  {/* Logo - no background */}
                  <div className="mb-4">
                    <IntegrationLogo type={platform.type} size="xl" />
                  </div>

                  <h3 className="text-lg font-bold text-neutral-900 mb-1">{platform.name}</h3>
                  <p className="text-sm text-neutral-500">
                    {platform.status === 'Đang hoạt động' ? 'Sẵn sàng sử dụng' : 'Sắp ra mắt'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Use Cases - Connected Tabs with Animated Indicator */}
      <div className="bg-white py-24">
        <Container>
          <div
            ref={useCaseRef}
            className={`text-center max-w-3xl mx-auto mb-12 transition-all duration-700 ${
              useCaseVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Badge variant="default" className="mb-6 text-sm font-semibold">
              USE CASES
            </Badge>
            <h3 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Phù Hợp Với <span className="text-gradient">Mọi Team</span>
            </h3>
            <p className="text-xl text-neutral-700">
              Chọn team của bạn để xem J.A.R.V.I.S có thể giúp gì.
            </p>
          </div>

          {/* Connected Card - Single container */}
          <div
            className={`bg-neutral-50 rounded-2xl border border-neutral-200/80 overflow-hidden transition-all duration-700 ${
              useCaseVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="grid lg:grid-cols-5">
              {/* Left - Tab List with animated indicator */}
              <div className="lg:col-span-2 relative border-r border-neutral-200/60 flex flex-col">
                {/* Animated sliding indicator - solid color */}
                <div
                  className="absolute left-0 w-1 bg-primary-500 rounded-r-full"
                  style={{
                    height: `${100 / useCases.length}%`,
                    top: `${(activeCase * 100) / useCases.length}%`,
                    transition: 'top 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />

                {useCases.map((useCase, index) => {
                  const isActive = activeCase === index;
                  return (
                    <button
                      key={useCase.team}
                      onClick={() => setActiveCase(index)}
                      className={`w-full flex items-center gap-4 p-5 text-left transition-all duration-300 flex-1
                        ${isActive ? 'bg-white' : 'hover:bg-white/50'}
                        ${index < useCases.length - 1 ? 'border-b border-neutral-200/60' : ''}`}
                    >
                      <Icon
                        name={useCase.icon}
                        size="lg"
                        className={`transition-colors duration-300 ${
                          isActive ? 'text-primary-500' : 'text-neutral-400'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-bold transition-colors duration-300 ${
                            isActive ? 'text-neutral-900' : 'text-neutral-600'
                          }`}
                        >
                          {useCase.team}
                        </h4>
                        <p className="text-sm text-neutral-500 truncate">
                          {useCase.description.slice(0, 40)}...
                        </p>
                      </div>
                      <Icon
                        name="chevron-right"
                        size="sm"
                        className={`transition-all duration-300 ${
                          isActive ? 'text-primary-500 translate-x-1' : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Right - Content Panel */}
              <div className="lg:col-span-3 p-8 bg-white relative overflow-hidden">
                {/* Animated content */}
                <div
                  key={activeCase}
                  className="animate-in fade-in slide-in-from-right-4 duration-300"
                >
                  {/* Header with stat */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                        <Icon
                          name={useCases[activeCase].icon}
                          size="lg"
                          className="text-primary-500"
                        />
                      </div>
                      <h4 className="text-2xl font-bold text-neutral-900">
                        {useCases[activeCase].team} Team
                      </h4>
                    </div>
                    {/* Stat badge */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">
                        {useCases[activeCase].stat.value}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {useCases[activeCase].stat.label}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-neutral-700 mb-6 leading-relaxed">
                    {useCases[activeCase].description}
                  </p>

                  {/* Features grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {useCases[activeCase].features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Icon name="check" size="sm" className="text-emerald-500 flex-shrink-0" />
                        <span className="text-sm text-neutral-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Example Query */}
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <p className="text-xs text-neutral-400 mb-2 uppercase tracking-wider font-semibold">
                      Ví dụ câu hỏi
                    </p>
                    <div className="flex items-start gap-3">
                      <Icon name="message" size="md" className="text-primary-400 mt-0.5 flex-shrink-0" />
                      <p className="text-primary-600 font-medium">
                        &ldquo;{useCases[activeCase].example}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Decorative gradient */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-primary-50 to-transparent rounded-tl-full opacity-40" />
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
