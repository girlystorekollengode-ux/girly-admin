import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Table from '../components/ui/Table.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import RevenueChart from '../components/charts/RevenueChart.jsx';
import OrderStatusChart from '../components/charts/OrderStatusChart.jsx';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Clock,
  AlertTriangle,
  Eye,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [wishlistStats, setWishlistStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsRes, ordersRes, stockRes, wishlistRes] = await Promise.all([
          api.get('/orders/stats'),
          api.get('/orders'), // Admin route fetches all orders
          api.get('/products?stock[lte]=5&isActive=true'), // Low stock filter
          api.get('/products/wishlist-stats'),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (ordersRes.data.success) setOrders(ordersRes.data.data);
        if (stockRes.data.success) setLowStockProducts(stockRes.data.data);
        if (wishlistRes.data.success) setWishlistStats(wishlistRes.data.data);
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Safe Fallback defaults
  const totalRevenue = stats?.totalRevenue || 0;
  const todayRevenue = stats?.todayRevenue || 0;
  const todayOrders = stats?.todayOrders || 0;
  const statusCounts = stats?.statusCounts || {};
  const totalOrders = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const pendingOrders = statusCounts.pending || 0;

  // Process 30 Days Revenue Chart Data
  const process30DaysData = () => {
    const data = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

      const dayOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getDate() === d.getDate() &&
          orderDate.getMonth() === d.getMonth() &&
          orderDate.getFullYear() === d.getFullYear() &&
          order.paymentStatus === 'paid'
        );
      });

      const dayRevenue = dayOrders.reduce((sum, o) => sum + o.finalAmount, 0);

      data.push({
        date: dateStr,
        revenue: dayRevenue,
      });
    }
    return data;
  };

  // Process Pie Chart Data
  const processPieData = () => {
    return Object.keys(statusCounts).map((status) => ({
      name: status,
      value: statusCounts[status],
    }));
  };

  // Helper formatting currencies
  const formatCurrency = (val) => {
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  // Table Columns config
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
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">{row.user?.name || 'Guest'}</span>
          <span className="text-[10px] text-gray-500">{row.user?.email || ''}</span>
        </div>
      ),
    },
    {
      header: 'Amount',
      cell: (row) => (
        <span className="font-semibold text-primary">{formatCurrency(row.finalAmount)}</span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => {
        const variants = {
          pending: 'warning',
          confirmed: 'info',
          processing: 'primary',
          shipped: 'warning',
          delivered: 'success',
          cancelled: 'error',
        };
        return <Badge variant={variants[row.orderStatus] || 'primary'}>{row.orderStatus}</Badge>;
      },
    },
    {
      header: 'Date',
      cell: (row) => (
        <span className="text-gray-500">
          {new Date(row.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Action',
      cell: (row) => (
        <Link
          to={`/admin/orders/${row._id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer"
        >
          <Eye size={14} />
          <span>View</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Stats Row Card Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* widget 1 */}
        <Card className="flex items-center gap-4 relative overflow-hidden border-l-4 border-l-primary">
          <div className="p-3 bg-primary-50 rounded-xl text-primary">
            <IndianRupee size={24} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-2xl font-black text-gray-800">
              {formatCurrency(totalRevenue)}
            </span>
            <span className="text-xs text-gray-500 font-medium mt-0.5">All time revenue</span>
          </div>
        </Card>

        {/* widget 2 */}
        <Card className="flex items-center gap-4 relative overflow-hidden border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
            <ShoppingBag size={24} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-2xl font-black text-gray-800">{totalOrders}</span>
            <span className="text-xs text-gray-500 font-medium mt-0.5">All time orders</span>
          </div>
        </Card>

        {/* widget 3 */}
        <Card className="flex items-center gap-4 relative overflow-hidden border-l-4 border-l-green-500">
          <div className="p-3 bg-green-50 rounded-xl text-green-500">
            <TrendingUp size={24} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-2xl font-black text-gray-800">
              {formatCurrency(todayRevenue)}
            </span>
            <span className="text-[10px] text-gray-500 font-semibold mt-0.5">
              Today's earnings ({todayOrders} orders)
            </span>
          </div>
        </Card>

        {/* widget 4 */}
        <Card className="flex items-center gap-4 relative overflow-hidden border-l-4 border-l-amber-500">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-500 animate-pulse">
            <Clock size={24} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-2xl font-black text-gray-800">{pendingOrders}</span>
            <span className="text-xs text-gray-500 font-medium mt-0.5">Pending orders</span>
          </div>
        </Card>
      </div>

      {/* 2. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Area Line Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-md font-bold text-gray-800 font-playfair">Revenue Overview</h3>
            <span className="text-xs text-gray-400 font-medium">Last 30 Days</span>
          </div>
          <RevenueChart data={process30DaysData()} />
        </Card>

        {/* Right Pie status Chart */}
        <Card>
          <div className="mb-6 text-left">
            <h3 className="text-md font-bold text-gray-800 font-playfair">Order Statuses</h3>
            <p className="text-xs text-gray-400 mt-0.5">Breakdown of orders progress</p>
          </div>
          {Object.keys(statusCounts).length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              No orders recorded yet.
            </div>
          ) : (
            <OrderStatusChart data={processPieData()} />
          )}
        </Card>
      </div>

      {/* 3. Bottom Grid: Recent Sales & Low Stock List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-gray-800 font-playfair">Recent Orders</h3>
            <Link
              to="/admin/orders"
              className="inline-flex items-center text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              <span>Manage all</span>
              <ChevronRight size={14} />
            </Link>
          </div>
          <Table
            columns={columns}
            data={orders.slice(0, 10)}
            emptyMessage="No orders found yet"
          />
        </div>

        {/* Low Stock Indicators & Wishlist statistics */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="text-left">
              <h3 className="text-md font-bold text-gray-800 font-playfair">Inventory Warnings</h3>
            </div>
            {lowStockProducts.length === 0 ? (
              <Card className="flex items-center justify-center p-8 border-green-200 bg-green-50/50">
                <span className="text-xs font-semibold text-green-700">
                  All products are sufficiently stocked! 🍀
                </span>
              </Card>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {lowStockProducts.map((prod) => (
                  <Card
                    key={prod._id}
                    padding="p-4"
                    className="flex items-center justify-between border-l-4 border-l-red-500 bg-red-50/20"
                  >
                    <div className="flex flex-col text-left max-w-[70%]">
                      <span className="text-xs font-bold text-gray-800 truncate">{prod.name}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
                        {prod.category?.name || 'Category'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                        <AlertTriangle size={10} />
                        {prod.stock} Left
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-primary-100">
            <div className="text-left">
              <h3 className="text-md font-bold text-gray-800 font-playfair flex items-center gap-1.5">
                <span>Top Liked Products</span>
                <span className="text-[10px] text-primary bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100 font-bold">
                  Wishlist Stats
                </span>
              </h3>
            </div>
            {wishlistStats.length === 0 ? (
              <Card className="flex items-center justify-center p-6 bg-primary-50/20">
                <span className="text-xs font-semibold text-gray-500">
                  No wishlisted items yet.
                </span>
              </Card>
            ) : (
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {wishlistStats.map((item) => (
                  <Card
                    key={item.product?._id}
                    padding="p-3"
                    className="flex items-center justify-between border-l-4 border-l-primary bg-primary-50/10 hover:bg-primary-50/20 transition-all"
                  >
                    <div className="flex items-center gap-2 max-w-[70%]">
                      <img
                        src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/50'}
                        alt={item.product?.name}
                        className="w-8 h-8 object-cover rounded-md border border-gray-150"
                      />
                      <div className="flex flex-col text-left truncate">
                        <span className="text-xs font-bold text-gray-800 truncate">{item.product?.name}</span>
                        <span className="text-[10px] text-gray-450">
                          ₹{(item.product?.discountPrice || item.product?.price || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                        ❤ {item.count} Likes
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
