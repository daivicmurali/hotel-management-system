import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ServiceModal } from '../components/services/ServiceModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Utensils,
  Shirt,
  BellRing,
  BedDouble,
  Briefcase,
  Check,
  X,
} from 'lucide-react';

const categoryIcons = {
  'Food and Restaurant': Utensils,
  Laundry: Shirt,
  'Room Service': BellRing,
  Spa: Sparkles,
  'Extra Bed': BedDouble,
  'Other Services': Briefcase,
};

export const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { showToast } = useToast();

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/services', {
        params: {
          category: categoryFilter !== 'All' ? categoryFilter : undefined,
        },
      });
      if (res.data.success) {
        setServices(res.data.data);
      }
    } catch (err) {
      showToast('Error loading services catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [categoryFilter]);

  const handleOpenAdd = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleSaveService = async (formData) => {
    setModalLoading(true);
    try {
      if (editingService) {
        const res = await api.put(`/services/${editingService._id}`, formData);
        if (res.data.success) {
          showToast(`Service '${formData.name}' updated!`, 'success');
          setIsModalOpen(false);
          fetchServices();
        }
      } else {
        const res = await api.post('/services', formData);
        if (res.data.success) {
          showToast(`Service '${formData.name}' added to catalog!`, 'success');
          setIsModalOpen(false);
          fetchServices();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving service', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/services/${serviceToDelete._id}`);
      if (res.data.success) {
        showToast('Service removed from catalog', 'success');
        setServiceToDelete(null);
        fetchServices();
      }
    } catch (err) {
      showToast('Error deleting service', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredServices = services.filter((s) => {
    if (!searchTerm) return true;
    return (
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Additional Services Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage food, laundry, spa, room service, extra beds, and amenities for dynamic billing
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="All">All Categories</option>
            <option value="Food and Restaurant">Food and Restaurant</option>
            <option value="Laundry">Laundry</option>
            <option value="Room Service">Room Service</option>
            <option value="Spa">Spa</option>
            <option value="Extra Bed">Extra Bed</option>
            <option value="Other Services">Other Services</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs font-semibold text-slate-400">
          Loading catalog...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm space-y-2">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No services found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => {
            const Icon = categoryIcons[service.category] || Sparkles;
            return (
              <div
                key={service._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        service.isAvailable
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {service.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 tracking-tight mb-1">
                    {service.name}
                  </h3>
                  <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block mb-2">
                    {service.category}
                  </span>

                  {service.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {service.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Unit Price</span>
                    <p className="text-xl font-black text-slate-900">${service.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(service)}
                      className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors"
                      title="Edit Service"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setServiceToDelete(service)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={editingService}
        onSave={handleSaveService}
        loading={modalLoading}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!serviceToDelete}
        onClose={() => setServiceToDelete(null)}
        onConfirm={handleDeleteService}
        title={`Delete Service '${serviceToDelete?.name}'?`}
        message={`Are you sure you want to remove '${serviceToDelete?.name}' from the additional services catalog?`}
        confirmText="Delete Service"
        isDangerous
        loading={deleteLoading}
      />
    </div>
  );
};
