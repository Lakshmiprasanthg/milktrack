import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { customerApi, dashboardApi, reportApi } from '../api/client';
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
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [reportMonth, setReportMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerReport, setCustomerReport] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

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

  const customerCatalog = customers.map((customer) => ({
    ...customer,
    code: customer.cdNumber || `CD-${customer._id.slice(-4).toUpperCase()}`,
  }));

  const matchedCustomer = customerCatalog.find((customer) => {
    const normalizedInput = searchTerm.trim().toLowerCase();
    return (
      customer.code.toLowerCase() === normalizedInput
      || customer._id.toLowerCase() === normalizedInput
      || customer.name.toLowerCase() === normalizedInput
      || customer.phone.toLowerCase() === normalizedInput
    );
  });

  const loadCustomerReport = async (customerId, month) => {
    setReportLoading(true);
    try {
      const response = await reportApi.getCustomerReport(customerId, month);
      setCustomerReport(response.data.data);
    } catch {
      toast.error('Failed to load customer report');
      setCustomerReport(null);
    } finally {
      setReportLoading(false);
    }
  };

  const handleLookupCustomer = async (event) => {
    event.preventDefault();

    if (!matchedCustomer) {
      toast.error('Enter a valid CD number, phone, or customer name');
      return;
    }

    try {
      setLookupLoading(true);
      setSelectedCustomer(matchedCustomer);
      await loadCustomerReport(matchedCustomer._id, reportMonth);
      toast.success(`Loaded ${matchedCustomer.name}`);
    } catch {
      toast.error('Failed to open customer details');
    } finally {
      setLookupLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerReport(selectedCustomer._id, reportMonth);
    }
  }, [reportMonth]);

  const openProfile = () => {
    if (selectedCustomer) {
      navigate(`/customers/${selectedCustomer._id}`);
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

      <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-6 sm:space-y-4">
          <div>
            <div className="section-label mb-2">Customer Lookup</div>
            <h2 className="page-title text-2xl sm:text-3xl">Find Customer Details</h2>
            <p className="page-subtitle mt-2 text-sm">Enter a saved CD number, phone number, or customer name to open the customer profile and monthly report.</p>
          </div>

          <form className="grid gap-4 sm:gap-3" onSubmit={handleLookupCustomer}>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input
                label="CD Number or Customer Name"
                placeholder="CD-1001 or Rajesh Kumar"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                list="customer-code-list"
              />
              <Button type="submit" variant="primary" className="w-full sm:w-auto px-5 sm:px-6" loading={lookupLoading}>
                Search
              </Button>
            </div>

            <datalist id="customer-code-list">
              {customerCatalog.map((customer) => (
                <option key={customer._id} value={customer.code}>{customer.name}</option>
              ))}
              {customerCatalog.map((customer) => (
                <option key={`${customer._id}-name`} value={customer.name}>{customer.code}</option>
              ))}
            </datalist>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-3 sm:p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Matched Customer</p>
                {matchedCustomer && <span className="chip chip-info">{matchedCustomer.code}</span>}
              </div>
              <p className="mt-2 text-sm sm:text-base font-semibold text-[var(--text)]">
                {matchedCustomer ? matchedCustomer.name : 'No customer matched yet'}
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {matchedCustomer ? `${matchedCustomer.phone} • ${matchedCustomer.address}` : 'Search by code or name to load the customer report.'}
              </p>
            </div>
          </form>

          {selectedCustomer && reportLoading && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4 text-sm text-[var(--text-muted)]">
              Loading customer report...
            </div>
          )}

          {selectedCustomer && customerReport && (
            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Litres" value={`${customerReport.monthly.totalLitres}L`} icon="🥛" accent="warm" />
                <StatCard label="Revenue" value={`₹${customerReport.monthly.totalAmount.toFixed(2)}`} icon="💰" accent="rich" />
                <StatCard label="Delivered Days" value={customerReport.monthly.deliveryDays} icon="📦" accent="calm" />
                <StatCard label="Missed Days" value={customerReport.monthly.nonDeliveryDays} icon="📅" accent="neutral" />
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="section-label mb-1">Customer Report</p>
                    <h3 className="page-title text-xl sm:text-2xl">{customerReport.customer.name}</h3>
                    <p className="page-subtitle mt-2 text-sm">{customerReport.customer.address}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="chip chip-info">CD {customerReport.customer.cdNumber || matchedCustomer.code}</span>
                    <span className="chip chip-ghost">₹{Number(customerReport.customer.pricePerLitre).toFixed(2)}/L</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Phone</p>
                    <p className="mt-1 font-semibold text-[var(--text)]">{customerReport.customer.phone}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Month</p>
                    <Input type="month" value={reportMonth} onChange={(event) => setReportMonth(event.target.value)} className="mt-1" />
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Button type="button" variant="primary" className="w-full sm:w-auto" onClick={openProfile}>
                    Open Full Profile
                  </Button>
                  <Link to="/customers" className="button-base button-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-bold w-full sm:w-auto">
                    View Customers Page
                  </Link>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border)] bg-white/70">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 text-sm">
                    {customerReport.weekly.slice(0, 4).map((week) => (
                      <div key={week.label} className="border-r border-b border-[var(--border)] p-3 last:border-r-0 sm:last:border-r">
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">{week.label}</p>
                        <p className="mt-1 font-semibold text-[var(--text)]">{week.deliveryDays}/{week.totalDays} days</p>
                        <p className="text-sm text-[var(--text-muted)]">{week.litres}L • ₹{week.amount.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!selectedCustomer && (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel-soft)] p-4 text-sm text-[var(--text-muted)]">
              Search a customer to see the monthly report and open their full customer profile.
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <div>
            <div className="section-label mb-2">Customer Codes</div>
            <h3 className="page-title text-2xl">Quick Reference</h3>
            <p className="page-subtitle mt-2 text-sm">Saved CD numbers from the customer directory.</p>
          </div>
          <div className="max-h-[24rem] space-y-2 overflow-auto pr-1">
            {customerCatalog.slice(0, 12).map((customer) => (
              <button key={customer._id} type="button" onClick={async () => {
                setSearchTerm(customer.code);
                setSelectedCustomer(customer);
                await loadCustomerReport(customer._id, reportMonth);
              }} className="flex w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-2 text-left transition hover:bg-white/90">
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{customer.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{customer.phone}</p>
                </div>
                <span className="chip chip-info">{customer.code}</span>
              </button>
            ))}
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
              <p className="text-sm leading-6 text-[var(--text-muted)]">Delivery entry now lives on the Deliveries page. Use the customer lookup above for reports.</p>
            </div>
          }
        />
      </Card>
    </MainLayout>
  );
};
