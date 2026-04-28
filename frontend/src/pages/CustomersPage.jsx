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
        cdNumber: customer.cdNumber || '',
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
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="page-title text-2xl">Customer Directory</h2>
            <p className="page-subtitle text-sm">Total customers: {customers.length}</p>
          </div>
          <span className="chip chip-info">Live CRUD</span>
        </div>
        <Table
          columns={[
            { key: 'cdNumber', label: 'CD Number', render: (code) => code || 'Not Set' },
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
          data={customers}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          emptyState={
            <div className="mx-auto flex max-w-sm flex-col items-center gap-3 py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--panel-soft)] text-2xl text-[var(--primary)]">
                👤
              </div>
              <p className="text-base font-semibold text-[var(--text)]">No customers added yet</p>
              <p className="text-sm leading-6 text-[var(--text-muted)]">Create a customer profile to begin recording deliveries and billing accurately.</p>
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
            placeholder="CD-1001"
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
            placeholder="+91-9876543210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
