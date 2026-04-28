import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { reportApi } from '../api/client';
import { MainLayout } from '../layouts/MainLayout';
import { Card, Button, Input, LoadingScreen } from '../components/UI';

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent }) => (
  <div
    className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 flex flex-col gap-1"
    style={accent ? { borderColor: accent + '44', background: accent + '0d' } : {}}
  >
    <p className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">{label}</p>
    <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-[var(--text)]">{value}</p>
    {sub && <p className="text-[11px] text-[var(--text-muted)] leading-tight">{sub}</p>}
  </div>
);

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ delivered }) =>
  delivered ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-600">
      ✅ Delivered
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-semibold text-rose-500">
      ❌ Missed
    </span>
  );

// ─── Custom bar tooltip ───────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3 shadow-xl text-sm">
        <p className="font-semibold text-[var(--text)] mb-1">Day {label}</p>
        <p className="text-[var(--primary)]">{payload[0].value} L</p>
      </div>
    );
  }
  return null;
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const CustomerProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportApi.getCustomerReport(id, month);
      setReport(res.data.data);
    } catch {
      toast.error('Failed to load customer report');
    } finally {
      setLoading(false);
    }
  }, [id, month]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const response = await reportApi.generateBillPdf(id, month);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bill_${report?.customer?.name ?? id}_${month}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch {
      toast.error('Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingScreen
        title="Loading customer report"
        subtitle="Crunching daily deliveries, week totals, and monthly billing…"
      />
    );
  }

  const { customer, monthly, weekly, daily, daysInMonth } = report ?? {};

  const chartData = (daily ?? []).map((d) => ({
    day: d.day,
    litres: d.delivered ? d.quantity : 0,
    delivered: d.delivered,
  }));

  const [yr, mo] = month.split('-');
  const monthLabel = new Date(Number(yr), Number(mo) - 1, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <MainLayout>
      {/* ── Back button ── */}
      <button
        type="button"
        onClick={() => navigate('/customers')}
        className="mb-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors active:scale-95"
        style={{ minHeight: '40px' }}
      >
        ← Back to Customers
      </button>

      {/* ── Page header ── */}
      <div className="mb-6">
        <div className="section-label mb-1">Customer Profile</div>
        <h1 className="page-title text-3xl sm:text-4xl leading-tight">{customer?.name}</h1>

        {/* Customer meta chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="chip chip-info text-xs">🪪 CD {customer?.cdNumber || 'Not Set'}</span>
          {customer?.phone && (
            <span className="chip chip-ghost text-xs">📞 {customer.phone}</span>
          )}
          <span className="chip chip-info text-xs">💧 ₹{Number(customer?.pricePerLitre ?? 0).toFixed(2)}/L</span>
          {customer?.address && (
            <span className="chip chip-ghost text-xs truncate max-w-[200px]">📍 {customer.address}</span>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            id="profile-month-picker"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full sm:w-44"
          />
          <Button
            id="download-pdf-btn"
            onClick={handleDownloadPdf}
            variant="primary"
            disabled={pdfLoading || !monthly?.deliveryDays}
            className="w-full sm:w-auto"
          >
            {pdfLoading ? 'Generating…' : '⬇ Download Bill PDF'}
          </Button>
        </div>
      </div>

      {/* ── Monthly stat cards ── */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Litres"
          value={`${monthly?.totalLitres ?? 0} L`}
          sub={monthLabel}
          accent="#0ea5e9"
        />
        <StatCard
          label="Total Revenue"
          value={`₹${(monthly?.totalAmount ?? 0).toFixed(2)}`}
          sub={`@ ₹${Number(customer?.pricePerLitre ?? 0).toFixed(2)}/L`}
          accent="#10b981"
        />
        <StatCard
          label="Delivered"
          value={monthly?.deliveryDays ?? 0}
          sub={`of ${daysInMonth} days`}
          accent="#f59e0b"
        />
        <StatCard
          label="Missed"
          value={monthly?.nonDeliveryDays ?? 0}
          sub="no delivery"
          accent="#ef4444"
        />
      </div>

      {/* ── Bar chart ── */}
      <Card className="mb-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="page-title text-xl sm:text-2xl">Daily Litres — {monthLabel}</h2>
            <p className="page-subtitle text-xs sm:text-sm mt-0.5">Tap a bar to highlight that day</p>
          </div>
          <span className="chip chip-info self-start sm:self-auto">{monthly?.deliveryDays ?? 0} active days</span>
        </div>

        {monthly?.deliveryDays === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--panel-soft)] text-2xl">📭</div>
            <p className="font-semibold text-[var(--text)] text-sm">No deliveries in {monthLabel}</p>
            <p className="text-xs text-[var(--text-muted)]">Record deliveries to see the chart.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="day"
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={3}
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                unit="L"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--primary)', opacity: 0.08 }} />
              <Bar dataKey="litres" radius={[5, 5, 0, 0]} maxBarSize={22}>
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.day}`}
                    fill={entry.delivered ? 'var(--primary)' : 'var(--border)'}
                    opacity={activeDay === null || activeDay === entry.day ? 1 : 0.35}
                    onClick={() => setActiveDay(activeDay === entry.day ? null : entry.day)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* ── Weekly breakdown ── */}
      <Card className="mb-6">
        <div className="mb-4">
          <h2 className="page-title text-xl sm:text-2xl">Weekly Breakdown</h2>
          <p className="page-subtitle text-xs sm:text-sm mt-0.5">{monthLabel}</p>
        </div>

        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-sm min-w-[320px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="pb-2.5 text-left text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)] font-medium">Week</th>
                <th className="pb-2.5 text-left text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)] font-medium hidden sm:table-cell">Days</th>
                <th className="pb-2.5 text-left text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)] font-medium">Delivered</th>
                <th className="pb-2.5 text-right text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)] font-medium">Litres</th>
                <th className="pb-2.5 text-right text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)] font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(weekly ?? []).map((week) => (
                <tr
                  key={week.label}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--panel-soft)] transition-colors"
                >
                  <td className="py-2.5 font-semibold text-[var(--text)] text-sm">{week.label}</td>
                  <td className="py-2.5 text-[var(--text-muted)] text-xs hidden sm:table-cell">
                    Day {week.startDay}–{week.endDay}
                  </td>
                  <td className="py-2.5">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                      ${week.deliveryDays > 0
                        ? 'bg-emerald-500/12 text-emerald-600'
                        : 'bg-[var(--panel-soft)] text-[var(--text-muted)]'}`}
                    >
                      {week.deliveryDays}/{week.totalDays}d
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-semibold text-[var(--text)] text-sm">{week.litres}L</td>
                  <td className="py-2.5 text-right font-bold text-[var(--primary)] text-sm">₹{week.amount.toFixed(2)}</td>
                </tr>
              ))}
              {/* Totals row */}
              <tr className="bg-[var(--primary)]/8">
                <td className="py-2.5 pl-1 font-extrabold text-[var(--text)] text-sm rounded-l-xl">Total</td>
                <td className="py-2.5 text-[var(--text-muted)] text-xs hidden sm:table-cell">{daysInMonth} days</td>
                <td className="py-2.5">
                  <span className="inline-flex items-center rounded-full bg-[var(--primary)]/15 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                    {monthly?.deliveryDays}/{daysInMonth}d
                  </span>
                </td>
                <td className="py-2.5 text-right font-extrabold text-[var(--text)] text-sm">{monthly?.totalLitres}L</td>
                <td className="py-2.5 pr-1 text-right font-extrabold text-[var(--primary)] text-sm rounded-r-xl">
                  ₹{(monthly?.totalAmount ?? 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Daily log ── */}
      <Card>
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h2 className="page-title text-xl sm:text-2xl">Daily Log</h2>
            <p className="page-subtitle text-xs sm:text-sm mt-0.5">
              {activeDay ? `Showing Day ${activeDay} only —` : ''} {monthLabel}
            </p>
          </div>
          {activeDay && (
            <button
              type="button"
              onClick={() => setActiveDay(null)}
              className="chip chip-ghost text-xs shrink-0"
              style={{ minHeight: '32px' }}
            >
              Clear
            </button>
          )}
        </div>

        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-sm min-w-[280px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="pb-2.5 text-left text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)] font-medium">Date</th>
                <th className="pb-2.5 text-left text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)] font-medium">Status</th>
                <th className="pb-2.5 text-right text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)] font-medium">Qty</th>
                <th className="pb-2.5 text-right text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)] font-medium">₹</th>
              </tr>
            </thead>
            <tbody>
              {(daily ?? [])
                .filter((d) => activeDay === null || d.day === activeDay)
                .map((d) => (
                  <tr
                    key={d.day}
                    className={`border-b border-[var(--border)] last:border-0 transition-colors
                      ${d.day === activeDay ? 'bg-[var(--primary)]/8' : 'hover:bg-[var(--panel-soft)]'}
                    `}
                  >
                    <td className="py-2.5 font-medium text-[var(--text)] text-xs sm:text-sm">
                      {new Date(d.date + 'T00:00:00').toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge delivered={d.delivered} />
                    </td>
                    <td className="py-2.5 text-right text-[var(--text)] text-sm">
                      {d.delivered ? `${d.quantity}L` : '—'}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-[var(--text)] text-sm">
                      {d.delivered ? `₹${d.amount.toFixed(2)}` : '—'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="h-4" />
    </MainLayout>
  );
};
