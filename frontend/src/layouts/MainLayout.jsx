import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/UI';

const navItems = [
  { to: '/', label: 'Home', icon: '🏠', isActive: (path) => path === '/' || path === '/dashboard' },
  { to: '/customers', label: 'Customers', icon: '👥', isActive: (path) => path.startsWith('/customers') },
  { to: '/deliveries', label: 'Deliveries', icon: '🚚', isActive: (path) => path.startsWith('/deliveries') },
  { to: '/reports', label: 'Reports', icon: '📄', isActive: (path) => path.startsWith('/reports') },
];

export const MainLayout = ({ children }) => {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const activeNavIndex = Math.max(0, navItems.findIndex((item) => item.isActive(location.pathname)));
  const [previousNavIndex, setPreviousNavIndex] = useState(activeNavIndex);
  const [milkTransfer, setMilkTransfer] = useState({
    from: activeNavIndex,
    to: activeNavIndex,
    active: false,
  });

  useEffect(() => {
    if (previousNavIndex === activeNavIndex) {
      return;
    }

    setMilkTransfer({
      from: previousNavIndex,
      to: activeNavIndex,
      active: true,
    });

    const timer = window.setTimeout(() => {
      setMilkTransfer((value) => ({ ...value, active: false }));
    }, 620);

    setPreviousNavIndex(activeNavIndex);

    return () => window.clearTimeout(timer);
  }, [activeNavIndex, previousNavIndex]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="flex min-h-screen">
        <aside className={`milk-sidebar hidden lg:flex ${isSidebarOpen ? 'milk-sidebar-open' : ''}`}>
          <div className="mb-8 flex items-center gap-3">
            <span className="brand-mark text-lg">🥛</span>
            <div>
              <p className="text-sm font-extrabold tracking-tight text-[var(--text)]">Digital Milk Book</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--primary)]/80">Dairy Console</p>
            </div>
          </div>

          <nav className="milk-nav space-y-2" style={{ '--milk-cart-index': activeNavIndex }}>
            <span
              className={`milk-transfer ${milkTransfer.active ? 'milk-transfer-active' : ''}`}
              aria-hidden="true"
              style={{
                '--milk-start-row': Math.min(milkTransfer.from, milkTransfer.to),
                '--milk-span-rows': Math.abs(milkTransfer.to - milkTransfer.from),
                '--milk-distance-rows': milkTransfer.to - milkTransfer.from,
              }}
            >
              <span className="milk-transfer-drop" />
            </span>
            <span className="milk-route-cart" aria-hidden="true">
              <svg viewBox="0 0 64 64" className="milk-cart-svg" role="presentation" focusable="false">
                <rect x="10" y="21" width="34" height="5" rx="2.5" fill="#1e293b" />
                <path d="M44 23h8l5 13H23z" fill="#0ea5e9" opacity="0.94" />
                <rect x="26" y="17" width="9" height="13" rx="2" fill="#f8fafc" stroke="#93c5fd" strokeWidth="1.5" />
                <path d="M28 21h5" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="22" cy="41" r="6.2" fill="#334155" />
                <circle cx="22" cy="41" r="2.2" fill="#cbd5e1" />
                <circle cx="48" cy="41" r="6.2" fill="#334155" />
                <circle cx="48" cy="41" r="2.2" fill="#cbd5e1" />
                <path d="M34 32v8" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
                <circle cx="34" cy="43" r="2.2" fill="#f8fafc" />
              </svg>
            </span>
            {navItems.map((item) => {
              const active = item.isActive(location.pathname);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsSidebarOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}
                >
                  <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                  {active && <span className="milk-active-dot" aria-hidden="true" />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">Signed in as</p>
            <p className="mt-2 text-sm font-semibold text-[var(--text)]">{admin?.name || admin?.email || 'Admin'}</p>
            <Button variant="ghost" size="sm" className="mt-4 w-full" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col pb-24 sm:pb-20 lg:pb-0">
          <main className="relative z-10 mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {children}
          </main>
          
          <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-[var(--border)] bg-[var(--bg)] px-1 py-1 lg:hidden">
            {navItems.map((item) => {
              const active = item.isActive(location.pathname);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[56px] text-xs sm:text-sm font-semibold transition-colors ${active ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}
                >
                  <span className="text-lg sm:text-xl">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};
