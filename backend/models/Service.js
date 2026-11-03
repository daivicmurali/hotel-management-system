import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Food and Restaurant',
        'Laundry',
        'Room Service',
        'Spa',
        'Extra Bed',
        'Other Services',
      ],
    },
    price: {
      type: Number,
      required: [true, 'Service price is required'],
      min: [0, 'Price cannot be negative'],
    },
    description: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    icon: {
      type: String,
      default: 'Sparkles',
    },
  },
  { timestamps: true }
);

serviceSchema.index({ category: 1, isAvailable: 1 });

export default mongoose.model('Service', serviceSchema);
