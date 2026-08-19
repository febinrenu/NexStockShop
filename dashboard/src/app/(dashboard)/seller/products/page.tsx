'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Modal from '@/components/ui/modal';
import StatusBadge from '@/components/ui/status-badge';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/states';
import { sellerService, Product } from '@/services/api/seller-service';

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOption, setSortOption] = useState('-created_at');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Active editing/deleting context
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Product Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formPriceMinor, setFormPriceMinor] = useState(0);
  const [formCategoryId, setFormCategoryId] = useState('1');
  const [formStatus, setFormStatus] = useState<'active' | 'draft' | 'archived'>('active');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: '1', label: 'Rings' },
    { value: '2', label: 'Necklaces' },
    { value: '3', label: 'Earrings' },
  ];

  const sortOptions = [
    { value: '-created_at', label: 'Newest First' },
    { value: 'created_at', label: 'Oldest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
  ];

  const fetchProducts = React.useCallback(async (isMounted: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const filterCat = categoryFilter !== 'all' ? parseInt(categoryFilter) : undefined;
      const data = await sellerService.getProductsList({
        category_id: filterCat,
        search: searchTerm || undefined,
      });

      // Sort logic on front-end
      const sorted = [...data.products];
      if (sortOption === 'price_low') {
        sorted.sort((a, b) => (a.price?.amount_minor || 0) - (b.price?.amount_minor || 0));
      } else if (sortOption === 'price_high') {
        sorted.sort((a, b) => (b.price?.amount_minor || 0) - (a.price?.amount_minor || 0));
      } else if (sortOption === 'created_at') {
        sorted.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
      } else if (sortOption === '-created_at') {
        sorted.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      }

      if (isMounted) {
        setProducts(sorted);
      }
    } catch (e) {
      console.error(e);
      if (isMounted) {
        setError('Could not retrieve product list. Please try again.');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [searchTerm, categoryFilter, sortOption]);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      fetchProducts(isMounted);
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchProducts]);

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormSku('');
    setFormPriceMinor(0);
    setFormCategoryId('1');
    setFormStatus('active');
    setSelectedProduct(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormName(product.name);
    setFormDescription(product.description);
    setFormSku(product.sku);
    setFormPriceMinor((product.price?.amount_minor || 0) / 100);
    setFormCategoryId(String(product.category_id || '1'));
    setFormStatus(product.status);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  // CRUD Mutations calling sellerService mocks
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSku) return;

    try {
      const priceVal = formPriceMinor * 100;
      await sellerService.createProduct({
        sku: formSku,
        slug: formName.toLowerCase().replace(/\s+/g, '-'),
        status: formStatus,
        is_featured: false,
        name: formName,
        description: formDescription,
        category_id: parseInt(formCategoryId),
        brand_id: 1,
        price: {
          currency: 'USD',
          amount_minor: priceVal,
          formatted: `${(priceVal / 100).toFixed(2)} USD`,
        },
        variants: [
          {
            id: `v-${Math.random().toString(36).substr(2, 5)}`,
            sku: `${formSku}-VAR`,
            attributes: { size: 'Default' },
            is_default: true,
            in_stock: true,
            price: {
              currency: 'USD',
              amount_minor: priceVal,
              formatted: `${(priceVal / 100).toFixed(2)} USD`,
            },
            stock_count: 10,
          },
        ],
      });
      setIsAddOpen(false);
      resetForm();
      fetchProducts(true);
    } catch {
      alert('Error creating product');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !formName) return;

    try {
      const priceVal = formPriceMinor * 100;
      await sellerService.updateProduct(selectedProduct.id, {
        name: formName,
        description: formDescription,
        sku: formSku,
        status: formStatus,
        category_id: parseInt(formCategoryId),
        price: {
          currency: 'USD',
          amount_minor: priceVal,
          formatted: `${(priceVal / 100).toFixed(2)} USD`,
        },
      });
      setIsEditOpen(false);
      resetForm();
      fetchProducts(true);
    } catch {
      alert('Error updating product');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    try {
      await sellerService.deleteProduct(selectedProduct.id);
      setIsDeleteOpen(false);
      setSelectedProduct(null);
      fetchProducts(true);
    } catch {
      alert('Error deleting product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products Catalog</h2>
          <p className="text-sm text-gray-500">Add, edit, or archive products from your store. Products listed here sync to the client database.</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-1 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* Filters row */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Select */}
        <div className="w-full md:w-48">
          <Select
            options={categories}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
        </div>

        {/* Sort Select */}
        <div className="w-full md:w-48">
          <Select
            options={sortOptions}
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          />
        </div>
      </div>

      {/* Data states display */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchProducts(true)} />
      ) : products.length === 0 ? (
        <EmptyState 
          title="No products found" 
          description="Try modifying your search or filter keywords, or add a new product."
          actionText="Create Product"
          onAction={handleOpenAdd}
        />
      ) : (
        /* Products Table */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-150">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Product Info</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3 text-right">Price</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-sm">
                {products.map((product) => {
                  const catLabel = categories.find(c => c.value === String(product.category_id))?.label || 'General';
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-sm">{product.description}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-650">{product.sku}</td>
                      <td className="px-6 py-4 text-gray-600">{catLabel}</td>
                      <td className="px-6 py-4 text-right text-gray-800 font-semibold">
                        {product.price?.formatted || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge
                          status={product.status}
                          type={product.status === 'active' ? 'success' : product.status === 'draft' ? 'neutral' : 'error'}
                        />
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="text-gray-400 hover:text-indigo-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4 inline" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(product)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD MODAL --- */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Product">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Product Name"
            required
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g. Sapphire Pendant"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Provide a detailed description of the materials, sizes, and craftsmanship..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SKU Code"
              required
              value={formSku}
              onChange={(e) => setFormSku(e.target.value)}
              placeholder="e.g. SAPP-PEND-01"
            />
            <Input
              label="Price (USD)"
              type="number"
              step="0.01"
              required
              value={formPriceMinor || ''}
              onChange={(e) => setFormPriceMinor(parseFloat(e.target.value))}
              placeholder="150.00"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select
                options={categories.filter(c => c.value !== 'all')}
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'archived', label: 'Archived' },
                ]}
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as 'active' | 'draft' | 'archived')}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit">Create Product</Button>
          </div>
        </form>
      </Modal>

      {/* --- EDIT MODAL --- */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modify Product Properties">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Product Name"
            required
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SKU Code"
              required
              value={formSku}
              onChange={(e) => setFormSku(e.target.value)}
            />
            <Input
              label="Price (USD)"
              type="number"
              step="0.01"
              required
              value={formPriceMinor || ''}
              onChange={(e) => setFormPriceMinor(parseFloat(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select
                options={categories.filter(c => c.value !== 'all')}
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'archived', label: 'Archived' },
                ]}
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as 'active' | 'draft' | 'archived')}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* --- DELETE CONFIRMATION --- */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Deactivate Catalog Item">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertTriangle className="h-6 w-6 flex-shrink-0" />
            <p className="text-xs font-semibold">
              Warning: This action will permanently remove the product &quot;{selectedProduct?.name}&quot; and its default price schemas from the index database.
            </p>
          </div>
          <p className="text-sm text-gray-500">Are you sure you want to proceed with deleting this catalog item? This cannot be undone.</p>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>Permanently Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
