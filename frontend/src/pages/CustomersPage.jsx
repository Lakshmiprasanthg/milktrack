import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { customerApi } from '../api/client';
import { MainLayout } from '../layouts/MainLayout';
import { Card, Button, Input, Modal, Table, LoadingScreen } from '../components/UI';

export const CustomersPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    cdNumber: '',
    name: '',
    phone: '',
    address: '',
    pricePerLitre: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await customerApi.getAll();
      setCustomers(response.data.data);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setEditingId(customer._id);
      setFormData({
        cdNumber: customer.cdNumber ?? '',
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        pricePerLitre: customer.pricePerLitre,
      });
    } else {
      setEditingId(null);
      setFormData({ cdNumber: '', name: '', phone: '', address: '', pricePerLitre: '' });
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
        await customerApi.update(editingId, formData);
        toast.success('Customer updated successfully');
      } else {
        await customerApi.create(formData);
        toast.success('Customer created successfully');
      }
      fetchCustomers();
      handleCloseModal();
    } catch {
      toast.error('Failed to save customer');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerApi.delete(id);
        toast.success('Customer deleted successfully');
        fetchCustomers();
      } catch {
        toast.error('Failed to delete customer');
      }
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      customer.name?.toLowerCase().includes(query)
      || String(customer.cdNumber ?? '').toLowerCase().includes(query)
    );
  });

  if (loading) {
    return <LoadingScreen title="Loading customer profiles" subtitle="Pulling addresses, pricing, and contact records into the directory." />;
  }

  return (
    <MainLayout>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-label mb-2">Customer Universe</div>
          <h1 className="page-title text-4xl sm:text-5xl">Customers</h1>
          <p className="page-subtitle mt-3 max-w-2xl">Keep addresses, pricing, and contact details tidy so billing stays accurate and fast.</p>
        </div>
        <Button onClick={() => handleOpenModal()} variant="primary" size="lg">
          + Add Customer
        </Button>
      </div>

      <Card>
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="page-title text-2xl">Customer Directory</h2>
            <p className="page-subtitle text-sm">
              Showing {filteredCustomers.length} of {customers.length} customers
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-end lg:w-auto">
            <div className="w-full sm:min-w-[22rem] lg:w-[24rem]">
              <label className="mb-1.5 block text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Search customers
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-2.5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition focus-within:border-[var(--primary)] focus-within:bg-white focus-within:shadow-[0_18px_40px_rgba(14,165,233,0.12)]">
                <span className="text-base text-[var(--text-muted)]" aria-hidden="true">⌕</span>
                <input
                  type="search"
                  placeholder="Name or CD number"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="rounded-full px-2 py-1 text-xs font-bold text-[var(--text-muted)] transition hover:bg-white hover:text-[var(--text)]"
                    aria-label="Clear search"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <span className="chip chip-info self-start sm:self-end">Live CRUD</span>
          </div>
        </div>
        <Table
          columns={[
            { key: 'cdNumber', label: 'CD Number', render: (code) => (code ?? 'Not Set') },
            {
              key: 'name',
              label: 'Name',
              render: (name, row) => (
                <button
                  type="button"
                  onClick={() => navigate(`/customers/${row._id}`)}
                  className="text-left font-semibold text-[var(--primary)] transition hover:text-[var(--primary-strong)] hover:underline"
                >
                  {name}
                </button>
              ),
            },
            { key: 'phone', label: 'Phone' },
            { key: 'address', label: 'Address' },
            { key: 'pricePerLitre', label: 'Price/L (₹)' },
          ]}
          data={filteredCustomers}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          emptyState={
            <div className="mx-auto flex max-w-sm flex-col items-center gap-3 py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--panel-soft)] text-2xl text-[var(--primary)]">
                👤
              </div>
              <p className="text-base font-semibold text-[var(--text)]">
                {searchTerm.trim() ? 'No matching customers found' : 'No customers added yet'}
              </p>
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                {searchTerm.trim()
                  ? 'Try searching with a different name or CD number.'
                  : 'Create a customer profile to begin recording deliveries and billing accurately.'}
              </p>
              <Button onClick={() => handleOpenModal()} variant="primary" className="mt-2">
                Add First Customer
              </Button>
            </div>
          }
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Customer' : 'Add New Customer'}
        footer={
          <>
            <Button onClick={handleCloseModal} variant="secondary" className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="primary" className="w-full sm:w-auto">
              {editingId ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form className="grid gap-4 sm:grid-cols-2">
          <Input
            label="CD Number"
            type="number"
            inputMode="numeric"
            placeholder="1001"
            value={formData.cdNumber}
            onChange={(e) => setFormData({ ...formData, cdNumber: e.target.value })}
            required
          />
          <Input
            label="Name"
            placeholder="Customer name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Phone"
            type="tel"
            inputMode="tel"
            placeholder="+91-9876543210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9+\s-]/g, '') })}
            onBlur={() => {
              const digits = String(formData.phone || '').replace(/\D/g, '');
              if (digits.length === 10) {
                setFormData({ ...formData, phone: `+91${digits}` });
              } else if (digits.length === 12 && digits.startsWith('91')) {
                setFormData({ ...formData, phone: `+${digits}` });
              }
            }}
            required
          />
          <Input
            label="Address"
            placeholder="Customer address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="sm:col-span-2"
            required
          />
          <Input
            label="Price Per Litre (₹)"
            type="number"
            placeholder="80"
            step="0.01"
            value={formData.pricePerLitre}
            onChange={(e) => setFormData({ ...formData, pricePerLitre: parseFloat(e.target.value) })}
            className="sm:col-span-2"
            required
          />
        </form>
      </Modal>
    </MainLayout>
  );
};
