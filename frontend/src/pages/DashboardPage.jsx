import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { dashboardApi, deliveryApi } from '../api/client';
import { MainLayout } from '../layouts/MainLayout';
import { Card, Table, LoadingScreen } from '../components/UI';

const sparkHeights = [22, 38, 28, 52, 34, 44];

const StatCard = ({ label, value, icon, accent = 'neutral' }) => {
  const accentStyles = {
    neutral: 'from-[var(--primary)] to-[var(--primary-strong)]',
    calm: 'from-sky-300 to-[var(--primary)]',
    warm: 'from-amber-200 to-amber-500',
    rich: 'from-slate-300 to-[var(--brand-deep)]',
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-4 top-4 text-5xl opacity-20">{icon}</div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-label">{label}</p>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--text)]">{value}</p>
        </div>
        <div className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-[var(--text-muted)]">
          Live
        </div>
      </div>

      <div className="mt-5 flex items-end gap-1.5">
        {sparkHeights.map((height, index) => (
          <span
            key={`${label}-${index}`}
            className={`w-full max-w-[10px] rounded-full bg-gradient-to-t ${accentStyles[accent]}`}
            style={{ height: `${height + (index % 3) * 6}px`, opacity: index % 2 === 0 ? 1 : 0.78 }}
          />
        ))}
      </div>
      <div className="mt-4 h-1.5 w-24 rounded-full bg-[var(--panel-soft)]">
        <div className={`h-full w-14 rounded-full bg-gradient-to-r ${accentStyles[accent]}`} />
      </div>
    </Card>
  );
};

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, deliveriesRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getTodayDeliveries(),
      ]);

      setStats(statsRes.data.data);
      setTodayDeliveries(deliveriesRes.data.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDelivery = async (id) => {
    try {
      await deliveryApi.toggle(id);
      fetchData();
      toast.success('Delivery status updated');
    } catch {
      toast.error('Failed to update delivery');
    }
  };

  if (loading) {
    return <LoadingScreen title="Assembling your dashboard" subtitle="Fetching customer, delivery, and revenue signals for today." />;
  }

  return (
    <MainLayout>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-label mb-2">Command Center</div>
          <h1 className="page-title text-4xl sm:text-5xl">Dashboard</h1>
          <p className="page-subtitle mt-3 max-w-2xl text-base sm:text-lg">
            Monitor customers, today's deliveries, and current month revenue from one polished control panel.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/customers" className="button-base button-secondary inline-flex items-center justify-center px-5 py-3 text-sm font-bold">
            Manage Customers
          </Link>
          <Link to="/deliveries" className="button-base button-primary inline-flex items-center justify-center px-5 py-3 text-sm font-bold">
            Record Delivery
          </Link>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
          <StatCard
            label="Total Customers"
            value={stats.totalCustomers}
            icon="👥"
            accent="calm"
          />
          <StatCard
            label="Today's Deliveries"
            value={stats.todayDeliveries}
            icon="📦"
            accent="neutral"
          />
          <StatCard
            label="Today's Litres"
            value={`${stats.todayQuantity}L`}
            icon="🥛"
            accent="warm"
          />
          <StatCard
            label="Today's Revenue"
            value={`₹${stats.todayRevenue.toFixed(2)}`}
            icon="💰"
            accent="rich"
          />
        </div>
      )}

      <Card className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="section-label mb-2">Today</div>
            <h2 className="page-title text-2xl sm:text-3xl">Today's Deliveries</h2>
          </div>
          <Link to="/deliveries" className="button-base button-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-bold">
            View Full Log
          </Link>
        </div>

        <Table
          columns={[
            { key: 'customerId', label: 'Customer', render: (cust) => cust.name },
            { key: 'customerId', label: 'Phone', render: (cust) => cust.phone },
            { key: 'quantity', label: 'Quantity (L)' },
            { key: 'delivered', label: 'Status', render: (status) => (
              <span className={`chip ${status ? 'chip-success' : 'chip-warning'}`}>
                {status ? 'Delivered' : 'Pending'}
              </span>
            )},
          ]}
          data={todayDeliveries}
          onToggle={handleToggleDelivery}
          emptyState={
            <div className="mx-auto flex max-w-sm flex-col items-center gap-3 py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--panel-soft)] text-2xl text-[var(--primary)]">
                🫙
              </div>
              <p className="text-base font-semibold text-[var(--text)]">No deliveries logged today</p>
              <p className="text-sm leading-6 text-[var(--text-muted)]">Create the first delivery entry to populate this view.</p>
              <Link to="/deliveries" className="button-base button-primary mt-2 inline-flex items-center justify-center px-4 py-2 text-sm font-bold">
                Add Delivery
              </Link>
            </div>
          }
        />
      </Card>
    </MainLayout>
  );
};
