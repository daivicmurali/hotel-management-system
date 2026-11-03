import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import api from '../../services/api';

export const AddServiceModal = ({ isOpen, onClose, billId, onServiceAdded }) => {
  const [catalog, setCatalog] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [customName, setCustomName] = useState('');
  const [category, setCategory] = useState('Food and Restaurant');
  const [unitPrice, setUnitPrice] = useState(20);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await api.get('/services');
        if (res.data.success) {
          setCatalog(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedServiceId(res.data.data[0]._id);
            setCategory(res.data.data[0].category);
            setUnitPrice(res.data.data[0].price);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [isOpen]);

  const handleSelectService = (id) => {
    setSelectedServiceId(id);
    if (id === 'custom') {
      setCustomName('');
      setUnitPrice(10);
    } else {
      const found = catalog.find((s) => s._id === id);
      if (found) {
        setCategory(found.category);
        setUnitPrice(found.price);
        setCustomName(found.name);
      }
    }
  };

  const totalPrice = Number((unitPrice * quantity).toFixed(2));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const isCustom = selectedServiceId === 'custom';
      const payload = {
        serviceId: isCustom ? null : selectedServiceId,
        name: isCustom ? customName : catalog.find((s) => s._id === selectedServiceId)?.name || customName,
        category,
        unitPrice,
        quantity,
      };

      const res = await api.post(`/bills/${billId}/add-service`, payload);
      if (res.data.success) {
        onServiceAdded(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding service to bill');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Additional Service Charge"
      subtitle="Charge food, laundry, spa, room service, or extra amenities directly to guest bill"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Select Catalog Service
          </label>
          <select
            value={selectedServiceId}
            onChange={(e) => handleSelectService(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-medium bg-white"
          >
            {catalog.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name} (${item.price}) — {item.category}
              </option>
            ))}
            <option value="custom">+ Custom Service Item</option>
          </select>
        </div>

        {selectedServiceId === 'custom' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Custom Item Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Special Beverage Order"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-medium bg-white"
          >
            <option value="Food and Restaurant">Food and Restaurant</option>
            <option value="Laundry">Laundry</option>
            <option value="Room Service">Room Service</option>
            <option value="Spa">Spa</option>
            <option value="Extra Bed">Extra Bed</option>
            <option value="Other Services">Other Services</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Unit Price ($) *
            </label>
            <input
              type="number"
              min="0"
              step="any"
              required
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              max="100"
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-semibold"
            />
          </div>
        </div>

        {/* Live Total preview */}
        <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
          <span className="text-slate-400">Total charge to be appended:</span>
          <span className="font-extrabold text-base text-emerald-400">
            ${totalPrice.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 rounded-xl shadow-md transition-colors"
          >
            {submitting ? 'Adding...' : 'Add to Bill'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
