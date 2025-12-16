'use client';

import Link from 'next/link';
import { Container, Icon, Badge } from '@/components/ui';

const footerLinks = {
  product: [
    { label: 'Tính Năng', href: '#features' },
    { label: 'Cách Hoạt Động', href: '#how-it-works' },
    { label: 'Tích Hợp', href: '#integrations' },
    { label: 'Giá', href: '#pricing' },
  ],
  resources: [
    { label: 'Tài Liệu', href: '#' },
    { label: 'API', href: '#' },
    { label: 'Trạng Thái', href: '#' },
    { label: 'Nhật Ký Thay Đổi', href: '#' },
  ],
  company: [
    { label: 'Về Chúng Tôi', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Tuyển Dụng', href: '#' },
    { label: 'Liên Hệ', href: '#' },
  ],
  legal: [
    { label: 'Chính Sách Bảo Mật', href: '#' },
    { label: 'Điều Khoản Sử Dụng', href: '#' },
    { label: 'Bảo Mật', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-neutral-50 bg-dots-light border-t border-neutral-200">
      {/* Main footer content */}
      <Container>
        <div className="py-12 grid md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Icon name="sparkles" size="sm" className="text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-neutral-900 block">J.A.R.V.I.S</span>
                <span className="text-xs text-neutral-500">Trợ Lý AI Thông Minh</span>
              </div>
            </Link>
            <p className="text-neutral-600 mb-5 max-w-xs text-sm leading-relaxed">
              Trợ lý AI tiếng Việt với bộ nhớ dài hạn cho Telegram và Lark Suite.
            </p>

            {/* Social links */}
            <div className="flex gap-2">
              <a
                href="https://t.me/jarvis_assistant_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white border border-neutral-200 hover:border-sky-300 hover:bg-sky-50 flex items-center justify-center transition-all"
              >
                <Icon name="telegram" size="sm" className="text-neutral-600" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white border border-neutral-200 hover:border-blue-300 hover:bg-blue-50 flex items-center justify-center transition-all"
              >
                <Icon name="lark" size="sm" className="text-neutral-600" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white border border-neutral-200 hover:border-neutral-400 flex items-center justify-center transition-all"
              >
                <Icon name="github" size="sm" className="text-neutral-600" />
              </a>
            </div>
          </div>

          {/* Links columns */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4 text-sm">Sản Phẩm</h4>
            <ul className="space-y-2.5">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 mb-4 text-sm">Tài Nguyên</h4>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 mb-4 text-sm">Công Ty</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 mb-4 text-sm">Pháp Lý</h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} J.A.R.V.I.S. Bảo lưu mọi quyền.
          </p>

          <div className="flex items-center gap-4">
            <Badge
              variant="success"
              size="sm"
              className="bg-emerald-50 text-emerald-700 border-emerald-200"
            >
              Hệ Thống Hoạt Động Bình Thường
            </Badge>
            <p className="text-sm text-neutral-500">Made with ❤️ in Vietnam</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
