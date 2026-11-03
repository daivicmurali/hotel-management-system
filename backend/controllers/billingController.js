import Bill from '../models/Bill.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Payment from '../models/Payment.js';

// Helper to generate unique payment ID
const generatePaymentId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `PAY-${timestamp}-${random}`;
};

// @desc    Get all bills with filters
// @route   GET /api/bills
// @access  Private
export const getBills = async (req, res) => {
  try {
    const { paymentStatus, search, startDate, endDate } = req.query;

    const query = {};

    if (paymentStatus && paymentStatus !== 'All') {
      query.paymentStatus = paymentStatus;
    }

    if (startDate && endDate) {
      query.issueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    let bills = await Bill.find(query)
      .populate('booking')
      .populate('customer')
      .populate('room')
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      bills = bills.filter((b) => {
        return (
          b.invoiceNumber?.toLowerCase().includes(s) ||
          b.customer?.name?.toLowerCase().includes(s) ||
          b.customer?.phone?.toLowerCase().includes(s) ||
          b.roomDetails?.roomNumber?.toLowerCase().includes(s)
        );
      });
    }

    res.json({
      success: true,
      count: bills.length,
      data: bills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching bills',
    });
  }
};

// @desc    Get bill by ID with payments history
// @route   GET /api/bills/:id
// @access  Private
export const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('booking')
      .populate('customer')
      .populate('room');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    // Find all payments made towards this bill
    const payments = await Payment.find({ bill: bill._id }).sort({ paymentDate: -1 });

    res.json({
      success: true,
      data: {
        ...bill.toObject(),
        payments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add additional service item to an active bill
// @route   POST /api/bills/:id/add-service
// @access  Private
export const addServiceToBill = async (req, res) => {
  try {
    const { serviceId, name, category, quantity, unitPrice } = req.body;

    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    let serviceName = name;
    let serviceCategory = category;
    let servicePrice = Number(unitPrice);

    // If serviceId passed, look up service catalog
    if (serviceId) {
      const serviceCatalog = await Service.findById(serviceId);
      if (serviceCatalog) {
        serviceName = serviceCatalog.name;
        serviceCategory = serviceCatalog.category;
        servicePrice = servicePrice || serviceCatalog.price;
      }
    }

    if (!serviceName || !serviceCategory || isNaN(servicePrice)) {
      return res.status(400).json({
        success: false,
        message: 'Valid service name, category, and price are required',
      });
    }

    const qty = Number(quantity) || 1;
    const totalPrice = Number((servicePrice * qty).toFixed(2));

    bill.additionalServices.push({
      service: serviceId || null,
      name: serviceName,
      category: serviceCategory,
      quantity: qty,
      unitPrice: servicePrice,
      totalPrice,
      date: new Date(),
    });

    bill.recalculateTotals();
    await bill.save();

    const populatedBill = await Bill.findById(bill._id)
      .populate('booking')
      .populate('customer')
      .populate('room');

    res.json({
      success: true,
      message: `Added '${serviceName}' to bill`,
      data: populatedBill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding service to bill',
    });
  }
};

// @desc    Remove additional service from bill
// @route   DELETE /api/bills/:id/services/:serviceItemId
// @access  Private
export const removeServiceFromBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    bill.additionalServices = bill.additionalServices.filter(
      (item) => item._id.toString() !== req.params.serviceItemId
    );

    bill.recalculateTotals();
    await bill.save();

    const populatedBill = await Bill.findById(bill._id)
      .populate('booking')
      .populate('customer')
      .populate('room');

    res.json({
      success: true,
      message: 'Service item removed from bill',
      data: populatedBill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error removing service item',
    });
  }
};

// @desc    Update extra charges, discounts, and taxes on bill
// @route   PUT /api/bills/:id/update-charges
// @access  Private
export const updateBillCharges = async (req, res) => {
  try {
    const { extraCharges, extraChargesReason, discountPercentage, taxPercentage, notes } =
      req.body;

    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    if (extraCharges !== undefined) bill.extraCharges = Math.max(0, Number(extraCharges));
    if (extraChargesReason !== undefined) bill.extraChargesReason = extraChargesReason;
    if (discountPercentage !== undefined)
      bill.discountPercentage = Math.min(100, Math.max(0, Number(discountPercentage)));
    if (taxPercentage !== undefined) bill.taxPercentage = Math.max(0, Number(taxPercentage));
    if (notes !== undefined) bill.notes = notes;

    bill.recalculateTotals();
    await bill.save();

    const populatedBill = await Bill.findById(bill._id)
      .populate('booking')
      .populate('customer')
      .populate('room');

    res.json({
      success: true,
      message: 'Bill recalculated and updated successfully',
      data: populatedBill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating bill charges',
    });
  }
};

// @desc    Record customer payment against bill
// @route   POST /api/bills/:id/payments
// @access  Private
export const recordPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, transactionReference, remarks } = req.body;

    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found',
      });
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid payment amount greater than 0',
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required (Cash, Card, UPI, Bank Transfer)',
      });
    }

    // Create payment entry
    const payment = await Payment.create({
      paymentId: generatePaymentId(),
      bill: bill._id,
      booking: bill.booking,
      customer: bill.customer,
      amount: payAmount,
      paymentMethod,
      transactionReference: transactionReference || '',
      remarks: remarks || '',
      paymentDate: new Date(),
    });

    // Update bill paid amount & recalculate status
    bill.paidAmount = Number(((bill.paidAmount || 0) + payAmount).toFixed(2));
    bill.recalculateTotals();
    await bill.save();

    const payments = await Payment.find({ bill: bill._id }).sort({ paymentDate: -1 });
    const populatedBill = await Bill.findById(bill._id)
      .populate('booking')
      .populate('customer')
      .populate('room');

    res.status(201).json({
      success: true,
      message: `Payment of $${payAmount.toFixed(2)} recorded successfully via ${paymentMethod}`,
      data: {
        bill: populatedBill,
        payment,
        payments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing payment',
    });
  }
};

// @desc    Get all payments history
// @route   GET /api/payments
// @access  Private
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('bill')
      .populate('customer')
      .populate('booking')
      .sort({ paymentDate: -1 });

    res.json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
