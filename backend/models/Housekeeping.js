import mongoose from 'mongoose';

const housekeepingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      unique: true, // One active housekeeping tracking entry per room
    },
    status: {
      type: String,
      enum: ['Clean', 'Dirty', 'Cleaning', 'Maintenance'],
      default: 'Clean',
    },
    assignedStaff: {
      type: String,
      default: 'Unassigned',
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    lastCleaned: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

housekeepingSchema.index({ status: 1, priority: 1 });

export default mongoose.model('Housekeeping', housekeepingSchema);
