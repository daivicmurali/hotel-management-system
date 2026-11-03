import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { InvoiceModal } from '../components/billing/InvoiceModal';
import { AddServiceModal } from '../components/billing/AddServiceModal';
import { PaymentModal } from '../components/billing/PaymentModal';
import { useToast } from '../context/ToastContext';
import {
  Receipt,
  Search,
  Filter,
  DollarSign,
  Download,
  PlusCircle,
  CreditCard,
  Percent,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
} from 'lucide-react';

export const Billing = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [selectedBill, setSelectedBill] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { showToast } = useToast();

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bills', {
        params: {
          paymentStatus: statusFilter !== 'All' ? statusFilter : undefined,
          search: searchTerm || undefined,
        },
      });
      if (res.data.success) {
        setBills(res.data.data);
      }
    } catch (err) {
      showToast('Error loading bills', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [searchTerm, statusFilter]);

  // Aggregate metrics
  const totals = React.useMemo(() => {
    const totalInvoiced = bills.reduce((acc, b) => acc + (b.grandTotal || 0), 0);
    const totalCollected = bills.reduce((acc, b) => acc + (b.paidAmount || 0), 0);
    const totalPending = bills.reduce((acc, b) => acc + (b.balanceAmount || 0), 0);
    const collectionRate =
      totalInvoiced > 0 ? Number(((totalCollected / totalInvoiced) * 100).toFixed(1)) : 0;
    return { totalInvoiced, totalCollected, totalPending, collectionRate };
  }, [bills]);

  const handleOpenInvoice = async (bill) => {
    try {
      const res = await api.get(`/bills/${bill._id}`);
      if (res.data.success) {
        setSelectedBill(res.data.data);
        setShowInvoiceModal(true);
      }
    } catch (err) {
      setSelectedBill(bill);
      setShowInvoiceModal(true);
    }
  };

  const handleQuickAddService = (bill) => {
    setSelectedBill(bill);
    setShowAddServiceModal(true);
  };

  const handleQuickPayment = (bill) => {
    setSelectedBill(bill);
    setShowPaymentModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Dynamic Billing & Invoices
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Real-time billing engine calculating room nights, additional services, discounts, and GST taxes
        </p>
      </div>

      {/* Top Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Invoiced
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              ${totals.totalInvoiced.toFixed(2)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Across {bills.length} invoices</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Collected
            </p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              ${totals.totalCollected.toFixed(2)}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              Settled via Cash, Card, UPI
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Outstanding Balance
            </p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">
              ${totals.totalPending.toFixed(2)}
            </h3>
            <p className="text-[11px] text-rose-500 font-semibold mt-0.5">Pending collection</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Collection Ratio
            </p>
            <h3 className="text-2xl font-black text-brand-600 mt-1">
              {totals.collectionRate}%
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Revenue realization</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Percent className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice #, guest name, phone, or room #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="All">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs font-semibold text-slate-400">
            Calculating bills...
          </div>
        ) : bills.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No invoices found</p>
            <p className="text-xs text-slate-400">Invoices are automatically created when reservations are booked.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Guest</th>
                  <th className="py-3.5 px-4">Room / Nights</th>
                  <th className="py-3.5 px-4 text-right">Room Fee</th>
                  <th className="py-3.5 px-4 text-right">Services</th>
                  <th className="py-3.5 px-4 text-right">Grand Total</th>
                  <th className="py-3.5 px-4 text-right">Balance Due</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Invoice # */}
                    <td className="py-4 px-4 font-extrabold text-brand-700">
                      <span>{bill.invoiceNumber}</span>
                      <p className="text-[10px] text-slate-400 font-normal">
                        {new Date(bill.issueDate).toLocaleDateString()}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900 text-sm">{bill.customer?.name}</p>
                      <p className="text-[11px] text-slate-500">{bill.customer?.phone}</p>
                    </td>

                    {/* Room */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900">
                        Room #{bill.roomDetails?.roomNumber}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {bill.roomDetails?.numberOfNights} Nights • {bill.roomDetails?.roomType}
                      </p>
                    </td>

                    {/* Room Fee */}
                    <td className="py-4 px-4 text-right font-semibold text-slate-700">
                      ${bill.roomCharges?.toFixed(2)}
                    </td>

                    {/* Additional Services */}
                    <td className="py-4 px-4 text-right">
                      <span className="font-semibold text-slate-700">
                        ${bill.totalAdditionalServices?.toFixed(2)}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {bill.additionalServices?.length || 0} items
                      </p>
                    </td>

                    {/* Grand Total */}
                    <td className="py-4 px-4 text-right font-extrabold text-sm text-slate-900">
                      ${bill.grandTotal?.toFixed(2)}
                      <p className="text-[10px] text-slate-400 font-normal">
                        incl. {bill.taxPercentage || 12}% GST
                      </p>
                    </td>

                    {/* Balance */}
                    <td className="py-4 px-4 text-right">
                      <span
                        className={`font-black text-xs ${
                          bill.balanceAmount > 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        ${bill.balanceAmount?.toFixed(2)}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Paid: ${bill.paidAmount?.toFixed(2)}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <StatusBadge status={bill.paymentStatus} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleQuickAddService(bill)}
                          className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Add Service Charge"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>

                        {bill.balanceAmount > 0 && (
                          <button
                            onClick={() => handleQuickPayment(bill)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Record Payment"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenInvoice(bill)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          title="View Full Itemized Invoice"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Itemized Invoice View / PDF generator modal */}
      {selectedBill && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          bill={selectedBill}
          onBillUpdated={() => {
            fetchBills();
          }}
        />
      )}

      {/* Quick Add Service modal */}
      {selectedBill && (
        <AddServiceModal
          isOpen={showAddServiceModal}
          onClose={() => setShowAddServiceModal(false)}
          billId={selectedBill._id}
          onServiceAdded={() => {
            showToast('Service item added to bill!', 'success');
            fetchBills();
          }}
        />
      )}

      {/* Quick Record Payment modal */}
      {selectedBill && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          bill={selectedBill}
          onPaymentRecorded={() => {
            showToast('Payment recorded successfully!', 'success');
            fetchBills();
          }}
        />
      )}
    </div>
  );
};
