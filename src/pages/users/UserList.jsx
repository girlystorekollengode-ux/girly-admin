import React, { useState, useEffect } from 'react';
import api from '../../api/axios.js';
import Badge from '../../components/ui/Badge.jsx';
import Table from '../../components/ui/Table.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import { Users, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected user details modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Search/Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, banned

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  // Ban dialog
  const [banUserObj, setBanUserObj] = useState(null);
  const [banLoading, setBanLoading] = useState(false);

  // Debounce search input (400ms)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearch(searchTerm);
      setPage(1);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleViewDetails = async (userId) => {
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/users/${userId}`);
      if (data.success) {
        setSelectedUser(data.data);
      }
    } catch (error) {
      console.error('Error fetching user detail:', error);
      toast.error('Failed to load customer profile details');
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load user accounts');
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error loading orders totals:', error);
    }
  };

  const initData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchOrders()]);
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, []);

  // Aggregate user purchases
  const getUserOrdersCount = (userId) => {
    return orders.filter((o) => {
      const uId = o.user?._id || o.user;
      return uId === userId;
    }).length;
  };

  // Perform ban/unban
  const handleBanToggle = async () => {
    if (!banUserObj) return;
    setBanLoading(true);
    try {
      const { data } = await api.put(`/users/${banUserObj._id}/ban`);
      if (data.success) {
        const action = data.data.isBanned ? 'banned' : 'unbanned';
        toast.success(`User ${banUserObj.name} has been ${action}`);
        setBanUserObj(null);
        fetchUsers(); // Refresh
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update ban status');
    } finally {
      setBanLoading(false);
    }
  };

  // Filter clients on the frontend
  const filteredUsers = users.filter((user) => {
    // Search keyword
    const matchName = user.name.toLowerCase().includes(search.toLowerCase());
    const matchEmail = user.email.toLowerCase().includes(search.toLowerCase());
    if (search && !matchName && !matchEmail) return false;

    // Status filter
    if (statusFilter === 'active' && user.isBanned) return false;
    if (statusFilter === 'banned' && !user.isBanned) return false;

    return true;
  });

  // Split pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const columns = [
    {
      header: 'Avatar',
      cell: (row) => (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary font-bold text-xs">
          {getInitials(row.name)}
        </div>
      ),
    },
    {
      header: 'Customer Details',
      cell: (row) => (
        <button
          onClick={() => handleViewDetails(row._id)}
          className="flex flex-col text-left cursor-pointer group focus:outline-none"
        >
          <span className="font-bold text-primary group-hover:text-primary-dark transition-colors">{row.name}</span>
          <span className="text-[10px] text-gray-500 font-medium">{row.email}</span>
        </button>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone',
      cell: (row) => <span className="font-semibold text-gray-700">{row.phone || 'N/A'}</span>,
    },
    {
      header: 'Role',
      cell: (row) => (
        <Badge variant={row.role === 'admin' ? 'primary' : 'info'}>
          {row.role.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Joined Date',
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
      header: 'Orders Paid',
      cell: (row) => (
        <span className="font-bold text-primary">{getUserOrdersCount(row._id)} orders</span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.isBanned ? 'error' : 'success'}>
          {row.isBanned ? 'Banned' : 'Active'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => {
        if (row.role === 'admin') return null; // Protect admins
        return (
          <button
            onClick={() => setBanUserObj(row)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
              row.isBanned
                ? 'border-green-600 text-green-600 bg-transparent hover:bg-green-50'
                : 'border-red-600 text-red-600 bg-transparent hover:bg-red-50'
            }`}
          >
            {row.isBanned ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
            <span>{row.isBanned ? 'Unban Account' : 'Ban Account'}</span>
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-left">
          <h2 className="text-xl font-bold text-gray-800">Users</h2>
          <Badge variant="primary">{filteredUsers.length} Total</Badge>
        </div>
      </div>

      {/* Filter Row card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-primary-100 shadow-pink-sm text-left">
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
            Search name or email
          </label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email..."
              className="w-full pl-9 pr-3 py-1.5 border border-primary-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Status selection */}
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
            Account Status
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
            <option value="active">Active accounts only</option>
            <option value="banned">Banned accounts only</option>
          </select>
        </div>
      </div>

      {/* Users table */}
      <Table
        columns={columns}
        data={paginatedUsers}
        loading={loading}
        emptyMessage="No customer accounts match filter settings"
      />

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Ban Confirm dialog */}
      <ConfirmDialog
        isOpen={banUserObj !== null}
        onClose={() => setBanUserObj(null)}
        onConfirm={handleBanToggle}
        title={banUserObj?.isBanned ? 'Unban Account?' : 'Ban Account?'}
        message={
          banUserObj?.isBanned
            ? `Are you sure you want to unban ${banUserObj?.name}? They will regain access to their account features.`
            : `Are you sure you want to ban ${banUserObj?.name}? They will be locked out of checkouts and account access.`
        }
        confirmLabel={banUserObj?.isBanned ? 'Unban' : 'Ban'}
        loading={banLoading}
      />

      {/* User Detail Loading overlay */}
      {detailLoading && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-white p-4 rounded-2xl shadow-lg flex items-center gap-3">
            <Spinner size="md" />
            <span className="text-xs font-semibold text-gray-700">Loading profile details...</span>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-primary-100 shadow-pink-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 relative text-left">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer text-lg font-bold"
            >
              ✕
            </button>
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h3 className="font-playfair text-xl font-bold text-primary">
                  Customer Profile
                </h3>
                <p className="text-xs text-gray-400">
                  Detailed active sessions and account records
                </p>
              </div>

              {/* General info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-primary-50/30 p-4 rounded-2xl border border-primary-100/50">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Name</span>
                  <span className="text-sm font-bold text-gray-800">{selectedUser.user.name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Email Address</span>
                  <span className="text-sm font-semibold text-gray-700">{selectedUser.user.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Phone Number</span>
                  <span className="text-sm font-semibold text-gray-700">{selectedUser.user.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Account Role</span>
                  <span className="text-xs font-bold text-primary mt-1 inline-block bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-100">
                    {selectedUser.user.role.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Saved Addresses */}
              <div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  Saved Address Book
                </h4>
                {!selectedUser.user.addresses || selectedUser.user.addresses.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No addresses saved</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedUser.user.addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className={`p-3 rounded-xl border text-xs relative ${
                          addr.isDefault
                            ? 'border-primary bg-primary-50/20'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        {addr.isDefault && (
                          <span className="absolute top-2 right-2 bg-primary text-[8px] text-white px-1.5 py-0.5 rounded-full font-bold">
                            DEFAULT
                          </span>
                        )}
                        <span className="font-bold text-gray-800 block mb-1">
                          {addr.label}
                        </span>
                        <p className="text-gray-500 leading-relaxed">
                          {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Cart */}
              <div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span>Current Cart Contents</span>
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {selectedUser.cart?.reduce((acc, c) => acc + c.qty, 0) || 0} Items
                  </span>
                </h4>
                {!selectedUser.cart || selectedUser.cart.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">User's cart is empty</p>
                ) : (
                  <div className="border border-gray-150 rounded-2xl overflow-hidden divide-y divide-gray-150">
                    {selectedUser.cart.map((item) => (
                      <div key={item._id} className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50/50">
                        <img
                          src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/60'}
                          alt={item.product?.name}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                        />
                        <div className="flex-1 text-xs">
                          <span className="font-bold text-gray-800 block truncate max-w-sm">
                            {item.product?.name}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Size: <span className="font-semibold text-gray-600">{item.size || 'N/A'}</span> | Color: <span className="font-semibold text-gray-600">{item.color || 'N/A'}</span>
                          </span>
                        </div>
                        <div className="text-right text-xs">
                          <span className="text-gray-500 font-medium block">Qty: {item.qty}</span>
                          <span className="font-bold text-primary">
                            ₹{((item.product?.discountPrice || item.product?.price || 0) * item.qty).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span>Wishlist Items</span>
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {selectedUser.user.wishlist?.length || 0} Likes
                  </span>
                </h4>
                {!selectedUser.user.wishlist || selectedUser.user.wishlist.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">User's wishlist is empty</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedUser.user.wishlist.map((product) => (
                      <div key={product._id} className="flex items-center gap-3 p-2 border border-gray-150 rounded-xl bg-white">
                        <img
                          src={product.images?.[0]?.url || 'https://via.placeholder.com/60'}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                        />
                        <div className="flex-1 text-xs truncate">
                          <span className="font-bold text-gray-800 block truncate">{product.name}</span>
                          <span className="font-bold text-primary">
                            ₹{(product.discountPrice || product.price || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
