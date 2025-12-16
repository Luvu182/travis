'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Loader2, AlertTriangle, ArrowLeft, Eye, EyeOff, Lock, User, Check } from 'lucide-react';
import { signup, signupWithGoogle } from './actions';
import { Input, Button, Icon, Container } from '@/components/ui';

const passwordRequirements = [
  { label: 'Ít nhất 8 ký tự', check: (p: string) => p.length >= 8 },
  { label: 'Có chữ hoa', check: (p: string) => /[A-Z]/.test(p) },
  { label: 'Có chữ thường', check: (p: string) => /[a-z]/.test(p) },
  { label: 'Có số', check: (p: string) => /[0-9]/.test(p) },
];

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const isPasswordValid = passwordRequirements.every((req) => req.check(password));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsRateLimited(false);

    if (!name.trim()) {
      setError('Vui lòng nhập họ tên');
      setIsLoading(false);
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Vui lòng nhập email hợp lệ');
      setIsLoading(false);
      return;
    }
    if (!isPasswordValid) {
      setError('Mật khẩu chưa đạt yêu cầu');
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setIsLoading(false);
      return;
    }
    if (!agreedToTerms) {
      setError('Vui lòng đồng ý với điều khoản sử dụng');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signup(name, email, password);

      if (result.rateLimited) {
        setIsRateLimited(true);
        setError(result.error || 'Quá nhiều lần đăng ký');
      } else if (!result.success) {
        setError(result.error || 'Đăng ký thất bại');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 bg-dots-light">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-100">
        <Container>
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500 rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center text-white shadow-lg shadow-primary-500/25">
                  <Icon name="sparkles" size="sm" />
                </div>
              </div>
              <span className="text-xl font-bold text-neutral-900">J.A.R.V.I.S</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-neutral-500 hover:text-neutral-700 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Về Trang Chủ
            </Link>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <Container className="py-12 lg:py-16">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Tạo Tài Khoản</h1>
            <p className="text-neutral-600">Bắt đầu sử dụng J.A.R.V.I.S miễn phí</p>
          </div>

          {/* Signup Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  className={`p-4 text-sm rounded-xl flex items-start gap-3 ${
                    isRateLimited
                      ? 'text-amber-700 bg-amber-50 border border-amber-200'
                      : 'text-red-700 bg-red-50 border border-red-200'
                  }`}
                >
                  {isRateLimited && <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />}
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="Họ và tên"
                type="text"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                leftIcon={<User className="h-4 w-4" />}
                fullWidth
              />

              <Input
                label="Email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                leftIcon={<Mail className="h-4 w-4" />}
                fullWidth
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-700">Mật khẩu</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tạo mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Password requirements */}
                {password && (
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {passwordRequirements.map((req, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-1.5 text-xs ${
                          req.check(password) ? 'text-green-600' : 'text-neutral-400'
                        }`}
                      >
                        <Check className={`h-3 w-3 ${req.check(password) ? 'opacity-100' : 'opacity-40'}`} />
                        {req.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-700">Xác nhận mật khẩu</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                      confirmPassword && confirmPassword !== password
                        ? 'border-red-300'
                        : 'border-neutral-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-500">Mật khẩu không khớp</p>
                )}
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-600">
                  Tôi đồng ý với{' '}
                  <Link href="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                    Điều khoản sử dụng
                  </Link>{' '}
                  và{' '}
                  <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                    Chính sách bảo mật
                  </Link>
                </span>
              </label>

              <Button type="submit" fullWidth size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng ký...
                  </>
                ) : (
                  'Đăng Ký'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-neutral-500">hoặc tiếp tục với</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <form action={signupWithGoogle}>
              <Button type="submit" variant="outline" fullWidth size="lg">
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Tiếp tục với Google
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-neutral-600">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
