import Housekeeping from '../models/Housekeeping.js';
import Room from '../models/Room.js';

// @desc    Get all housekeeping records with room details
// @route   GET /api/housekeeping
// @access  Private
export const getHousekeeping = async (req, res) => {
  try {
    const { status, priority, staff } = req.query;

    const query = {};
    if (status && status !== 'All') {
      query.status = status;
    }
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    if (staff && staff !== 'All') {
      query.assignedStaff = staff;
    }

    const housekeepingList = await Housekeeping.find(query)
      .populate('room')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: housekeepingList.length,
      data: housekeepingList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching housekeeping data',
    });
  }
};

// @desc    Get rooms that specifically need cleaning (Dirty or Cleaning)
// @route   GET /api/housekeeping/dirty
// @access  Private
export const getDirtyRooms = async (req, res) => {
  try {
    const dirtyList = await Housekeeping.find({
      status: { $in: ['Dirty', 'Cleaning'] },
    })
      .populate('room')
      .sort({ priority: -1, updatedAt: -1 });

    res.json({
      success: true,
      count: dirtyList.length,
      data: dirtyList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update housekeeping status and assigned staff
// @route   PUT /api/housekeeping/:id
// @access  Private
export const updateHousekeeping = async (req, res) => {
  try {
    const { status, assignedStaff, priority, remarks } = req.body;

    const record = await Housekeeping.findById(req.params.id).populate('room');
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Housekeeping record not found',
      });
    }

    if (status) record.status = status;
    if (assignedStaff !== undefined) record.assignedStaff = assignedStaff;
    if (priority) record.priority = priority;
    if (remarks !== undefined) record.remarks = remarks;
    if (status === 'Clean') record.lastCleaned = new Date();

    await record.save();

    // Sync cleaningStatus with Room
    if (status && record.room) {
      await Room.findByIdAndUpdate(record.room._id, {
        cleaningStatus: status,
      });
    }

    const updatedRecord = await Housekeeping.findById(record._id).populate('room');

    res.json({
      success: true,
      message: `Housekeeping status updated to '${status}'`,
      data: updatedRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating housekeeping',
    });
  }
};
