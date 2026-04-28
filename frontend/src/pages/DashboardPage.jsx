import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { customerApi, dashboardApi, deliveryApi } from '../api/client';
import { MainLayout } from '../layouts/MainLayout';
import { Button, Card, Input, LoadingScreen, Table } from '../components/UI';

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
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerCode, setCustomerCode] = useState('');
  const [litres, setLitres] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, deliveriesRes, customersRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getTodayDeliveries(),
        customerApi.getAll(),
      ]);

      setStats(statsRes.data.data);
      setTodayDeliveries(deliveriesRes.data.data);
      setCustomers(customersRes.data.data);
    } catch {
      toast.error('Failed to load home data');
    } finally {
      setLoading(false);
    }
  };

  const customerCatalog = customers
    .filter((customer) => customer.cdNumber)
    .map((customer) => ({
      ...customer,
      code: customer.cdNumber,
    }));

  const selectedCustomer = customerCatalog.find((customer) => {
    const normalizedInput = customerCode.trim().toLowerCase();
    return (
      customer.code.toLowerCase() === normalizedInput
      || customer.name.toLowerCase() === normalizedInput
      || customer.phone.toLowerCase() === normalizedInput
    );
  });

  const totalLitresToday = todayDeliveries.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const handleQuickAddDelivery = async (event) => {
    event.preventDefault();

    if (!selectedCustomer) {
      toast.error('Enter a valid CD number or customer name');
      return;
    }

    if (!litres || Number(litres) <= 0) {
      toast.error('Enter a valid litres value');
      return;
    }

    setSubmitting(true);

    try {
      await deliveryApi.create({
        customerId: selectedCustomer._id,
        date: new Date().toISOString().split('T')[0],
        quantity: Number(litres),
        delivered: true,
      });

      toast.success('Delivery added successfully');
      setLitres('');
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add delivery');
    } finally {
      setSubmitting(false);
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
    return <LoadingScreen title="Preparing your home screen" subtitle="Fetching customers, deliveries, and today summary." />;
  }

  return (
    <MainLayout>
      <div className="mb-8 flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-label mb-2">Home</div>
          <h1 className="page-title text-3xl sm:text-4xl lg:text-5xl">Milktrack Home</h1>
          <p className="page-subtitle mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base lg:text-lg">Quickly find people, add new customers, and record daily litres from one place.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/customers" className="button-base button-secondary inline-flex items-center justify-center px-3 py-2 text-xs font-bold sm:px-5 sm:py-3 sm:text-sm">
            PPL + Pricing
          </Link>
          <Link to="/customers" className="button-base button-primary inline-flex items-center justify-center px-4 py-2 text-xs font-bold sm:px-5 sm:py-3 sm:text-sm">
            Add New Customer
          </Link>
          <Link to="/deliveries" className="button-base button-secondary inline-flex items-center justify-center px-4 py-2 text-xs font-bold sm:px-5 sm:py-3 sm:text-sm">
            Delivery List
          </Link>
        </div>
      </div>

      {stats && (
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Card className="space-y-6 sm:space-y-4">
          <div>
            <div className="section-label mb-2">Quick Delivery</div>
            <h2 className="page-title text-2xl sm:text-3xl">Add Delivery</h2>
            <p className="page-subtitle mt-2 text-sm">Use admin-assigned CD number, customer name, or phone to log litres quickly.</p>
          </div>

          <form className="grid gap-4 sm:gap-3" onSubmit={handleQuickAddDelivery}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="CD Number"
                placeholder="CD-1001"
                value={customerCode}
                onChange={(event) => setCustomerCode(event.target.value)}
                list="customer-code-list"
              />
              <Input
                label="Litres"
                type="number"
                placeholder="eg: 1.5"
                step="0.1"
                value={litres}
                onChange={(event) => setLitres(event.target.value)}
              />
            </div>

            <datalist id="customer-code-list">
              {customerCatalog.map((customer) => (
                <option key={customer._id} value={customer.code}>{customer.name}</option>
              ))}
            </datalist>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-3 sm:p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Selected Customer</p>
              <p className="mt-2 text-sm sm:text-base font-semibold text-[var(--text)]">
                {selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.phone})` : 'No customer selected'}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-3 sm:px-4 sm:py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Total Litres Today</p>
                <p className="mt-1 text-lg font-bold text-[var(--text)]">{totalLitresToday.toFixed(1)} L</p>
              </div>
              <Button type="submit" variant="primary" className="w-full px-4 sm:w-auto sm:px-6" loading={submitting}>
                Add
              </Button>
            </div>
          </form>
        </Card>

        <Card className="space-y-4">
          <div>
            <div className="section-label mb-2">Customer Codes</div>
            <h3 className="page-title text-2xl">Quick Reference</h3>
            <p className="page-subtitle mt-2 text-sm">Only admin-assigned CD numbers are shown here.</p>
          </div>
          <div className="max-h-[22rem] space-y-2 overflow-auto pr-1">
            {customerCatalog.slice(0, 12).map((customer) => (
              <div key={customer._id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{customer.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{customer.phone}</p>
                </div>
                <span className="chip chip-info">{customer.code}</span>
              </div>
            ))}
            {customerCatalog.length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">No customers with CD numbers yet. Add CD numbers from Customers page.</p>
            )}
          </div>
          <Link to="/customers" className="button-base button-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-bold">
            View All Customers
          </Link>
        </Card>
      </div>

      <Card className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="section-label mb-2">Today</div>
            <h2 className="page-title text-2xl sm:text-3xl">Today Delivery List</h2>
          </div>
          <Link to="/deliveries" className="button-base button-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-bold">
            Open Full Delivery List
          </Link>
        </div>

        <Table
          columns={[
            { key: 'customerId', label: 'Customer', render: (cust) => cust.name },
            { key: 'customerId', label: 'Phone', render: (cust) => cust.phone },
            { key: 'quantity', label: 'Litres' },
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
              <p className="text-sm leading-6 text-[var(--text-muted)]">Use the Add Delivery form above to enable delivery entries.</p>
            </div>
          }
        />
      </Card>
    </MainLayout>
  );
};
