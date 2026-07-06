import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import Badge from '../../components/ui/Badge.jsx';
import Table from '../../components/ui/Table.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { Eye, Search, Calendar, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchId, setSearchId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders');
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update orderStatus in real time
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      if (data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        
        // Update local state list
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  // Perform client-side filter computation
  const filteredOrders = orders.filter((order) => {
    // Monospace ID matching
    if (searchId && !order._id.toLowerCase().includes(searchId.toLowerCase())) {
      return false;
    }
    // Status matching
    if (statusFilter !== 'all' && order.orderStatus !== statusFilter) {
      return false;
    }
    // Date from matching
    if (fromDate) {
      const start = new Date(fromDate);
      start.setHours(0, 0, 0, 0);
      if (new Date(order.createdAt) < start) return false;
    }
    // Date to matching
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      if (new Date(order.createdAt) > end) return false;
    }
    return true;
  });

  // Split pages
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Table columns mapping config
  const columns = [
    {
      header: 'Order ID',
      cell: (row) => (
        <span className="font-mono text-xs font-semibold text-gray-700">
          #{row._id.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Customer',
      cell: (row) => (
        <div className="flex flex-col text-left">
          <span className="font-bold text-gray-800">{row.user?.name || 'Guest Customer'}</span>
          <span className="text-[10px] text-gray-500 font-medium">{row.user?.email || ''}</span>
        </div>
      ),
    },
    {
      header: 'Items Summary',
      cell: (row) => {
        const count = row.orderItems?.length || 0;
        const firstItem = row.orderItems?.[0]?.productName || 'Product';
        return (
          <div className="text-left max-w-[180px]">
            <span className="text-xs font-semibold text-gray-700 truncate block">
              {firstItem}
            </span>
            {count > 1 && (
              <span className="text-[10px] text-gray-400 font-bold">
                + {count - 1} other items
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Amount',
      cell: (row) => (
        <span className="font-black text-primary">
          ₹{row.finalAmount.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Payment',
      cell: (row) => {
        const variants = {
          paid: 'success',
          pending: 'warning',
          failed: 'error',
        };
        return <Badge variant={variants[row.paymentStatus] || 'primary'}>{row.paymentStatus}</Badge>;
      },
    },
    {
      header: 'Order Status',
      cell: (row) => (
        <select
          value={row.orderStatus}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          className="px-3 py-1 border border-primary-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/45 bg-white cursor-pointer"
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      ),
    },
    {
      header: 'Date',
      cell: (row) => (
        <span className="text-xs text-gray-500">
          {new Date(row.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'View Details',
      cell: (row) => (
        <Link to={`/admin/orders/${row._id}`}>
          <button className="p-1.5 bg-primary-50 hover:bg-primary-100 text-primary rounded-lg transition-colors cursor-pointer">
            <Eye size={14} />
          </button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-left">
          <h2 className="text-xl font-bold text-gray-800">Orders</h2>
          <Badge variant="primary">{filteredOrders.length} Total</Badge>
        </div>
      </div>

      {/* Filters card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-primary-100 shadow-pink-sm text-left">
        {/* Search */}
        <div className="relative">
          <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
            Search ID
          </label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="e.g. 64d9fa..."
              className="w-full pl-9 pr-3 py-1.5 border border-primary-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
            Status
          </label>
          <select
            className="w-full px-3 py-1.5 border border-primary-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white appearance-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
            From Date
          </label>
          <input
            type="date"
            className="w-full px-3 py-1.5 border border-primary-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white cursor-pointer"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Date To */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
            To Date
          </label>
          <input
            type="date"
            className="w-full px-3 py-1.5 border border-primary-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white cursor-pointer"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <Table
        columns={columns}
        data={paginatedOrders}
        loading={loading}
        emptyMessage="No orders found matching search criteria"
      />

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
};

export default OrderList;
