import { useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Package, ShoppingCart, LayoutDashboard, LogOut, Tag, Layers, FolderTree, Megaphone, Image, LayoutGrid, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const AdminLayout = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!adminLoading && !isAdmin && user) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/categories', icon: FolderTree, label: 'Categories' },
    { path: '/admin/collections', icon: Layers, label: 'Collections' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/offers', icon: Tag, label: 'Offers' },
    { path: '/admin/coupons', icon: Tag, label: 'Coupons' },
    { path: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
    { path: '/admin/hero-slides', icon: Image, label: 'Hero Slides' },
    { path: '/admin/editorial-grid', icon: LayoutGrid, label: 'Editorial Grid' },
    { path: '/admin/returns', icon: RotateCcw, label: 'Returns' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border relative">
        <div className="p-6">
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
        </div>
        <nav className="px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
