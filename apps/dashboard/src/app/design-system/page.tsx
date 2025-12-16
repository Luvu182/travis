'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  Input,
  Badge,
  Container,
  Avatar,
  Icon,
  ChatBubble,
  StreamingText,
  FeatureCard,
  StatCard,
  IntegrationLogo,
} from '@/components/ui';
import type { IconName } from '@/components/ui';

const iconNames: IconName[] = [
  'sparkles',
  'brain',
  'message',
  'send',
  'bot',
  'user',
  'check',
  'x',
  'menu',
  'arrow-right',
  'arrow-left',
  'chevron-down',
  'chevron-up',
  'chevron-right',
  'globe',
  'lightning',
  'shield',
  'clock',
  'database',
  'code',
  'settings',
  'search',
  'star',
  'heart',
  'play',
  'pause',
  'refresh',
  'external-link',
  'copy',
  'telegram',
  'lark',
  'memory',
  'analytics',
  'integration',
  'lock',
  'server',
  'github',
];

function SectionWrapper({
  title,
  badge,
  description,
  children,
}: {
  title: string;
  badge?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-20 relative overflow-hidden bg-neutral-50 bg-dots-light">
      {/* Gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl bg-primary-100/60" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-3xl bg-accent-100/60" />
      </div>

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="mb-12">
          {badge && (
            <Badge variant="primary" className="mb-4 text-xs font-semibold tracking-wide">
              {badge}
            </Badge>
          )}
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-neutral-900">
            {title}
          </h2>
          {description && (
            <p className="text-lg max-w-2xl text-neutral-600">
              {description}
            </p>
          )}
        </div>

        {children}
      </Container>
    </section>
  );
}

function ComponentShowcase({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10 last:mb-0">
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-5 text-neutral-500">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function DesignSystemPage() {
  const [streamingDemo, setStreamingDemo] = useState(false);

  return (
    <main className="min-h-screen">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 py-24">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-dots-light opacity-20" />

        {/* Floating orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow"
            style={{ animationDelay: '1s' }}
          />
        </div>

        <Container className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-8 group"
          >
            <Icon
              name="arrow-left"
              size="xs"
              className="group-hover:-translate-x-1 transition-transform"
            />
            Quay Lại Trang Chủ
          </Link>

          <Badge
            variant="default"
            className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm"
          >
            HỆ THỐNG THIẾT KẾ v1.0
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            J.A.R.V.I.S
            <span className="block mt-2">
              <span className="relative">
                <span className="relative z-10">Hệ Thống Thiết Kế</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-accent-500/40 -skew-x-3" />
              </span>
            </span>
          </h1>

          <p className="text-xl text-primary-100 max-w-2xl leading-relaxed">
            Bộ sưu tập toàn diện các component tái sử dụng, pattern và style để xây dựng giao diện
            đẹp và nhất quán.
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-8 mt-12">
            <div className="flex items-center gap-3">
              <Icon name="code" size="lg" className="text-white/70" />
              <div>
                <p className="text-2xl font-bold text-white">15+</p>
                <p className="text-sm text-primary-200">Component</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Icon name="sparkles" size="lg" className="text-white/70" />
              <div>
                <p className="text-2xl font-bold text-white">{iconNames.length}</p>
                <p className="text-sm text-primary-200">Icon</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Icon name="integration" size="lg" className="text-white/70" />
              <div>
                <p className="text-2xl font-bold text-white">8</p>
                <p className="text-sm text-primary-200">Tích Hợp</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Buttons Section */}
      <SectionWrapper
        title="Nút Bấm"
        badge="TƯƠNG TÁC"
        description="Component nút đa năng với nhiều biến thể, kích thước và trạng thái cho mọi nhu cầu tương tác."
      >
        <ComponentShowcase title="Biến Thể">
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Chính</Button>
            <Button variant="secondary">Phụ</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Viền</Button>
            <Button variant="danger">Nguy Hiểm</Button>
          </div>
        </ComponentShowcase>

        <ComponentShowcase title="Kích Thước">
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Nhỏ</Button>
            <Button size="md">Vừa</Button>
            <Button size="lg">Lớn</Button>
          </div>
        </ComponentShowcase>

        <ComponentShowcase title="Với Icon">
          <div className="flex flex-wrap gap-4">
            <Button leftIcon={<Icon name="sparkles" size="xs" />}>Icon Trái</Button>
            <Button rightIcon={<Icon name="arrow-right" size="xs" />}>Icon Phải</Button>
            <Button isLoading>Đang Tải</Button>
          </div>
        </ComponentShowcase>
      </SectionWrapper>

      {/* Cards Section */}
      <SectionWrapper
        title="Thẻ"
        badge="BỐ CỤC"
        description="Component thẻ linh hoạt để tổ chức và trình bày nội dung một cách đẹp mắt."
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { variant: 'default' as const, title: 'Thẻ Mặc Định', desc: 'Thẻ tiêu chuẩn với viền và nền.' },
            { variant: 'glass' as const, title: 'Thẻ Kính', desc: 'Hiệu ứng glassmorphism với backdrop blur.' },
            { variant: 'elevated' as const, title: 'Thẻ Nổi', desc: 'Thẻ với độ nổi shadow.' },
            { variant: 'bordered' as const, title: 'Thẻ Viền', desc: 'Trong suốt với viền nổi bật.' },
            { variant: 'gradient' as const, title: 'Thẻ Gradient', desc: 'Nền gradient tinh tế.' },
          ].map((card) => (
            <Card key={card.variant} variant={card.variant} className="group">
              <h3 className="font-semibold mb-2 text-neutral-900 group-hover:text-primary-600 transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-neutral-600">{card.desc}</p>
            </Card>
          ))}
          <Card variant="glass" hover>
            <h3 className="font-semibold mb-2 text-neutral-900">Hiệu Ứng Hover</h3>
            <p className="text-sm text-neutral-600">Thẻ với animation khi hover.</p>
          </Card>
        </div>
      </SectionWrapper>

      {/* Inputs Section */}
      <SectionWrapper
        title="Trường Nhập Liệu"
        badge="FORM"
        description="Component form đẹp, dễ tiếp cận với trạng thái validation và phản hồi hữu ích."
      >
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
          <Input label="Input Mặc Định" placeholder="Nhập văn bản..." />
          <Input
            label="Với Icon"
            placeholder="Tìm kiếm..."
            leftIcon={<Icon name="search" size="sm" />}
          />
          <Input label="Với Lỗi" placeholder="Email" error="Địa chỉ email không hợp lệ" />
          <Input label="Với Gợi Ý" placeholder="Tên người dùng" hint="Phải từ 3-20 ký tự" />
          <Input label="Vô Hiệu" placeholder="Input đã vô hiệu" disabled />
        </div>
      </SectionWrapper>

      {/* Badges Section */}
      <SectionWrapper
        title="Nhãn"
        badge="TRẠNG THÁI"
        description="Nhãn gọn gàng để phân loại, hiển thị trạng thái và làm nổi bật thông tin."
      >
        <ComponentShowcase title="Biến Thể">
          <div className="flex flex-wrap gap-3">
            <Badge variant="default">Mặc Định</Badge>
            <Badge variant="primary">Chính</Badge>
            <Badge variant="success">Thành Công</Badge>
            <Badge variant="warning">Cảnh Báo</Badge>
            <Badge variant="danger">Nguy Hiểm</Badge>
            <Badge variant="info">Thông Tin</Badge>
          </div>
        </ComponentShowcase>

        <ComponentShowcase title="Với Chấm Trạng Thái">
          <div className="flex flex-wrap gap-3">
            <Badge variant="success" dot>
              Trực Tuyến
            </Badge>
            <Badge variant="danger" dot>
              Ngoại Tuyến
            </Badge>
            <Badge variant="warning" dot>
              Vắng Mặt
            </Badge>
          </div>
        </ComponentShowcase>

        <ComponentShowcase title="Kích Thước">
          <div className="flex flex-wrap items-center gap-3">
            <Badge size="sm">Nhỏ</Badge>
            <Badge size="md">Vừa</Badge>
            <Badge size="lg">Lớn</Badge>
          </div>
        </ComponentShowcase>
      </SectionWrapper>

      {/* Avatars Section */}
      <SectionWrapper
        title="Ảnh Đại Diện"
        badge="NHẬN DẠNG"
        description="Hiển thị người dùng với chữ viết tắt, hình ảnh và chỉ báo trạng thái."
      >
        <ComponentShowcase title="Kích Thước">
          <div className="flex items-end gap-6">
            <div className="text-center">
              <Avatar name="Minh" size="xs" />
              <p className="text-xs text-neutral-500 mt-2">XS</p>
            </div>
            <div className="text-center">
              <Avatar name="Lan" size="sm" />
              <p className="text-xs text-neutral-500 mt-2">SM</p>
            </div>
            <div className="text-center">
              <Avatar name="Đức" size="md" />
              <p className="text-xs text-neutral-500 mt-2">MD</p>
            </div>
            <div className="text-center">
              <Avatar name="Hoa" size="lg" />
              <p className="text-xs text-neutral-500 mt-2">LG</p>
            </div>
            <div className="text-center">
              <Avatar name="Nam" size="xl" />
              <p className="text-xs text-neutral-500 mt-2">XL</p>
            </div>
          </div>
        </ComponentShowcase>

        <ComponentShowcase title="Với Trạng Thái">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <Avatar name="Người Dùng" status="online" />
              <p className="text-xs text-neutral-500 mt-2">Trực Tuyến</p>
            </div>
            <div className="text-center">
              <Avatar name="Người Dùng" status="offline" />
              <p className="text-xs text-neutral-500 mt-2">Ngoại Tuyến</p>
            </div>
            <div className="text-center">
              <Avatar name="Người Dùng" status="busy" />
              <p className="text-xs text-neutral-500 mt-2">Bận</p>
            </div>
            <div className="text-center">
              <Avatar name="Người Dùng" status="away" />
              <p className="text-xs text-neutral-500 mt-2">Vắng</p>
            </div>
          </div>
        </ComponentShowcase>
      </SectionWrapper>

      {/* Icons Section */}
      <SectionWrapper
        title="Thư Viện Icon"
        badge="ĐỒ HỌA"
        description="Bộ icon toàn diện cho mọi nhu cầu giao diện, tối ưu cho độ rõ ở mọi kích thước."
      >
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
          {iconNames.map((name) => (
            <div
              key={name}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-neutral-200 cursor-pointer hover:bg-primary-50 hover:border-primary-300 transition-all duration-300"
              title={name}
            >
              <Icon
                name={name}
                size="md"
                className="text-neutral-600 group-hover:text-primary-600 transition-colors"
              />
              <span className="text-[10px] text-neutral-500 group-hover:text-primary-600 truncate w-full text-center transition-colors">
                {name}
              </span>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Chat Components Section */}
      <SectionWrapper
        title="Component Chat"
        badge="TIN NHẮN"
        description="Component giao diện hội thoại thời gian thực với chỉ báo đang gõ và text streaming."
      >
        <div className="grid lg:grid-cols-2 gap-8">
          <ComponentShowcase title="Bong Bóng Chat">
            <div className="space-y-4 bg-white rounded-2xl p-6 border border-neutral-200">
              <ChatBubble
                variant="user"
                message="Xin chào! Bạn có thể giúp tôi một công việc được không?"
                avatar={{ name: 'Người Dùng' }}
                timestamp="10:30"
              />
              <ChatBubble
                variant="assistant"
                message="Tất nhiên! Tôi sẵn lòng giúp đỡ. Bạn cần hỗ trợ gì?"
                avatar={{ name: 'AI' }}
                timestamp="10:30"
              />
              <ChatBubble variant="system" message="Cuộc hội thoại bắt đầu" />
              <ChatBubble variant="assistant" message="" isTyping avatar={{ name: 'AI' }} />
            </div>
          </ComponentShowcase>

          <ComponentShowcase title="Text Streaming">
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-neutral-700">Demo Trực Tiếp</span>
                <Button size="sm" variant="outline" onClick={() => setStreamingDemo(!streamingDemo)}>
                  {streamingDemo ? 'Đặt Lại' : 'Bắt Đầu'}
                </Button>
              </div>
              <div className="min-h-[80px] text-neutral-700 leading-relaxed">
                {streamingDemo ? (
                  <StreamingText
                    text="Xin chào! Tôi là J.A.R.V.I.S, trợ lý AI tiếng Việt của bạn. Tôi có thể giúp bạn trích xuất công việc, ghi nhớ quyết định và tìm kiếm trong lịch sử hội thoại."
                    speed={30}
                    onComplete={() => console.log('Streaming complete')}
                  />
                ) : (
                  <span className="text-neutral-400 italic">
                    Nhấn &quot;Bắt Đầu&quot; để xem animation
                  </span>
                )}
              </div>
            </div>
          </ComponentShowcase>
        </div>
      </SectionWrapper>

      {/* Feature & Stat Cards */}
      <SectionWrapper
        title="Hiển Thị Dữ Liệu"
        badge="PHÂN TÍCH"
        description="Component có sẵn để trình bày tính năng, số liệu và KPI."
      >
        <ComponentShowcase title="Thẻ Tính Năng">
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon="memory"
              title="Bộ Nhớ Dài Hạn"
              description="Ghi nhớ mọi thứ qua các phiên với lưu trữ ngữ cảnh bền vững."
            />
            <FeatureCard
              icon="sparkles"
              title="Trích Xuất AI"
              description="Tự động trích xuất công việc, deadline và quyết định từ hội thoại."
            />
            <FeatureCard
              icon="lightning"
              title="Phản Hồi Nhanh"
              description="Thời gian phản hồi dưới 3 giây với công nghệ Gemini Flash."
              badge="Nhanh"
            />
          </div>
        </ComponentShowcase>

        <ComponentShowcase title="Thẻ Thống Kê">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Tổng Người Dùng"
              value={1234}
              icon="user"
              change={{ value: 12, type: 'increase' }}
            />
            <StatCard
              label="Tin Nhắn"
              value="45.2K"
              icon="message"
              change={{ value: 8, type: 'increase' }}
            />
            <StatCard
              label="Thời Gian Phản Hồi"
              value="1.2"
              suffix="giây"
              icon="clock"
              change={{ value: 5, type: 'decrease' }}
            />
            <StatCard label="Độ Chính Xác" value={95} suffix="%" icon="check" />
          </div>
        </ComponentShowcase>
      </SectionWrapper>

      {/* Integrations Section */}
      <SectionWrapper
        title="Logo Tích Hợp"
        badge="HỆ SINH THÁI"
        description="Logo nhất quán với thương hiệu cho tất cả nền tảng và công nghệ được hỗ trợ."
      >
        <div className="flex flex-wrap gap-8 items-center">
          {(['telegram', 'lark', 'slack', 'discord', 'gemini', 'openai', 'postgresql', 'vercel'] as const).map(
            (type) => (
              <div key={type} className="group text-center">
                <div className="p-4 rounded-2xl bg-white border border-neutral-200 group-hover:border-primary-300 group-hover:shadow-lg transition-all duration-300">
                  <IntegrationLogo type={type} size="lg" />
                </div>
                <p className="text-xs text-neutral-500 mt-3 capitalize">{type}</p>
              </div>
            )
          )}
        </div>
      </SectionWrapper>

      {/* Color Palette */}
      <SectionWrapper
        title="Hệ Thống Màu"
        badge="NỀN TẢNG"
        description="Bảng màu được thiết kế cẩn thận cho phân cấp trực quan nhất quán và khả năng truy cập."
      >
        <ComponentShowcase title="Chính (AI Purple)">
          <div className="flex flex-wrap gap-2">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <div
                key={shade}
                className={`w-16 h-16 rounded-xl flex items-end justify-center pb-2 text-xs font-medium shadow-md ${
                  shade >= 500 ? 'text-white' : 'text-neutral-900'
                }`}
                style={{ backgroundColor: `var(--color-primary-${shade})` }}
              >
                {shade}
              </div>
            ))}
          </div>
        </ComponentShowcase>

        <ComponentShowcase title="Phụ (Warm Orange)">
          <div className="flex flex-wrap gap-2">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <div
                key={shade}
                className={`w-16 h-16 rounded-xl flex items-end justify-center pb-2 text-xs font-medium shadow-md ${
                  shade >= 500 ? 'text-white' : 'text-neutral-900'
                }`}
                style={{ backgroundColor: `var(--color-accent-${shade})` }}
              >
                {shade}
              </div>
            ))}
          </div>
        </ComponentShowcase>

        <ComponentShowcase title="Trung Tính">
          <div className="flex flex-wrap gap-2">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
              <div
                key={shade}
                className={`w-16 h-16 rounded-xl flex items-end justify-center pb-2 text-xs font-medium border border-neutral-200 ${
                  shade >= 500 ? 'text-white' : 'text-neutral-900'
                }`}
                style={{ backgroundColor: `var(--color-neutral-${shade})` }}
              >
                {shade}
              </div>
            ))}
          </div>
        </ComponentShowcase>
      </SectionWrapper>

      {/* Typography Section */}
      <SectionWrapper
        title="Typography"
        badge="CHỮ"
        description="Tỉ lệ chữ và font family được tối ưu cho khả năng đọc trên mọi thiết bị."
      >
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <ComponentShowcase title="Tiêu Đề (Space Grotesk)">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white border border-neutral-200">
                  <p className="text-xs text-neutral-400 mb-2">H1 - 48px Bold</p>
                  <h1 className="text-5xl font-bold text-neutral-900">Tiêu Đề Một</h1>
                </div>
                <div className="p-4 rounded-xl bg-white border border-neutral-200">
                  <p className="text-xs text-neutral-400 mb-2">H2 - 36px Bold</p>
                  <h2 className="text-4xl font-bold text-neutral-900">Tiêu Đề Hai</h2>
                </div>
                <div className="p-4 rounded-xl bg-white border border-neutral-200">
                  <p className="text-xs text-neutral-400 mb-2">H3 - 30px Bold</p>
                  <h3 className="text-3xl font-bold text-neutral-900">Tiêu Đề Ba</h3>
                </div>
                <div className="p-4 rounded-xl bg-white border border-neutral-200">
                  <p className="text-xs text-neutral-400 mb-2">H4 - 24px Semibold</p>
                  <h4 className="text-2xl font-semibold text-neutral-900">Tiêu Đề Bốn</h4>
                </div>
              </div>
            </ComponentShowcase>
          </div>

          <div>
            <ComponentShowcase title="Nội Dung (DM Sans)">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white border border-neutral-200">
                  <p className="text-xs text-neutral-400 mb-2">Lớn - 18px</p>
                  <p className="text-lg text-neutral-700">
                    Con cáo nâu nhanh nhẹn nhảy qua con chó lười. Chào mừng bạn đến với J.A.R.V.I.S.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-neutral-200">
                  <p className="text-xs text-neutral-400 mb-2">Thường - 16px</p>
                  <p className="text-base text-neutral-700">
                    Con cáo nâu nhanh nhẹn nhảy qua con chó lười. Chào mừng bạn đến với J.A.R.V.I.S.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-neutral-200">
                  <p className="text-xs text-neutral-400 mb-2">Nhỏ - 14px</p>
                  <p className="text-sm text-neutral-600">
                    Con cáo nâu nhanh nhẹn nhảy qua con chó lười. Chào mừng bạn đến với J.A.R.V.I.S.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-neutral-200">
                  <p className="text-xs text-neutral-400 mb-2">Caption - 12px</p>
                  <p className="text-xs text-neutral-500">
                    Con cáo nâu nhanh nhẹn nhảy qua con chó lười. Chào mừng bạn đến với J.A.R.V.I.S.
                  </p>
                </div>
              </div>
            </ComponentShowcase>
          </div>
        </div>
      </SectionWrapper>

      {/* Footer CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots-light opacity-20" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>

        <Container className="relative z-10 text-center">
          <Badge variant="default" className="mb-6 bg-white/20 text-white border-white/30">
            SẴN SÀNG XÂY DỰNG?
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Bắt Đầu Sử Dụng Các Component
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-xl mx-auto">
            Tất cả component được xây dựng với React, TypeScript và Tailwind CSS. Sao chép, tùy chỉnh và
            tạo giao diện đẹp.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/">
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<Icon name="arrow-left" size="sm" />}
                className="bg-white text-neutral-900 hover:bg-neutral-100"
              >
                Xem Trang Chủ
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="lg"
                rightIcon={<Icon name="arrow-right" size="sm" />}
                className="border-white/30 text-white hover:bg-white/10"
              >
                Vào Dashboard
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
