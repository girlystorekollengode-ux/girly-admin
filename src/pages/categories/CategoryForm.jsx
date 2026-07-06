import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios.js';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CategoryForm = ({ isOpen, onClose, onSuccess, category = null, allCategories = [] }) => {
  const [image, setImage] = useState(null);
  const [priceRanges, setPriceRanges] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  // Populate form fields on edit mode
  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        parent: category.parent?._id || category.parent || '',
        displayOrder: category.displayOrder || 0,
        active: category.active !== undefined ? category.active : true,
      });
      setImage(category.image || null);
      setPriceRanges(category.priceRanges || []);
    } else {
      reset({
        name: '',
        parent: '',
        displayOrder: 0,
        active: true,
      });
      setImage(null);
      setPriceRanges([]);
    }
  }, [category, isOpen, reset]);

  // Image Upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('images', file); // Use same field name expected by backend

    setUploading(true);
    try {
      const { data } = await api.post('/upload/image?folder=categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success && data.images?.length > 0) {
        setImage(data.images[0]);
        toast.success('Category banner uploaded');
      }
    } catch (err) {
      toast.error('Failed to upload category image');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Remove category image
  const handleRemoveImage = async () => {
    if (!image?.public_id) return;
    try {
      await api.delete('/upload/image', { data: { public_id: image.public_id } });
      setImage(null);
      toast.success('Image removed');
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  // Add blank price range
  const handleAddPriceRange = () => {
    setPriceRanges([...priceRanges, { label: '', min: 0, max: 0 }]);
  };

  // Remove price range row
  const handleRemovePriceRange = (index) => {
    setPriceRanges(priceRanges.filter((_, idx) => idx !== index));
  };

  // Edit price range row
  const handleUpdatePriceRange = (index, field, value) => {
    const updated = [...priceRanges];
    updated[index][field] = field === 'label' ? value : Number(value);
    setPriceRanges(updated);
  };

  // Add standard pre-configured price ranges
  const handleAddStandardRanges = () => {
    setPriceRanges([
      { label: 'Under ₹199', min: 0, max: 199 },
      { label: '₹200–₹299', min: 200, max: 299 },
      { label: '₹300–₹499', min: 300, max: 499 },
      { label: '₹500–₹999', min: 500, max: 999 },
      { label: 'Above ₹999', min: 1000, max: 999999 },
    ]);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name,
        parent: data.parent || undefined,
        displayOrder: Number(data.displayOrder) || 0,
        active: data.active,
        image: image || undefined,
        priceRanges: priceRanges.filter((r) => r.label && r.max >= r.min),
      };

      let response;
      if (category?._id) {
        response = await api.put(`/categories/${category._id}`, payload);
      } else {
        response = await api.post('/categories', payload);
      }

      if (response.data.success) {
        toast.success(`Category ${category?._id ? 'updated' : 'created'} successfully!`);
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category?._id ? 'Edit Category' : 'Add Category'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
        {/* Category Name */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1.5 pl-1">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Kurta & Sets"
            className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white ${
              errors.name ? 'border-red-500 ring-2 ring-red-100' : 'border-primary-200'
            }`}
            {...register('name', { required: 'Category name is required' })}
          />
          {errors.name && (
            <span className="text-xs text-red-500 mt-1 pl-1">{errors.name.message}</span>
          )}
        </div>

        {/* Parent Category & Display Order */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-700 mb-1.5 pl-1">
              Parent Category (Optional)
            </label>
            <select
              className="w-full px-4 py-2 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white appearance-none cursor-pointer"
              {...register('parent')}
            >
              <option value="">None (Root Category)</option>
              {allCategories
                .filter((cat) => cat._id !== category?._id) // Prevent self-parenting
                .map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-700 mb-1.5 pl-1">
              Display Order
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full px-4 py-2 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
              {...register('displayOrder')}
            />
          </div>
        </div>

        {/* Image upload */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1.5 pl-1">
            Category Image Banner
          </label>
          {image ? (
            <div className="relative w-full max-w-[200px] h-[120px] rounded-xl border border-primary-200 overflow-hidden group">
              <img src={image.url} alt="category" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="relative w-full max-w-[200px] h-[100px] border-2 border-dashed border-primary-200 rounded-xl hover:bg-primary-50/20 transition-all duration-200 cursor-pointer">
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleImageUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                {uploading ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <Upload size={18} className="text-primary mb-1" />
                    <span className="text-[10px] font-semibold text-gray-700">Upload Banner</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Price Ranges Header */}
        <div className="border-t border-primary-100 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800">Dynamic Price Ranges</span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleAddStandardRanges}>
                Add Standard Ranges
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddPriceRange}
                className="inline-flex items-center gap-1"
              >
                <Plus size={12} />
                <span>Add Range</span>
              </Button>
            </div>
          </div>

          {/* Ranges List */}
          {priceRanges.length === 0 ? (
            <div className="text-center py-4 bg-primary-50/50 rounded-xl border border-dashed border-primary-200 text-xs text-gray-400">
              No price ranges specified. Products will be grouped by standard filter cards.
            </div>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {priceRanges.map((range, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white p-2 border border-primary-100 rounded-lg">
                  <input
                    type="text"
                    placeholder="Label (e.g. Under ₹299)"
                    className="flex-1 px-3 py-1.5 border border-primary-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white font-medium"
                    value={range.label}
                    onChange={(e) => handleUpdatePriceRange(idx, 'label', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Min (₹)"
                    className="w-20 px-3 py-1.5 border border-primary-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white text-center"
                    value={range.min}
                    onChange={(e) => handleUpdatePriceRange(idx, 'min', e.target.value)}
                  />
                  <span className="text-gray-400 text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max (₹)"
                    className="w-24 px-3 py-1.5 border border-primary-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white text-center"
                    value={range.max}
                    onChange={(e) => handleUpdatePriceRange(idx, 'max', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePriceRange(idx)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Toggle Status */}
        <div className="flex items-center justify-between border-t border-primary-100 pt-4">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-800">Category Active Status</span>
            <span className="text-[10px] text-gray-500">Show in filters and catalog menus</span>
          </div>
          <button
            type="button"
            onClick={() => setValue('active', !watch('active'))}
            className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
              watch('active') ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                watch('active') ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Form controls */}
        <div className="flex items-center gap-3 pt-3">
          <Button variant="outline" onClick={onClose} disabled={submitting} className="w-1/2">
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting} className="w-1/2">
            {category?._id ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryForm;
