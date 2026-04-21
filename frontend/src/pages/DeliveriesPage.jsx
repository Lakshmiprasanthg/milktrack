import { useState, useEffect } from 'react';
import { formatDate } from 'date-fns';
import toast from 'react-hot-toast';
import { deliveryApi, customerApi } from '../api/client';
import { MainLayout } from '../layouts/MainLayout';
import { Card, Button, Input, Modal, Table, LoadingScreen } from '../components/UI';

export const DeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    delivered: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deliveriesRes, customersRes] = await Promise.all([
        deliveryApi.getAll({}),
        customerApi.getAll(),
      ]);

      setDeliveries(deliveriesRes.data.data);
      setCustomers(customersRes.data.data);
    } catch {
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (delivery = null) => {
    if (delivery) {
      setEditingId(delivery._id);
      setFormData({
        customerId: delivery.customerId._id,
        date: new Date(delivery.date).toISOString().split('T')[0],
        quantity: delivery.quantity,
        delivered: delivery.delivered,
      });
    } else {
      setEditingId(null);
      setFormData({
        customerId: '',
        date: new Date().toISOString().split('T')[0],
        quantity: '',
        delivered: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await deliveryApi.update(editingId, {
          quantity: parseFloat(formData.quantity),
          delivered: formData.delivered,
        });
        toast.success('Delivery updated successfully');
      } else {
        await deliveryApi.create({
          customerId: formData.customerId,
          date: new Date(formData.date),
          quantity: parseFloat(formData.quantity),
          delivered: formData.delivered,
        });
        toast.success('Delivery created successfully');
      }
      fetchData();
      handleCloseModal();
    } catch {
      toast.error('Failed to save delivery');
    }
  };

  const handleToggle = async (id) => {
    try {
      await deliveryApi.toggle(id);
      toast.success('Delivery status updated');
      fetchData();
    } catch {
      toast.error('Failed to update delivery');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this delivery?')) {
      try {
        await deliveryApi.delete(id);
        toast.success('Delivery deleted successfully');
        fetchData();
      } catch {
        toast.error('Failed to delete delivery');
      }
    }
  };

  if (loading) {
    return <LoadingScreen title="Replaying the delivery log" subtitle="Syncing the latest daily delivery entries and status markers." />;
  }

  return (
    <MainLayout>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-label mb-2">Tracking</div>
          <h1 className="page-title text-4xl sm:text-5xl">Deliveries</h1>
          <p className="page-subtitle mt-3 max-w-2xl">Log daily milk counts, toggle delivery completion, and keep duplicate entries out of the system.</p>
        </div>
        <Button onClick={() => handleOpenModal()} variant="primary" size="lg">
          + Add Delivery
        </Button>
      </div>

      <Card>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="page-title text-2xl">Delivery Registry</h2>
            <p className="page-subtitle text-sm">Use Toggle to quickly mark an entry as delivered or pending.</p>
          </div>
          <span className="chip chip-warning">Duplicate-safe</span>
        </div>
        <Table
          columns={[
            { key: 'customerId', label: 'Customer', render: (cust) => cust.name },
            { key: 'date', label: 'Date', render: (date) => formatDate(new Date(date), 'MMM dd, yyyy') },
            { key: 'quantity', label: 'Quantity (L)' },
            { key: 'delivered', label: 'Status', render: (status) => (
              <span className={`chip ${status ? 'chip-success' : 'chip-warning'}`}>
                {status ? 'Delivered' : 'Pending'}
              </span>
            )},
          ]}
          data={deliveries}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          onToggle={handleToggle}
          emptyState={
            <div className="mx-auto flex max-w-sm flex-col items-center gap-3 py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--panel-soft)] text-2xl text-[var(--primary)]">
                📦
              </div>
              <p className="text-base font-semibold text-[var(--text)]">No delivery entries yet</p>
              <p className="text-sm leading-6 text-[var(--text-muted)]">Add the first delivery to start tracking milk flow and billing.</p>
              <Button onClick={() => handleOpenModal()} variant="primary" className="mt-2">
                Add Delivery
              </Button>
            </div>
          }
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Delivery' : 'Add New Delivery'}
        footer={
          <>
            <Button onClick={handleCloseModal} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="primary">
              {editingId ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form className="grid gap-4 sm:grid-cols-2">
          {!editingId && (
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold tracking-wide text-slate-700">Customer</label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="select-surface"
                required
              >
                <option value="">Select a customer</option>
                {customers.map((cust) => (
                  <option key={cust._id} value={cust._id}>
                    {cust.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="sm:col-span-1"
            required
          />
          <Input
            label="Quantity (Litres)"
            type="number"
            placeholder="5"
            step="0.1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="sm:col-span-1"
            required
          />
          <div className="sm:col-span-2 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-4">
            <input
              type="checkbox"
              id="delivered"
              checked={formData.delivered}
              onChange={(e) => setFormData({ ...formData, delivered: e.target.checked })}
              className="h-5 w-5 rounded border-[var(--border)] bg-white text-[var(--primary)]"
            />
            <label htmlFor="delivered" className="text-sm font-semibold tracking-wide text-slate-700">
              Mark as delivered
            </label>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};
