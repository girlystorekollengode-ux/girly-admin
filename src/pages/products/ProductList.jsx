import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios.js';
import Button from '../../components/ui/Button.jsx';
import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import { Search, Plus, Edit, Trash2, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // loading & dialog states
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounce search input (400ms)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearch(searchTerm);
      setPage(1); // Reset page on search
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Fetch Categories on mount for dropdown filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products list
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
      };
      if (search) params.keyword = search;
      if (selectedCategory) params.category = selectedCategory;
      if (statusFilter === 'active') params.isActive = true;
      if (statusFilter === 'inactive') params.isActive = false;

      const { data } = await api.get('/products', { params });
      if (data.success) {
        setProducts(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalProducts(data.pagination.totalProducts);
      }
    } catch (error) {
      console.error('Error fetching products list:', error);
      toast.error('Failed to load products inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, selectedCategory, statusFilter]);

  // Toggle Featured state
  const handleToggleFeatured = async (product) => {
    const updatedStatus = !product.isFeatured;
    
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p._id === product._id ? { ...p, isFeatured: updatedStatus } : p))
    );

    try {
      const { data } = await api.patch(`/products/${product._id}/featured`);
      if (data.success) {
        toast.success(`${product.name} featured state toggled`);
      }
    } catch (error) {
      // Revert on failure
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, isFeatured: !updatedStatus } : p))
      );
      toast.error('Failed to update featured state');
    }
  };

  // Toggle Active state
  const handleToggleActive = async (product) => {
    const updatedStatus = !product.isActive;
    
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p._id === product._id ? { ...p, isActive: updatedStatus } : p))
    );

    try {
      const { data } = await api.patch(`/products/${product._id}/active`);
      if (data.success) {
        toast.success(`${product.name} visibility toggled`);
      }
    } catch (error) {
      // Revert on failure
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, isActive: !updatedStatus } : p))
      );
      toast.error('Failed to update product visibility');
    }
  };

  // Delete product action
  const handleDeleteProduct = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const { data } = await api.delete(`/products/${deleteId}`);
      if (data.success) {
        toast.success('Product deleted successfully');
        setDeleteId(null);
        fetchProducts(); // Refresh list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Setup table columns mapping
  const columns = [
    {
      header: 'Image',
      cell: (row) => (
        <img
          src={row.images?.[0]?.url || 'https://via.placeholder.com/40'}
          alt={row.name}
          className="w-10 h-10 object-cover rounded-lg border border-primary-100"
          loading="lazy"
        />
      ),
    },
    {
      header: 'Product Name',
      cell: (row) => (
        <div className="flex flex-col text-left max-w-[200px]">
          <span className="font-bold text-gray-800 truncate" title={row.name}>
            {row.name}
          </span>
          <span className="text-[10px] text-gray-500 font-medium">
            {row.category?.name || 'No Category'}
          </span>
        </div>
      ),
    },
    {
      header: 'Price',
      cell: (row) => (
        <div className="flex flex-col text-left">
          <span className="font-semibold text-primary">₹{row.discountPrice.toLocaleString('en-IN')}</span>
          {row.price > row.discountPrice && (
            <span className="text-[10px] text-gray-400 line-through">
              ₹{row.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Stock',
      cell: (row) => (
        <span
          className={`font-semibold ${row.stock <= 5 ? 'text-red-500 font-bold' : 'text-gray-700'}`}
        >
          {row.stock}
        </span>
      ),
    },
    {
      header: 'Featured',
      cell: (row) => (
        <button
          onClick={() => handleToggleFeatured(row)}
          className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
            row.isFeatured ? 'bg-primary' : 'bg-gray-300'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              row.isFeatured ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
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
          <Link to={`/admin/products/${row._id}`}>
            <button className="p-1.5 bg-primary-50 hover:bg-primary-100 text-primary rounded-lg transition-colors cursor-pointer">
              <Edit size={14} />
            </button>
          </Link>
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
      {/* Top action header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <h2 className="text-xl font-bold text-gray-800">Products</h2>
          <Badge variant="primary">{totalProducts} Total</Badge>
        </div>
        <Link to="/admin/products/add">
          <Button variant="primary" className="inline-flex items-center gap-2">
            <Plus size={16} />
            <span>Add Product</span>
          </Button>
        </Link>
      </div>

      {/* Filters row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-primary-100 shadow-pink-sm">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name..."
            className="w-full pl-10 pr-4 py-2 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            className="w-full px-4 py-2 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white appearance-none cursor-pointer"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            className="w-full px-4 py-2 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white appearance-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      <Table
        columns={columns}
        data={products}
        loading={loading}
        emptyMessage="No products match filter settings"
      />

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteProduct}
        title="Delete Product?"
        message="Are you sure you want to delete this product? All related reviews and shopping items will be permanently affected."
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

export default ProductList;
