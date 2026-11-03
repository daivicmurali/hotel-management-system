import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    roomType: {
      type: String,
      required: [true, 'Room type is required'],
      enum: ['Single Room', 'Double Room', 'Deluxe Room', 'Suite Room'],
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [0, 'Price cannot be negative'],
    },
    capacity: {
      type: Number,
      required: [true, 'Room capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      default: 2,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Reserved', 'Maintenance'],
      default: 'Available',
    },
    cleaningStatus: {
      type: String,
      enum: ['Clean', 'Dirty', 'Cleaning', 'Maintenance'],
      default: 'Clean',
    },
    amenities: {
      type: [String],
      default: ['High-speed Wi-Fi', 'Smart TV', 'Air Conditioning', 'En-suite Bathroom'],
    },
    floor: {
      type: Number,
      default: 1,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Index for search & filtering
roomSchema.index({ roomNumber: 1, roomType: 1, status: 1 });

export default mongoose.model('Room', roomSchema);
