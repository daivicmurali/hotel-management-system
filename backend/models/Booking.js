import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room is required'],
    },
    checkInDate: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    actualCheckIn: {
      type: Date,
    },
    actualCheckOut: {
      type: Date,
    },
    numberOfNights: {
      type: Number,
      required: true,
      min: 1,
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    roomPricePerNight: {
      type: Number,
      required: true,
    },
    totalRoomCharges: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Reserved', 'Checked-In', 'Checked-Out', 'Cancelled'],
      default: 'Reserved',
    },
    specialRequests: {
      type: String,
      default: '',
    },
    bill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bill',
    },
  },
  { timestamps: true }
);

bookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1, status: 1 });
bookingSchema.index({ customer: 1 });

export default mongoose.model('Booking', bookingSchema);
