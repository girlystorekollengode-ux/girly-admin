import React, { useState, useEffect } from 'react';
import api from '../../api/axios.js';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import CategoryForm from './CategoryForm.jsx';
import { Tag, Edit, Trash2, Layers, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal forms management
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  
  // Delete confirm dialog states
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products?limit=1000'); // large limit to aggregate totals
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error loading products count:', error);
    }
  };

  const initData = async () => {
    setLoading(true);
    await Promise.all([fetchCategories(), fetchProducts()]);
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, []);

  // Compute products count per category ID
  const getProductCount = (catId) => {
    return products.filter((p) => {
      const pCatId = p.category?._id || p.category;
      return pCatId === catId;
    }).length;
  };

  // Delete Category Action
  const handleDeleteCategory = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const { data } = await api.delete(`/categories/${deleteId}`);
      if (data.success) {
        toast.success('Category deleted successfully');
        setDeleteId(null);
        initData(); // Refresh list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditClick = (cat) => {
    setEditCategory(cat);
    setModalOpen(true);
  };

  const handleAddClick = () => {
    setEditCategory(null);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-left">
          <h2 className="text-xl font-bold text-gray-800">Categories</h2>
          <Badge variant="primary">{categories.length} Total</Badge>
        </div>
        <Button variant="primary" onClick={handleAddClick} className="inline-flex items-center gap-2">
          <span>Add Category</span>
        </Button>
      </div>

      {/* Grid List */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-primary-200 shadow-pink-sm">
          <Tag size={48} className="text-primary mb-2" />
          <p className="text-gray-500 font-semibold">No categories registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const count = getProductCount(cat._id);
            return (
              <Card
                key={cat._id}
                padding="p-0"
                className="overflow-hidden border border-primary-200 hover:shadow-pink-md transition-all duration-200 flex flex-col justify-between"
              >
                {/* Image Banner top */}
                <div>
                  <div className="relative h-[140px] bg-primary-100 flex items-center justify-center">
                    {cat.image?.url ? (
                      <img
                        src={cat.image.url}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-primary">
                        <Layers size={36} />
                        <span className="text-[10px] uppercase font-bold tracking-widest mt-1">
                          Girly Collection
                        </span>
                      </div>
                    )}

                    {/* Active Status Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge variant={cat.active ? 'success' : 'error'}>
                        {cat.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  {/* Body Info details */}
                  <div className="p-5 text-left space-y-4">
                    <div>
                      <h4 className="text-md font-bold text-gray-800 font-playfair tracking-wide leading-tight">
                        {cat.name}
                      </h4>
                      {/* Parent category tag */}
                      {cat.parent && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-primary bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                            Sub of: {cat.parent.name || 'Parent'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Dynamic Price Ranges list */}
                    {cat.priceRanges?.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                          Price Intervals
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {cat.priceRanges.map((range, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-gray-700 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-full"
                            >
                              <IndianRupee size={8} />
                              {range.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer buttons row */}
                <div className="px-5 py-4 border-t border-primary-50 bg-primary-50/20 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">
                    <span className="text-primary font-extrabold">{count}</span> Products
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(cat)}
                      className="p-1.5 bg-primary-50 hover:bg-primary-100 text-primary rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(cat._id)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Category Editor/Creator Form Modal */}
      <CategoryForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={initData}
        category={editCategory}
        allCategories={categories}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category?"
        message="Are you sure you want to delete this category? The catalog organization structure and filtering options for related products will be altered."
        confirmLabel="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

export default CategoryList;
