'use client';

import { Container, Badge, Icon } from '@/components/ui';
import type { IconName } from '@/components/ui';
import { useScrollAnimation, useStaggerAnimation } from '@/hooks';

const features: Array<{
  icon: IconName;
  title: string;
  description: string;
  highlights?: string[];
}> = [
  {
    icon: 'memory',
    title: 'Bộ Nhớ Dài Hạn',
    description:
      'Công nghệ lưu trữ thông minh với vector embeddings giúp AI ghi nhớ mọi ngữ cảnh, quyết định và hội thoại quan trọng qua nhiều phiên làm việc.',
    highlights: [
      'Tự động phân loại và lưu trữ thông tin theo nhóm, người dùng',
      'Truy xuất ngữ cảnh liên quan khi cần thiết',
      'Không giới hạn dung lượng lưu trữ',
      'Đồng bộ real-time giữa các nền tảng',
    ],
  },
  {
    icon: 'sparkles',
    title: 'Tự Động Trích Xuất Task',
    description:
      'Tự động nhận diện công việc, deadline và người được giao từ hội thoại tự nhiên.',
  },
  {
    icon: 'search',
    title: 'Tìm Kiếm Ngữ Nghĩa',
    description:
      'Tìm bất kỳ hội thoại nào trong quá khứ bằng ngôn ngữ tự nhiên.',
  },
  {
    icon: 'globe',
    title: 'Ưu Tiên Tiếng Việt',
    description:
      'Tối ưu cho tiếng Việt với hiểu biết văn hóa và chuẩn hóa ngày tháng (ngày mai, hôm qua...).',
  },
  {
    icon: 'lightning',
    title: 'Phản Hồi Tức Thì',
    description:
      'Phản hồi dưới 3 giây với AI tốc độ cao. Đảm bảo 99.9% uptime.',
  },
  {
    icon: 'shield',
    title: 'Bảo Mật Chuẩn Doanh Nghiệp',
    description:
      'Mã hóa đầu cuối, không chia sẻ dữ liệu với bên thứ ba.',
  },
];

export function FeaturesSection() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation();
  const { getDelay } = useStaggerAnimation(features.length, 80);

  return (
    <section id="features" className="py-28 bg-neutral-50 bg-dots-light relative overflow-hidden">

      <Container className="relative z-10">
        <div
          ref={sectionRef}
          className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-700 ${
            sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Badge variant="primary" className="mb-6 text-sm font-semibold tracking-wide">
            TÍNH NĂNG AI
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
            Tính Năng Thông Minh
            <span className="block text-gradient mt-2">Cho Team Hiện Đại</span>
          </h2>
          <p className="text-xl text-neutral-700 max-w-2xl mx-auto">
            Được xây dựng với công nghệ AI tiên tiến giúp team làm việc hiệu quả hơn.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => {
            const isLargeCard = index === 0;
            return (
              <div
                key={feature.title}
                style={{ transitionDelay: sectionVisible ? getDelay(index) : '0ms' }}
                className={`group relative bg-neutral-50 rounded-2xl p-8 border border-neutral-200/80
                  transition-all duration-500 hover:bg-white hover:shadow-xl hover:shadow-neutral-200/50 hover:-translate-y-1 hover:border-neutral-300
                  ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                  ${isLargeCard ? 'lg:col-span-2 lg:row-span-2' : ''}
                `}
              >
                {/* Header: Icon + Title inline */}
                <div className="flex items-center gap-3 mb-4">
                  <Icon
                    name={feature.icon}
                    size="lg"
                    className="text-neutral-400 group-hover:text-primary-500 transition-colors flex-shrink-0"
                  />
                  <h3 className="text-xl font-bold text-neutral-900 group-hover:text-primary-700 transition-colors">
                    {feature.title}
                  </h3>
                </div>

                {/* Description */}
                <p className={`text-neutral-700 leading-relaxed ${isLargeCard ? 'text-lg mb-6' : ''}`}>
                  {feature.description}
                </p>

                {/* Highlights for large card */}
                {isLargeCard && feature.highlights && (
                  <ul className="mt-4 space-y-3">
                    {feature.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Icon
                          name="check"
                          size="sm"
                          className="text-primary-500 mt-0.5 flex-shrink-0"
                        />
                        <span className="text-neutral-800">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
