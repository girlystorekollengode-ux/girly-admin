import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../api/axios.js';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { X, Upload, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  
  // Custom states
  const [images, setImages] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  
  // Inputs states
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const price = watch('price');
  const discountPrice = watch('discountPrice');

  // Fetch product & categories
  useEffect(() => {
    const initData = async () => {
      setFetching(true);
      try {
        const [categoriesRes, productRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/products/${id}`),
        ]);

        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data);
        }

        if (productRes.data.success) {
          const product = productRes.data.data;
          
          // Pre-fill react hook form values
          setValue('name', product.name);
          setValue('description', product.description);
          setValue('category', product.category?._id || product.category);
          setValue('subcategory', product.subcategory || '');
          setValue('tags', product.tags ? product.tags.join(', ') : '');
          setValue('price', product.price);
          setValue('discountPrice', product.discountPrice);
          setValue('stock', product.stock);
          setValue('isFeatured', product.isFeatured);
          setValue('isActive', product.isActive);

          setImages(product.images || []);
          setSizes(product.sizes || []);
          setColors(product.colors || []);
        }
      } catch (error) {
        console.error('Error fetching edit data:', error);
        toast.error('Failed to retrieve product details');
      } finally {
        setFetching(false);
      }
    };

    initData();
  }, [id, setValue]);

  // Calculate discount
  const getDiscountPercentage = () => {
    const p = Number(price);
    const dp = Number(discountPrice);
    if (p && dp && p > 0 && dp <= p) {
      return Math.round(((p - dp) / p) * 100);
    }
    return 0;
  };

  // Image Upload Handler
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (images.length + files.length > 5) {
      toast.error('You can upload a maximum of 5 images');
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    setUploading(true);
    try {
      const { data } = await api.post('/upload/image?folder=products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        setImages((prev) => [...prev, ...data.images]);
        toast.success('Images uploaded successfully');
      }
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Remove uploaded image from list & Cloudinary
  const handleRemoveImage = async (public_id) => {
    try {
      await api.delete('/upload/image', { data: { public_id } });
      setImages((prev) => prev.filter((img) => img.public_id !== public_id));
      toast.success('Image removed');
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  // Sizing operations
  const handleAddSize = (size) => {
    const trimmed = size.trim().toUpperCase();
    if (trimmed && !sizes.includes(trimmed)) {
      setSizes([...sizes, trimmed]);
    }
    setSizeInput('');
  };

  const handleRemoveSize = (size) => {
    setSizes(sizes.filter((s) => s !== size));
  };

  // Color operations
  const handleAddColor = (color) => {
    const trimmed = color.trim();
    if (trimmed && !colors.includes(trimmed)) {
      setColors([...colors, trimmed]);
    }
    setColorInput('');
  };

  const handleRemoveColor = (color) => {
    setColors(colors.filter((c) => c !== color));
  };

  // Submit edits
  const onSubmit = async (data) => {
    if (images.length === 0) {
      toast.error('Please upload at least 1 image');
      return;
    }

    setLoading(true);
    try {
      const tagsArray = data.tags
        ? data.tags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t)
        : [];

      const payload = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        discountPrice: Number(data.discountPrice),
        category: data.category,
        subcategory: data.subcategory || undefined,
        stock: Number(data.stock),
        images,
        sizes,
        colors,
        tags: tagsArray,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
      };

      const res = await api.put(`/products/${id}`, payload);
      if (res.data.success) {
        toast.success('Product updated successfully! 💗');
        navigate('/admin/products');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const sizePresets = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-left">
        <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Main Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="text-left space-y-4">
            <h3 className="text-sm font-bold text-primary font-playfair border-b border-primary-100 pb-2">
              Basic Information
            </h3>

            {/* Product Name */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-700 mb-1.5 pl-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Elegant Cotton Anarkali Dress"
                className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white ${
                  errors.name ? 'border-red-500 ring-2 ring-red-100' : 'border-primary-200'
                }`}
                {...register('name', { required: 'Product name is required' })}
              />
              {errors.name && (
                <span className="text-xs text-red-500 mt-1 pl-1">{errors.name.message}</span>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-700 mb-1.5 pl-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Write full product information..."
                rows={5}
                className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white ${
                  errors.description ? 'border-red-500 ring-2 ring-red-100' : 'border-primary-200'
                }`}
                {...register('description', {
                  required: 'Description is required',
                  minLength: { value: 20, message: 'Description must be at least 20 characters' },
                })}
              />
              {errors.description && (
                <span className="text-xs text-red-500 mt-1 pl-1">{errors.description.message}</span>
              )}
            </div>

            {/* Category selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-700 mb-1.5 pl-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white appearance-none cursor-pointer ${
                    errors.category ? 'border-red-500 ring-2 ring-red-100' : 'border-primary-200'
                  }`}
                  {...register('category', { required: 'Please select a category' })}
                >
                  <option value="">Choose category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="text-xs text-red-500 mt-1 pl-1">{errors.category.message}</span>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-700 mb-1.5 pl-1">
                  Subcategory
                </label>
                <input
                  type="text"
                  placeholder="e.g. Salwar Saloon"
                  className="w-full px-4 py-2 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                  {...register('subcategory')}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-700 mb-1.5 pl-1">
                Search Tags (comma-separated)
              </label>
              <input
                type="text"
                placeholder="cotton, festive, anarkali, pink"
                className="w-full px-4 py-2 border border-primary-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                {...register('tags')}
              />
            </div>
          </Card>

          {/* Pricing & Stock Card */}
          <Card className="text-left space-y-4">
            <h3 className="text-sm font-bold text-primary font-playfair border-b border-primary-100 pb-2">
              Pricing & Inventory
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Original MRP */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-700 mb-1.5 pl-1">
                  MRP Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="999"
                  className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white ${
                    errors.price ? 'border-red-500 ring-2 ring-red-100' : 'border-primary-200'
                  }`}
                  {...register('price', {
                    required: 'MRP is required',
                    min: { value: 1, message: 'MRP must be greater than 0' },
                  })}
                />
                {errors.price && (
                  <span className="text-xs text-red-500 mt-1 pl-1">{errors.price.message}</span>
                )}
              </div>

              {/* Selling Price */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-700 mb-1.5 pl-1">
                  Selling Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="499"
                  className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white ${
                    errors.discountPrice ? 'border-red-500 ring-2 ring-red-100' : 'border-primary-200'
                  }`}
                  {...register('discountPrice', {
                    required: 'Selling price is required',
                    min: { value: 1, message: 'Selling price must be greater than 0' },
                    validate: (value) =>
                      Number(value) <= Number(price) || 'Selling price must be less than or equal to MRP',
                  })}
                />
                {errors.discountPrice && (
                  <span className="text-xs text-red-500 mt-1 pl-1">
                    {errors.discountPrice.message}
                  </span>
                )}
              </div>

              {/* Stock */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-700 mb-1.5 pl-1">
                  Stock Qty <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="50"
                  className={`w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white ${
                    errors.stock ? 'border-red-500 ring-2 ring-red-100' : 'border-primary-200'
                  }`}
                  {...register('stock', {
                    required: 'Stock is required',
                    min: { value: 0, message: 'Stock cannot be negative' },
                  })}
                />
                {errors.stock && (
                  <span className="text-xs text-red-500 mt-1 pl-1">{errors.stock.message}</span>
                )}
              </div>
            </div>

            {/* Discount Badge */}
            {getDiscountPercentage() > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 text-primary text-xs font-bold rounded-full">
                <AlertCircle size={14} />
                Calculated Discount: {getDiscountPercentage()}% OFF
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: Images, Options, Settings */}
        <div className="space-y-6">
          {/* Images Card */}
          <Card className="text-left space-y-4">
            <h3 className="text-sm font-bold text-primary font-playfair border-b border-primary-100 pb-2">
              Product Images (Max 5)
            </h3>

            {/* Previews Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img) => (
                  <div
                    key={img.public_id}
                    className="relative aspect-square rounded-xl overflow-hidden group border border-primary-100"
                  >
                    <img src={img.url} alt="product" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.public_id)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Image upload area */}
            {images.length < 5 && (
              <div className="relative border-2 border-dashed border-primary-200 rounded-xl hover:bg-primary-50/20 transition-all duration-200 cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Spinner size="sm" />
                      <span className="text-xs">Uploading images...</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="text-primary mb-2" />
                      <span className="text-xs font-semibold text-gray-700">Click to upload</span>
                      <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP (Max 5 files)</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Options & Variants */}
          <Card className="text-left space-y-4">
            <h3 className="text-sm font-bold text-primary font-playfair border-b border-primary-100 pb-2">
              Options & Attributes
            </h3>

            {/* Sizes Box */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-700 pl-1 block">
                Available Sizes
              </label>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-1.5">
                {sizePresets.map((sz) => {
                  const active = sizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => (active ? handleRemoveSize(sz) : handleAddSize(sz))}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-all border cursor-pointer ${
                        active
                          ? 'bg-primary border-primary text-white shadow-pink-sm'
                          : 'border-primary-200 text-gray-600 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>

              {/* Custom input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom size (e.g. Free Size)"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSize(sizeInput);
                    }
                  }}
                  className="flex-1 px-3 py-1.5 border border-primary-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                />
                <Button variant="outline" size="sm" onClick={() => handleAddSize(sizeInput)}>
                  Add
                </Button>
              </div>

              {/* Added sizes */}
              {sizes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sizes.map((sz) => (
                    <span
                      key={sz}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary-50 border border-primary-200 text-primary text-xs font-semibold rounded-full"
                    >
                      {sz}
                      <X
                        size={12}
                        className="cursor-pointer hover:text-primary-dark"
                        onClick={() => handleRemoveSize(sz)}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Colors box */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-gray-700 pl-1 block">
                Available Colors
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Pastel Pink + Enter"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddColor(colorInput);
                    }
                  }}
                  className="flex-1 px-3 py-1.5 border border-primary-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                />
                <Button variant="outline" size="sm" onClick={() => handleAddColor(colorInput)}>
                  Add
                </Button>
              </div>

              {/* Added colors */}
              {colors.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {colors.map((col) => (
                    <span
                      key={col}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold rounded-full capitalize"
                    >
                      {col}
                      <X
                        size={12}
                        className="cursor-pointer hover:text-red-500"
                        onClick={() => handleRemoveColor(col)}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Visibility settings */}
          <Card className="text-left space-y-4">
            <h3 className="text-sm font-bold text-primary font-playfair border-b border-primary-100 pb-2">
              Visibility Settings
            </h3>

            {/* Featured toggle */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-800">Featured Product</span>
                <span className="text-[10px] text-gray-500">Show on homepage featured collection</span>
              </div>
              <button
                type="button"
                onClick={() => setValue('isFeatured', !watch('isFeatured'))}
                className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                  watch('isFeatured') ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    watch('isFeatured') ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-800">Active status</span>
                <span className="text-[10px] text-gray-500">Enable searching and client purchases</span>
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
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Link to="/admin/products" className="w-1/2">
              <Button variant="outline" fullWidth disabled={loading}>
                Cancel
              </Button>
            </Link>
            <div className="w-1/2">
              <Button type="submit" variant="primary" fullWidth loading={loading}>
                Save Changes 💗
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
