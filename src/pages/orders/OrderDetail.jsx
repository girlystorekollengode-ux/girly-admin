import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios.js';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { ChevronLeft, Printer, ShoppingBag, User, MapPin, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/${id}`);
      if (data.success) {
        setOrder(data.data);
        setSelectedStatus(data.data.orderStatus);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrderDetail();
  }, [id]);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      const { data } = await api.put(`/orders/${id}/status`, { orderStatus: selectedStatus });
      if (data.success) {
        toast.success(`Order status updated to ${selectedStatus}`);
        setOrder((prev) => ({ ...prev, orderStatus: selectedStatus }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) return null;

  // Process timelines
  const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStepIdx = steps.indexOf(order.orderStatus.toLowerCase());

  const getStepColor = (idx) => {
    if (idx <= currentStepIdx) {
      if (order.orderStatus === 'cancelled') return 'text-red-500 bg-red-100 border-red-500';
      return 'text-primary bg-primary-100 border-primary';
    }
    return 'text-gray-400 bg-gray-100 border-gray-300';
  };

  const getTimelineDate = (step) => {
    // If delivering/shipping has timestamps (can default to createdAt if not explicitly stored)
    if (step === 'pending') {
      return new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return '';
  };

  const formatCurrency = (val) => {
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top action links */}
      <div className="flex items-center justify-between no-print">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-primary transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back to orders list</span>
        </Link>

        <Button variant="outline" size="sm" onClick={() => window.print()} className="inline-flex items-center gap-2">
          <Printer size={14} />
          <span>Print Invoice</span>
        </Button>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Order Details (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Identity Card */}
          <Card className="text-left space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-primary-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">
                  ORDER REFERENCE
                </span>
                <h3 className="text-lg font-black text-gray-800 font-mono">
                  #{order._id.toUpperCase()}
                </h3>
                <span className="text-xs text-gray-400">
                  Placed on {new Date(order.createdAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    order.orderStatus === 'delivered'
                      ? 'success'
                      : order.orderStatus === 'cancelled'
                      ? 'error'
                      : 'warning'
                  }
                >
                  {order.orderStatus.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Change Status Form */}
            <div className="flex flex-wrap items-center gap-3 bg-primary-50/40 p-4 rounded-xl border border-primary-100 no-print">
              <span className="text-xs font-bold text-gray-700">Update Order State:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 border border-primary-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/45 bg-white cursor-pointer"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button variant="primary" size="sm" onClick={handleUpdateStatus} loading={updating}>
                Update
              </Button>
            </div>

            {/* Purchased Items List */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest block">
                Purchased Items
              </h4>
              <div className="divide-y divide-primary-100 border-t border-b border-primary-100 py-2">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || 'https://via.placeholder.com/50'}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded-lg border border-primary-100"
                      />
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-semibold text-gray-800">
                          {item.productName}
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                          Size: {item.size || 'N/A'} | Color: {item.color || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-800 block">
                        {formatCurrency(item.price * item.qty)}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">
                        {item.qty} x {formatCurrency(item.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Details & Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Payment references */}
              <div className="text-left space-y-2.5">
                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Payment References
                </h5>
                <div className="space-y-1.5 text-xs text-gray-600 font-medium">
                  <p>
                    Method: <span className="font-bold text-gray-800 capitalize">{order.paymentMethod}</span>
                  </p>
                  <p>
                    Payment Status:{' '}
                    <span
                      className={`font-bold capitalize ${
                        order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-500'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </p>
                  {order.paymentId && (
                    <p className="font-mono text-[10px]">
                      Razorpay Txn: {order.paymentId}
                    </p>
                  )}
                </div>
              </div>

              {/* Price aggregates */}
              <div className="text-left bg-primary-50/20 p-4 rounded-xl border border-primary-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
                  <span>Subtotal MRP:</span>
                  <span>{formatCurrency(order.totalPrice + (order.discount || 0))}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex items-center justify-between text-xs text-red-500 font-medium">
                    <span>Discount:</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                {order.couponDiscount > 0 && (
                  <div className="flex items-center justify-between text-xs text-red-500 font-medium">
                    <span>Coupon ({order.couponCode || 'PROMO'}):</span>
                    <span>-{formatCurrency(order.couponDiscount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
                  <span>Shipping Fee:</span>
                  <span>{order.shippingPrice === 0 ? 'FREE' : formatCurrency(order.shippingPrice)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-primary-100 pt-2 text-md font-bold text-primary">
                  <span>Final Paid:</span>
                  <span>{formatCurrency(order.finalAmount)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Customer Address & Timelines (1/3 width) */}
        <div className="space-y-6">
          {/* Customer Address Details */}
          <Card className="text-left space-y-4">
            <h3 className="text-sm font-bold text-primary font-playfair border-b border-primary-100 pb-2 flex items-center gap-1.5">
              <User size={16} />
              <span>Customer Information</span>
            </h3>

            {order.user ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-800">{order.user.name}</p>
                <p className="text-xs text-gray-500 font-medium">{order.user.email}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">Guest Customer</p>
            )}

            {/* Address box */}
            {order.shippingAddress && (
              <div className="pt-2 space-y-2 border-t border-primary-50">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <MapPin size={10} />
                  Delivery Location
                </span>
                <div className="text-xs text-gray-700 leading-relaxed font-medium">
                  <p className="font-bold text-gray-800">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.addressLine}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                  <p className="font-bold">PIN: {order.shippingAddress.postalCode}</p>
                  <p className="text-primary font-bold mt-1 text-[10px]">
                    Phone: {order.shippingAddress.phone || order.phone || 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Delivery Timeline checklist tracker */}
          <Card className="text-left space-y-4">
            <h3 className="text-sm font-bold text-primary font-playfair border-b border-primary-100 pb-2 flex items-center gap-1.5">
              <Clock size={16} />
              <span>Order Journey</span>
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-primary-100">
              {steps.map((step, idx) => {
                const completed = idx <= currentStepIdx;
                return (
                  <div key={step} className="relative flex flex-col items-start">
                    {/* Bullet marker */}
                    <div
                      className={`absolute -left-6 top-1 w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-all ${getStepColor(
                        idx
                      )}`}
                    >
                      {completed ? <CheckCircle size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>

                    {/* Step Name */}
                    <span
                      className={`text-xs font-bold capitalize ${
                        completed ? 'text-gray-800' : 'text-gray-400'
                      }`}
                    >
                      {step}
                    </span>
                    <span className="text-[9px] text-gray-400 font-semibold">{getTimelineDate(step)}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
