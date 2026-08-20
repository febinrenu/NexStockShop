'use client';

import React, { useState, useEffect } from 'react';
import { Search, Edit2, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import StatusBadge from '@/components/ui/status-badge';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/states';
import { sellerService, InventoryItem } from '@/services/api/seller-service';

export default function SellerInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit stock state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formStockCount, setFormStockCount] = useState(0);

  const fetchInventory = React.useCallback(async (isMounted: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const data = await sellerService.getInventoryList();
      
      let filtered = [...data];
      
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.product_name.toLowerCase().includes(query) ||
            item.variant_sku.toLowerCase().includes(query)
        );
      }

      if (statusFilter !== 'all') {
        filtered = filtered.filter((item) => item.status === statusFilter);
      }

      if (isMounted) {
        setInventory(filtered);
      }
    } catch (e) {
      console.error(e);
      if (isMounted) {
        setError('Could not load stock list. Try checking database connections.');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      fetchInventory(isMounted);
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchInventory]);

  const handleOpenEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormStockCount(item.stock_count);
    setIsEditOpen(true);
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await sellerService.updateStock(selectedItem.variant_id, formStockCount);
      setIsEditOpen(false);
      setSelectedItem(null);
      fetchInventory(true);
    } catch {
      alert('Error updating stock level');
    }
  };

  const getStockStatusBadgeType = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'success';
      case 'low_stock':
        return 'warning';
      case 'out_of_stock':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const getStockStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'In Stock';
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header block */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
        <p className="text-sm text-gray-500">Track and adjust stock levels across all product variants. Updates instantly trigger out-of-stock state machine changes.</p>
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

        {/* Status Switcher Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-250 self-stretch sm:self-auto text-xs font-semibold">
          {[
            { value: 'all', label: 'All Items' },
            { value: 'in_stock', label: 'In Stock' },
            { value: 'low_stock', label: 'Low Stock' },
            { value: 'out_of_stock', label: 'Out of Stock' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === tab.value
                  ? 'bg-white text-gray-800 shadow-xs'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data display */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchInventory(true)} />
      ) : inventory.length === 0 ? (
        <EmptyState 
          title="No inventory records found" 
          description="Check if you have any products in your catalog, or reset your search query."
        />
      ) : (
        /* Inventory Table */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-150">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">Variant SKU</th>
                  <th className="px-6 py-3">Attributes</th>
                  <th className="px-6 py-3 text-center">Stock Count</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-sm">
                {inventory.map((item, index) => {
                  const attrs = Object.entries(item.attributes)
                    .map(([key, val]) => `${key}: ${val}`)
                    .join(', ') || 'N/A';

                  return (
                    <tr key={index} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-semibold text-gray-900">{item.product_name}</td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-650">{item.variant_sku}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{attrs}</td>
                      <td className="px-6 py-4 text-center font-bold text-gray-800">
                        {item.stock_count}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge
                          status={getStockStatusLabel(item.status)}
                          type={getStockStatusBadgeType(item.status)}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="Adjust Stock"
                        >
                          <Edit2 className="h-4 w-4 inline mr-1" />
                          <span className="text-xs font-semibold">Edit</span>
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

      {/* --- ADJUST STOCK MODAL --- */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Adjust Stock Quantity">
        <form onSubmit={handleStockSubmit} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h5 className="font-semibold text-slate-800 text-sm">{selectedItem?.product_name}</h5>
            <p className="text-xs text-slate-500 mt-1 font-mono">SKU: {selectedItem?.variant_sku}</p>
          </div>

          <Input
            label="Current On-Hand Quantity"
            type="number"
            min="0"
            required
            value={formStockCount}
            onChange={(e) => setFormStockCount(parseInt(e.target.value) || 0)}
          />

          {formStockCount === 0 && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-2.5 rounded text-xs border border-red-200">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>Setting stock to 0 will mark this item as Out Of Stock on the shopper storefront.</span>
            </div>
          )}

          {formStockCount > 0 && formStockCount <= 3 && (
            <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 p-2.5 rounded text-xs border border-yellow-250">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>Low stock warning threshold is set to 3. This item will display as Low Stock.</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit">Update Stock Level</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
