import mongoose from 'mongoose';

const additionalServiceItemSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Food and Restaurant',
      'Laundry',
      'Room Service',
      'Spa',
      'Extra Bed',
      'Other Services',
    ],
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const billSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    roomDetails: {
      roomNumber: String,
      roomType: String,
      pricePerNight: Number,
      numberOfNights: Number,
    },
    roomCharges: {
      type: Number,
      required: true,
      min: 0,
    },
    additionalServices: [additionalServiceItemSchema],
    totalAdditionalServices: {
      type: Number,
      default: 0,
    },
    extraCharges: {
      type: Number,
      default: 0,
    },
    extraChargesReason: {
      type: String,
      default: '',
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    taxPercentage: {
      type: Number,
      default: 12, // 12% GST standard hotel bracket
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    balanceAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Partially Paid'],
      default: 'Pending',
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: 'Thank you for choosing Grand Horizon Hotel. We hope you enjoyed your stay!',
    },
  },
  { timestamps: true }
);

// Method to calculate all totals dynamically
billSchema.methods.recalculateTotals = function () {
  // Sum additional services
  this.totalAdditionalServices = this.additionalServices.reduce(
    (sum, item) => sum + (item.totalPrice || item.quantity * item.unitPrice),
    0
  );

  // Subtotal = room charges + additional services + extra charges
  this.subtotal = Number(
    (this.roomCharges + this.totalAdditionalServices + (this.extraCharges || 0)).toFixed(2)
  );

  // Calculate discount
  if (this.discountPercentage > 0) {
    this.discountAmount = Number(((this.subtotal * this.discountPercentage) / 100).toFixed(2));
  } else if (!this.discountAmount) {
    this.discountAmount = 0;
  }

  const taxableAmount = Math.max(0, this.subtotal - this.discountAmount);

  // Calculate GST
  this.taxAmount = Number(((taxableAmount * (this.taxPercentage || 12)) / 100).toFixed(2));

  // Grand total
  this.grandTotal = Number((taxableAmount + this.taxAmount).toFixed(2));

  // Balance calculation
  this.balanceAmount = Number(Math.max(0, this.grandTotal - (this.paidAmount || 0)).toFixed(2));

  // Update payment status
  if (this.paidAmount >= this.grandTotal && this.grandTotal > 0) {
    this.paymentStatus = 'Paid';
  } else if (this.paidAmount > 0 && this.paidAmount < this.grandTotal) {
    this.paymentStatus = 'Partially Paid';
  } else {
    this.paymentStatus = 'Pending';
  }
};

billSchema.index({ booking: 1 });
billSchema.index({ customer: 1 });
billSchema.index({ paymentStatus: 1 });

export default mongoose.model('Bill', billSchema);
