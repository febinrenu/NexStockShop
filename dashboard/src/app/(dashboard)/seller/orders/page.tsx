'use client';

import React, { useState, useEffect } from 'react';
import { Search, Eye, Calendar, User, DollarSign, Edit } from 'lucide-react';
import Button from '@/components/ui/button';
import Select from '@/components/ui/select';
import Modal from '@/components/ui/modal';
import StatusBadge from '@/components/ui/status-badge';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/states';
import { sellerService, Order } from '@/services/api/seller-service';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail Modal state
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Status update state
  const [formStatus, setFormStatus] = useState<Order['status']>('pending');
  const [formTracking, setFormTracking] = useState('');

  const fetchOrders = React.useCallback(async (isMounted: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const data = await sellerService.getOrdersList(statusFilter);
      
      let filtered = [...data];

      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.order_number.toLowerCase().includes(query) ||
            o.customer.name.toLowerCase().includes(query) ||
            o.customer.email.toLowerCase().includes(query)
        );
      }

      if (isMounted) {
        setOrders(filtered);
      }
    } catch (e) {
      console.error(e);
      if (isMounted) {
        setError('Could not load orders queue. Retry connections.');
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
      fetchOrders(isMounted);
    }, 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchOrders]);

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setFormStatus(order.status);
    setFormTracking(order.tracking_number || '');
    setIsDetailOpen(true);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await sellerService.updateOrderStatus(selectedOrder.id, formStatus, formTracking);
      setIsDetailOpen(false);
      setSelectedOrder(null);
      fetchOrders(true);
    } catch {
      alert('Error updating order status');
    }
  };

  const getOrderStatusBadgeType = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'shipped':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const getOrderStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header block */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
        <p className="text-sm text-gray-500">Track purchase transactions, update shipping details, and manage customer shipments.</p>
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
            placeholder="Search by order number or customer name..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Switcher Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-250 self-stretch sm:self-auto text-xs font-semibold">
          {[
            { value: 'all', label: 'All Orders' },
            { value: 'pending', label: 'Pending' },
            { value: 'processing', label: 'Processing' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
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
        <ErrorState message={error} onRetry={() => fetchOrders(true)} />
      ) : orders.length === 0 ? (
        <EmptyState 
          title="No orders found" 
          description="There are currently no customer transactions matching your criteria."
        />
      ) : (
        /* Orders Table */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-150">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Order Number</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3 text-center">Date</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-sm">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{order.order_number}</td>
                    <td className="px-6 py-4">
                      <div className="text-gray-800 font-semibold">{order.customer.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{order.customer.email}</div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500 text-xs">
                      {order.created_at.split(' ')[0]}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-800 font-semibold">
                      {order.formatted_amount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge
                        status={getOrderStatusLabel(order.status)}
                        type={getOrderStatusBadgeType(order.status)}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(order)}
                        className="text-indigo-650 hover:text-indigo-900 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-xs font-semibold">Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ORDER DETAIL & FULFILLMENT MODAL --- */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Fulfillment Control Panel">
        {selectedOrder && (
          <div className="space-y-6">
            {/* Split Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Customer Column */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <User className="h-4 w-4 text-slate-400" />
                  <span>Customer Details</span>
                </div>
                <h5 className="font-semibold text-slate-800 text-sm mt-1">{selectedOrder.customer.name}</h5>
                <p className="text-xs text-slate-650">{selectedOrder.customer.email}</p>
                {selectedOrder.customer.phone && (
                  <p className="text-xs text-slate-650 mt-1">Phone: {selectedOrder.customer.phone}</p>
                )}
              </div>

              {/* Transaction Summary Column */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>Transaction Summary</span>
                </div>
                <h5 className="font-semibold text-slate-800 text-sm mt-1">{selectedOrder.order_number}</h5>
                <p className="text-xs text-slate-650">Placed: {selectedOrder.created_at}</p>
                <div className="text-xs font-semibold text-slate-700 mt-1 flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Total Amount: {selectedOrder.formatted_amount}</span>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div>
              <h5 className="text-sm font-bold text-gray-900 border-b pb-2 mb-3">Order Items</h5>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 text-sm border-b last:border-0 border-gray-100">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-gray-800">{item.product_name}</p>
                      <p className="text-xs text-gray-400 font-mono">SKU: {item.variant_sku} (Qty: {item.quantity})</p>
                    </div>
                    <span className="font-semibold text-gray-700">{item.price.formatted}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleStatusSubmit} className="border-t pt-4 space-y-4">
              <h5 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Edit className="h-4 w-4 text-indigo-500" />
                <span>Update Fulfill Status</span>
              </h5>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Status</label>
                  <Select
                    options={[
                      { value: 'pending', label: 'Pending Payment' },
                      { value: 'processing', label: 'Processing' },
                      { value: 'shipped', label: 'Shipped' },
                      { value: 'delivered', label: 'Delivered' },
                      { value: 'cancelled', label: 'Cancelled' },
                    ]}
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as Order['status'])}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Courier Tracking Code</label>
                  <input
                    type="text"
                    placeholder="e.g. FedEx / USPS tracking#"
                    className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2"
                    value={formTracking}
                    onChange={(e) => setFormTracking(e.target.value)}
                    disabled={formStatus === 'pending' || formStatus === 'processing'}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
                <Button type="submit">Update Order</Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
