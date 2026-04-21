import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { reportApi, customerApi } from '../api/client';
import { MainLayout } from '../layouts/MainLayout';
import { Card, Button, Input, Table, LoadingScreen } from '../components/UI';

export const ReportsPage = () => {
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [summaries, setSummaries] = useState([]);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      const response = await reportApi.getMonthlySummary(month);
      setSummaries(response.data.data.summaries);
      setTotals(response.data.data.totals);
    };

    const loadCustomers = async () => {
      try {
        await customerApi.getAll();
      } catch {
        console.error('Failed to load customers');
      }
    };

    loadReports()
      .catch(() => {
        toast.error('Failed to load reports');
      })
      .finally(() => {
        setLoading(false);
      });

    loadCustomers();
  }, [month]);
  const handleGeneratePdf = async (customerId, customerName) => {
    try {
      const response = await reportApi.generateBillPdf(customerId, month);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bill_${customerName}_${month}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully');
    } catch {
      toast.error('Failed to generate PDF');
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await reportApi.generateMonthlyCsv(month);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${month}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  if (loading) {
    return <LoadingScreen title="Preparing monthly billing" subtitle="Calculating litres, revenue, and customer bill summaries." />;
  }

  return (
    <MainLayout>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-label mb-2">Analytics</div>
          <h1 className="page-title text-4xl sm:text-5xl">Monthly Reports</h1>
          <p className="page-subtitle mt-3 max-w-2xl">Switch month, export CSV, and generate customer bills without leaving the billing workspace.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-44"
          />
          <Button onClick={handleExportCsv} variant="success" size="lg">
            Export CSV
          </Button>
        </div>
      </div>

      {/* Totals Summary */}
      {totals && (
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="text-center">
            <p className="section-label">Total Litres</p>
            <p className="mt-3 text-4xl font-extrabold text-[var(--text)]">{totals.totalLitres}L</p>
          </Card>
          <Card className="text-center">
            <p className="section-label">Delivery Days</p>
            <p className="mt-3 text-4xl font-extrabold text-[var(--text)]">{totals.totalDeliveryDays}</p>
          </Card>
          <Card className="text-center">
            <p className="section-label">Total Revenue</p>
            <p className="mt-3 text-4xl font-extrabold text-[var(--text)]">₹{totals.totalAmount.toFixed(2)}</p>
          </Card>
        </div>
      )}

      {/* Customer-wise Details */}
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="page-title text-2xl">Customer-wise Billing</h2>
            <p className="page-subtitle text-sm">Tap any row action to download the customer PDF bill.</p>
          </div>
          <span className="chip chip-info">Month: {month}</span>
        </div>
        <Table
          columns={[
            { key: 'customerName', label: 'Customer Name' },
            { key: 'phone', label: 'Phone' },
            { key: 'totalLitres', label: 'Total Litres' },
            { key: 'deliveryDays', label: 'Delivery Days' },
            { key: 'nonDeliveryDays', label: 'Non-Delivery Days' },
            { key: 'pricePerLitre', label: 'Price/L (₹)' },
            { key: 'totalAmount', label: 'Total Amount (₹)', render: (amount) => amount.toFixed(2) },
          ]}
          data={summaries.map((summary) => ({
            ...summary,
            _id: summary.customerId,
          }))}
          onEdit={(row) => handleGeneratePdf(row.customerId, row.customerName)}
          emptyState={
            <div className="mx-auto flex max-w-sm flex-col items-center gap-3 py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--panel-soft)] text-2xl text-[var(--primary)]">
                🧾
              </div>
              <p className="text-base font-semibold text-[var(--text)]">No billing data for this month</p>
              <p className="text-sm leading-6 text-[var(--text-muted)]">Once deliveries exist for the selected month, customer bills will appear here.</p>
            </div>
          }
        />
      </Card>

      <div className="mt-8 text-center text-sm text-[var(--text-muted)]">
        <p>
          Click "Edit" to download individual customer PDF bills
        </p>
      </div>
    </MainLayout>
  );
};
