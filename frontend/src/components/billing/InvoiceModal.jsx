import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { AddServiceModal } from './AddServiceModal';
import { PaymentModal } from './PaymentModal';
import api from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Printer,
  Download,
  PlusCircle,
  CreditCard,
  Trash2,
  Hotel,
  Percent,
  Receipt,
  CheckCircle2,
} from 'lucide-react';

export const InvoiceModal = ({ isOpen, onClose, bill, onBillUpdated }) => {
  if (!bill) return null;

  const [activeBill, setActiveBill] = useState(bill);
  const [showAddService, setShowAddService] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Editable discount and extra charges
  const [isEditingCharges, setIsEditingCharges] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(activeBill.discountPercentage || 0);
  const [extraCharges, setExtraCharges] = useState(activeBill.extraCharges || 0);
  const [extraChargesReason, setExtraChargesReason] = useState(activeBill.extraChargesReason || '');
  const [taxPercent, setTaxPercent] = useState(activeBill.taxPercentage || 12);
  const [updatingCharges, setUpdatingCharges] = useState(false);

  // Sync state if bill prop changes
  React.useEffect(() => {
    setActiveBill(bill);
    setDiscountPercent(bill.discountPercentage || 0);
    setExtraCharges(bill.extraCharges || 0);
    setExtraChargesReason(bill.extraChargesReason || '');
    setTaxPercent(bill.taxPercentage || 12);
  }, [bill]);

  // Handle removing a service line
  const handleRemoveService = async (serviceItemId) => {
    try {
      const res = await api.delete(`/bills/${activeBill._id}/services/${serviceItemId}`);
      if (res.data.success) {
        setActiveBill(res.data.data);
        if (onBillUpdated) onBillUpdated(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error removing service item');
    }
  };

  // Handle updating charges
  const handleSaveCharges = async () => {
    setUpdatingCharges(true);
    try {
      const res = await api.put(`/bills/${activeBill._id}/update-charges`, {
        discountPercentage: discountPercent,
        extraCharges: extraCharges,
        extraChargesReason: extraChargesReason,
        taxPercentage: taxPercent,
      });
      if (res.data.success) {
        setActiveBill(res.data.data);
        setIsEditingCharges(false);
        if (onBillUpdated) onBillUpdated(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating charges');
    } finally {
      setUpdatingCharges(false);
    }
  };

  // Browser print
  const handlePrint = () => {
    window.print();
  };

  // Download PDF using jsPDF & autoTable
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Brand Header
    doc.setFillColor(15, 23, 42); // Navy 900
    doc.rect(0, 0, 210, 36, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('GRAND HORIZON HOTEL & RESORT', 14, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('777 Oceanfront Boulevard, Suite 100 • Tel: +1 (555) 019-8000 • GST: 29AAACH7409R1ZX', 14, 26);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('GUEST INVOICE', 160, 18);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`#${activeBill.invoiceNumber}`, 160, 25);

    // Meta details
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLED TO:', 14, 46);
    doc.setFont('helvetica', 'normal');
    doc.text(`Guest: ${activeBill.customer?.name || 'Valued Guest'}`, 14, 52);
    doc.text(`Phone: ${activeBill.customer?.phone || 'N/A'}`, 14, 57);
    doc.text(`Email: ${activeBill.customer?.email || 'N/A'}`, 14, 62);
    if (activeBill.customer?.address) {
      doc.text(`Address: ${activeBill.customer.address}`, 14, 67);
    }

    doc.setFont('helvetica', 'bold');
    doc.text('RESERVATION & BILLING INFO:', 120, 46);
    doc.setFont('helvetica', 'normal');
    doc.text(`Booking ID: ${activeBill.booking?.bookingId || 'N/A'}`, 120, 52);
    doc.text(`Room: #${activeBill.roomDetails?.roomNumber} (${activeBill.roomDetails?.roomType})`, 120, 57);
    doc.text(`Invoice Date: ${new Date(activeBill.issueDate).toLocaleDateString()}`, 120, 62);
    doc.text(`Payment Status: ${activeBill.paymentStatus.toUpperCase()}`, 120, 67);

    // Table Data
    const tableHeaders = [['Item Description', 'Category', 'Unit Price ($)', 'Qty / Nights', 'Total ($)']];
    const tableRows = [];

    // Room charges row
    tableRows.push([
      `Room Accommodation (${activeBill.roomDetails?.roomType} #${activeBill.roomDetails?.roomNumber})`,
      'Room Charges',
      `$${Number(activeBill.roomDetails?.pricePerNight || 0).toFixed(2)}`,
      `${activeBill.roomDetails?.numberOfNights || 1} Night(s)`,
      `$${Number(activeBill.roomCharges || 0).toFixed(2)}`,
    ]);

    // Additional services rows
    (activeBill.additionalServices || []).forEach((item) => {
      tableRows.push([
        item.name,
        item.category,
        `$${Number(item.unitPrice).toFixed(2)}`,
        `${item.quantity}`,
        `$${Number(item.totalPrice).toFixed(2)}`,
      ]);
    });

    // Extra charges if any
    if (activeBill.extraCharges > 0) {
      tableRows.push([
        `Extra Charges (${activeBill.extraChargesReason || 'Additional incidentals'})`,
        'Extra Charges',
        `$${Number(activeBill.extraCharges).toFixed(2)}`,
        '1',
        `$${Number(activeBill.extraCharges).toFixed(2)}`,
      ]);
    }

    // Generate table
    doc.autoTable({
      head: tableHeaders,
      body: tableRows,
      startY: 74,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });

    const finalY = doc.lastAutoTable.finalY + 8;

    // Financial summary box on right side
    const summaryX = 120;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', summaryX, finalY);
    doc.text(`$${Number(activeBill.subtotal).toFixed(2)}`, 190, finalY, { align: 'right' });

    doc.text(`Discount (${activeBill.discountPercentage || 0}%):`, summaryX, finalY + 6);
    doc.text(`-$${Number(activeBill.discountAmount || 0).toFixed(2)}`, 190, finalY + 6, { align: 'right' });

    doc.text(`GST Tax (${activeBill.taxPercentage || 12}%):`, summaryX, finalY + 12);
    doc.text(`+$${Number(activeBill.taxAmount || 0).toFixed(2)}`, 190, finalY + 12, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Grand Total:', summaryX, finalY + 20);
    doc.text(`$${Number(activeBill.grandTotal).toFixed(2)}`, 190, finalY + 20, { align: 'right' });

    doc.setFontSize(9);
    doc.text('Paid Amount:', summaryX, finalY + 26);
    doc.text(`$${Number(activeBill.paidAmount || 0).toFixed(2)}`, 190, finalY + 26, { align: 'right' });

    doc.setTextColor(activeBill.balanceAmount > 0 ? 185 : 16, activeBill.balanceAmount > 0 ? 28 : 120, activeBill.balanceAmount > 0 ? 28 : 72);
    doc.text('Balance Due:', summaryX, finalY + 32);
    doc.text(`$${Number(activeBill.balanceAmount || 0).toFixed(2)}`, 190, finalY + 32, { align: 'right' });

    // Terms note
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'Thank you for staying at Grand Horizon Hotel. All charges are subject to statutory taxes and hotel policies.',
      14,
      finalY + 45
    );

    doc.save(`Invoice_${activeBill.invoiceNumber}.pdf`);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Invoice #${activeBill.invoiceNumber}`}
        subtitle={`Issued to ${activeBill.customer?.name || 'Guest'}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <StatusBadge status={activeBill.paymentStatus} size="sm" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAddService(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add Service Item
              </button>

              <button
                onClick={() => setShowPayment(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Record Payment
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>

              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
          </div>

          {/* Printable Invoice Container */}
          <div
            id="printable-invoice"
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6"
          >
            {/* Header: Hotel Brand & Invoice details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md">
                  <Hotel className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    GRAND HORIZON HOTEL
                  </h2>
                  <p className="text-xs text-slate-500">
                    777 Oceanfront Boulevard • GSTIN: 29AAACH7409R1ZX
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
                  Tax Invoice
                </span>
                <h3 className="text-lg font-bold text-slate-900">{activeBill.invoiceNumber}</h3>
                <p className="text-xs text-slate-500">
                  Date: {new Date(activeBill.issueDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Guest & Reservation Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">Billed To</p>
                <h4 className="text-sm font-bold text-slate-900">{activeBill.customer?.name}</h4>
                <p className="text-slate-600">Phone: {activeBill.customer?.phone}</p>
                <p className="text-slate-600">Email: {activeBill.customer?.email}</p>
                {activeBill.customer?.address && (
                  <p className="text-slate-600">Address: {activeBill.customer.address}</p>
                )}
              </div>

              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">Stay Details</p>
                <p className="text-slate-700 font-semibold">
                  Booking ID: <span className="text-brand-700">{activeBill.booking?.bookingId}</span>
                </p>
                <p className="text-slate-600">
                  Room: #{activeBill.roomDetails?.roomNumber} ({activeBill.roomDetails?.roomType})
                </p>
                <p className="text-slate-600">
                  Duration: {activeBill.roomDetails?.numberOfNights} Night(s) @ $
                  {activeBill.roomDetails?.pricePerNight}/night
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-700 font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-center">Qty / Nights</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-3 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Room Charges */}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        Room Charges (Room #{activeBill.roomDetails?.roomNumber} -{' '}
                        {activeBill.roomDetails?.roomType})
                      </td>
                      <td className="py-3 px-3 text-slate-500">Accommodation</td>
                      <td className="py-3 px-3 text-right font-medium text-slate-600">
                        ${Number(activeBill.roomDetails?.pricePerNight || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-slate-600">
                        {activeBill.roomDetails?.numberOfNights || 1} Night(s)
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        ${Number(activeBill.roomCharges || 0).toFixed(2)}
                      </td>
                      <td></td>
                    </tr>

                    {/* Additional Services */}
                    {(activeBill.additionalServices || []).map((service) => (
                      <tr key={service._id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-semibold text-slate-900">{service.name}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {service.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-600">
                          ${Number(service.unitPrice).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-slate-600">
                          {service.quantity}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          ${Number(service.totalPrice).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveService(service._id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Remove service item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Extra Charges */}
                    {activeBill.extraCharges > 0 && (
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          Extra Charges ({activeBill.extraChargesReason || 'Additional fees'})
                        </td>
                        <td className="py-3 px-3 text-slate-500">Incidentals</td>
                        <td className="py-3 px-3 text-right font-medium text-slate-600">
                          ${Number(activeBill.extraCharges).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-slate-600">1</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          ${Number(activeBill.extraCharges).toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculation Breakdown Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200">
              {/* Left: Edit discount & extra charges control */}
              <div className="w-full sm:w-1/2">
                {!isEditingCharges ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingCharges(true)}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5"
                  >
                    <Percent className="w-3.5 h-3.5" />
                    Adjust Discount, GST %, or Extra Incidentals
                  </button>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <p className="text-xs font-bold text-slate-700 uppercase">
                      Adjust Charges & Discounts
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-slate-600 mb-1">Discount (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={discountPercent}
                          onChange={(e) => setDiscountPercent(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Tax / GST (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={taxPercent}
                          onChange={(e) => setTaxPercent(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-slate-600 mb-1">Extra Fee ($)</label>
                        <input
                          type="number"
                          min="0"
                          value={extraCharges}
                          onChange={(e) => setExtraCharges(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1">Extra Fee Reason</label>
                        <input
                          type="text"
                          placeholder="e.g. Late checkout"
                          value={extraChargesReason}
                          onChange={(e) => setExtraChargesReason(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingCharges(false)}
                        className="px-2.5 py-1 text-xs text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveCharges}
                        disabled={updatingCharges}
                        className="px-3 py-1 bg-brand-600 text-white rounded-lg text-xs font-bold"
                      >
                        {updatingCharges ? 'Recalculating...' : 'Apply Recalculation'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Itemized Financial Totals */}
              <div className="w-full sm:w-1/2 max-w-xs space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Room Charges:</span>
                  <span className="font-semibold text-slate-800">
                    ${Number(activeBill.roomCharges || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Additional Services:</span>
                  <span className="font-semibold text-slate-800">
                    ${Number(activeBill.totalAdditionalServices || 0).toFixed(2)}
                  </span>
                </div>

                {activeBill.extraCharges > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Extra Charges:</span>
                    <span className="font-semibold text-slate-800">
                      ${Number(activeBill.extraCharges).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-800 font-bold pt-1 border-t border-slate-100">
                  <span>Subtotal:</span>
                  <span>${Number(activeBill.subtotal || 0).toFixed(2)}</span>
                </div>

                {activeBill.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({activeBill.discountPercentage}%):</span>
                    <span>-${Number(activeBill.discountAmount).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Tax ({activeBill.taxPercentage}% GST):</span>
                  <span className="font-semibold text-slate-800">
                    +${Number(activeBill.taxAmount || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span>${Number(activeBill.grandTotal || 0).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-xs text-slate-600">
                  <span>Total Paid:</span>
                  <span className="font-bold text-emerald-600">
                    ${Number(activeBill.paidAmount || 0).toFixed(2)}
                  </span>
                </div>

                <div
                  className={`flex justify-between text-sm font-black p-2 rounded-xl ${
                    activeBill.balanceAmount > 0
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  <span>Balance Due:</span>
                  <span>${Number(activeBill.balanceAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Transactions History if any */}
            {activeBill.payments && activeBill.payments.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Payment History
                </p>
                <div className="space-y-1.5">
                  {activeBill.payments.map((p) => (
                    <div
                      key={p._id || p.paymentId}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs border border-slate-200/60"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-bold text-slate-800">{p.paymentMethod}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">
                          {new Date(p.paymentDate).toLocaleDateString()}
                        </span>
                        {p.transactionReference && (
                          <span className="text-[11px] text-slate-400">
                            (Ref: {p.transactionReference})
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-emerald-600">+${p.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Sub-modals for adding services and recording payments */}
      <AddServiceModal
        isOpen={showAddService}
        onClose={() => setShowAddService(false)}
        billId={activeBill._id}
        onServiceAdded={(updated) => {
          setActiveBill(updated);
          if (onBillUpdated) onBillUpdated(updated);
        }}
      />

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        bill={activeBill}
        onPaymentRecorded={(data) => {
          setActiveBill(data.bill);
          if (onBillUpdated) onBillUpdated(data.bill);
        }}
      />
    </>
  );
};
