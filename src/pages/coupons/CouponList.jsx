import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios.js';
import Button from '../../components/ui/Button.jsx';
import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import { Ticket, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal forms management
  const [modalOpen, setModalOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirms
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const codeValue = watch('code');
  const discountType = watch('discountType');

  // Auto uppercase Coupon code
  useEffect(() => {
    if (codeValue) {
      setValue('code', codeValue.toUpperCase());
    }
  }, [codeValue, setValue]);

  // Pre-fill form fields on edit
  useEffect(() => {
    if (editCoupon) {
      reset({
        code: editCoupon.code,
        discountType: editCoupon.discountType,
        value: editCoupon.value,
        minOrderAmount: editCoupon.minOrderAmount,
        maxUses: editCoupon.maxUses || '',
        expiryDate: editCoupon.expiryDate
          ? new Date(editCoupon.expiryDate).toISOString().split('T')[0]
          : '',
        isActive: editCoupon.isActive !== undefined ? editCoupon.isActive : true,
      });
    } else {
      reset({
        code: '',
        discountType: 'percent',
        value: '',
        minOrderAmount: '',
        maxUses: '',
        expiryDate: '',
        isActive: true,
      });
    }
  }, [editCoupon, modalOpen, reset]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/coupons');
      if (data.success) {
        setCoupons(data.data);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Submit Modal details
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        code: data.code,
        discountType: data.discountType,
        value: Number(data.value),
        minOrderAmount: Number(data.minOrderAmount) || 0,
        maxUses: data.maxUses ? Number(data.maxUses) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        isActive: data.isActive,
      };

      let response;
      if (editCoupon?._id) {
        response = await api.put(`/coupons/${editCoupon._id}`, payload);
      } else {
        response = await api.post('/coupons', payload);
      }

      if (response.data.success) {
        toast.success(`Coupon ${editCoupon?._id ? 'updated' : 'created'} successfully!`);
        setModalOpen(false);
        fetchCoupons();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit coupon details');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle active inline
  const handleToggleActive = async (coupon) => {
    const updatedStatus = !coupon.isActive;
    
    // Optimistic UI updates
    setCoupons((prev) =>
      prev.map((c) => (c._id === coupon._id ? { ...c, isActive: updatedStatus } : c))
    );

    try {
      await api.put(`/coupons/${coupon._id}`, { isActive: updatedStatus });
      toast.success(`Coupon ${coupon.code} visibility toggled`);
    } catch (error) {
      // Revert on failure
      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: !updatedStatus } : c))
      );
      toast.error('Failed to toggle coupon status');
    }
  };

  // Delete Coupon action
  const handleDeleteCoupon = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const { data } = await api.delete(`/coupons/${deleteId}`);
      if (data.success) {
        toast.success('Coupon removed successfully');
        setDeleteId(null);
        fetchCoupons();
      }
    } catch (error) {
      toast.error('Failed to remove coupon');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditClick = (coupon) => {
    setEditCoupon(coupon);
    setModalOpen(true);
  };

  const handleAddClick = () => {
    setEditCoupon(null);
    setModalOpen(true);
  };

  const columns = [
    {
      header: 'Code',
      cell: (row) => (
        <span className="font-mono text-sm font-bold text-primary tracking-wide">
          {row.code}
        </span>
      ),
    },
    {
      header: 'Discount Type',
      cell: (row) => (
        <Badge variant={row.discountType === 'percent' ? 'primary' : 'success'}>
          {row.discountType === 'percent' ? 'PERCENT %' : 'FLAT ₹'}
        </Badge>
      ),
    },
    {
      header: 'Value',
      cell: (row) => (
        <span className="font-bold text-gray-800">
          {row.discountType === 'percent' ? `${row.value}%` : `₹${row.value}`}
        </span>
      ),
    },
    {
      header: 'Min Order',
      cell: (row) => (
        <span className="font-medium text-gray-700">₹{row.minOrderAmount.toLocaleString('en-IN')}</span>
      ),
    },
    {
      header: 'Uses Count',
      cell: (row) => (
        <span className="text-xs font-semibold text-gray-600">
          {row.usedCount} / {row.maxUses || '∞'}
        </span>
      ),
    },
    {
      header: 'Expiry Date',
      cell: (row) => (
        <span className="text-xs text-gray-500">
          {row.expiryDate
            ? new Date(row.expiryDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : 'No Expiry'}
        </span>
      ),
    },
    {
      header: 'Active',
      cell: (row) => (
        <button
          onClick={() => handleToggleActive(row)}
          className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
            row.isActive ? 'bg-primary' : 'bg-gray-300'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              row.isActive ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditClick(row)}
            className="p-1.5 bg-primary-50 hover:bg-primary-100 text-primary rounded-lg transition-colors cursor-pointer"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => setDeleteId(row._id)}
            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-left">
          <h2 className="text-xl font-bold text-gray-800">Coupons</h2>
          <Badge variant="primary">{coupons.length} Total</Badge>
        </div>
        <Button variant="primary" onClick={handleAddClick} className="inline-flex items-center gap-2">
          <Plus size={16} />
          <span>Create Coupon</span>
        </Button>
      </div>

      {/* Table grid listing */}
      <Table
        columns={columns}
        data={coupons}
        loading={loading}
        emptyMessage="No coupons registered"
      />

      {/* Add / Edit coupon dialog */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCoupon?._id ? 'Edit Coupon' : 'Create Coupon'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          {/* Code */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-700 mb-1.5 pl-1">
              Coupon Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. GIRLY50"
              className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white ${
                errors.code ? 'border-red-500 ring-2 ring-red-100' : 'border-primary-200'
              }`}
              {...register('code', {
                required: 'Coupon code is required',
                pattern: { value: /^[A-Z0-9]+$/i, message: 'Only alphanumeric characters allowed' },
              })}
            />
            {errors.code && (
              <span className="text-xs text-red-500 mt-1 pl-1">{errors.code.message}</span>
            )}
          </div>

          {/* Discount Type Radio selections */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-700 mb-1.5 pl-1">
              Discount Type <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  value="percent"
                  checked={discountType === 'percent'}
                  className="accent-primary"
                  {...register('discountType', { required: true })}
                />
                Percent (%) Discount
              </label>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  value="flat"
                  checked={discountType === 'flat'}
                  className="accent-primary"
                  {...register('discountType', { required: true })}
                />
                Flat Amount (₹) Discount
              </label>
            </div>
          </div>

          {/* Discount Value & Min Order Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-700 mb-1.5 pl-1">
                Discount Value <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder={discountType === 'percent' ? '10' : '200'}
                className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white ${
                  errors.value ? 'border-red-500 ring-2 ring-red-100' : 'border-primary-200'
                }`}
                {...register('value', {
                  required: 'Discount value is required',
                  min: { value: 1, message: 'Discount value must be at least 1' },
                  validate: (value) =>
                    discountType === 'percent'
                       ? Number(value) <= 100 || 'Percentage discount cannot exceed 100%'
                       : Number(value) > 0 || 'Flat discount must be greater than 0',
                })}
              />
              {errors.value && (
                <span className="text-xs text-red-500 mt-1 pl-1">
                  {errors.value.message}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-700 mb-1.5 pl-1">
                Min Order Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="499"
                className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white ${
                  errors.minOrderAmount ? 'border-red-500 ring-2 ring-red-100' : 'border-primary-200'
                }`}
                {...register('minOrderAmount', {
                  required: 'Min order amount is required',
                  min: { value: 0, message: 'Minimum amount cannot be negative' },
                })}
              />
              {errors.minOrderAmount && (
                <span className="text-xs text-red-500 mt-1 pl-1">
                  {errors.minOrderAmount.message}
                </span>
              )}
            </div>
          </div>

          {/* Max Uses & Expiry Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-700 mb-1.5 pl-1">
                Max Uses (Blank = Unlimited)
              </label>
              <input
                type="number"
                placeholder="100"
                className="w-full px-4 py-2 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                {...register('maxUses')}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-700 mb-1.5 pl-1">
                Expiry Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white cursor-pointer"
                {...register('expiryDate')}
              />
            </div>
          </div>

          {/* Active status */}
          <div className="flex items-center justify-between border-t border-primary-50 pt-4">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-800">Coupon Active Status</span>
              <span className="text-[10px] text-gray-500">Enable apply checkouts for customers</span>
            </div>
            <button
              type="button"
              onClick={() => setValue('isActive', !watch('isActive'))}
              className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                watch('isActive') ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  watch('isActive') ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Dialog Action buttons */}
          <div className="flex items-center gap-3 pt-3">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting} className="w-1/2">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} className="w-1/2">
              {editCoupon?._id ? 'Save Changes' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirms */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteCoupon}
        title="Delete Coupon?"
        message="Are you sure you want to delete this coupon? Customers will no longer be able to claim discount benefits using this code during checkout."
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

export default CouponList;
