import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';

export const ServiceModal = ({ isOpen, onClose, service = null, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Food and Restaurant',
    price: 25,
    description: '',
    isAvailable: true,
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        category: service.category || 'Food and Restaurant',
        price: service.price || 0,
        description: service.description || '',
        isAvailable: service.isAvailable !== undefined ? service.isAvailable : true,
      });
    } else {
      setFormData({
        name: '',
        category: 'Food and Restaurant',
        price: 25,
        description: '',
        isAvailable: true,
      });
    }
  }, [service, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service ? 'Edit Service' : 'Add New Service Item'}
      subtitle="Configure additional services for guest orders and billing charges"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Service Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Aromatherapy Massage (60m)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Service Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-semibold bg-white"
          >
            <option value="Food and Restaurant">Food and Restaurant</option>
            <option value="Laundry">Laundry</option>
            <option value="Room Service">Room Service</option>
            <option value="Spa">Spa</option>
            <option value="Extra Bed">Extra Bed</option>
            <option value="Other Services">Other Services</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Price ($) *
          </label>
          <input
            type="number"
            min="0"
            step="any"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Details about what is included in this service"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isAvailableCheck"
            checked={formData.isAvailable}
            onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
          />
          <label htmlFor="isAvailableCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
            Available for guest booking / ordering
          </label>
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
            disabled={loading}
            className="px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 rounded-xl shadow-md transition-colors"
          >
            {loading ? 'Saving...' : service ? 'Update Service' : 'Add Service'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
