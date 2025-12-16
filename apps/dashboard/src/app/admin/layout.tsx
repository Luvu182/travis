import { AdminSidebar } from '@/components/admin/sidebar';
import { Header } from '@/components/dashboard/header';
import { requireAdmin } from '@/lib/rbac';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side admin check
  await requireAdmin();

  return (
    <div className="flex h-screen bg-neutral-100">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden bg-neutral-100">
          {children}
        </main>
      </div>
    </div>
  );
}
