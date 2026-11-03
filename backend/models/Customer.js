import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },
    address: {
      type: String,
      default: '',
    },
    idType: {
      type: String,
      enum: ['Passport', 'Driving License', 'National ID', 'Voter ID', 'Other'],
      default: 'Passport',
    },
    idNumber: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

customerSchema.index({ email: 1, phone: 1 });

export default mongoose.model('Customer', customerSchema);
