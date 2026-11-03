import Room from '../models/Room.js';
import Housekeeping from '../models/Housekeeping.js';
import Booking from '../models/Booking.js';

// @desc    Get all rooms with filtering, search & sorting
// @route   GET /api/rooms
// @access  Private
export const getRooms = async (req, res) => {
  try {
    const {
      roomNumber,
      roomType,
      status,
      cleaningStatus,
      sortBy,
      minPrice,
      maxPrice,
      floor,
    } = req.query;

    const query = {};

    if (roomNumber) {
      query.roomNumber = { $regex: roomNumber, $options: 'i' };
    }
    if (roomType && roomType !== 'All') {
      query.roomType = roomType;
    }
    if (status && status !== 'All') {
      query.status = status;
    }
    if (cleaningStatus && cleaningStatus !== 'All') {
      query.cleaningStatus = cleaningStatus;
    }
    if (floor) {
      query.floor = Number(floor);
    }
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    let sort = { roomNumber: 1 };
    if (sortBy === 'price_asc') {
      sort = { pricePerNight: 1 };
    } else if (sortBy === 'price_desc') {
      sort = { pricePerNight: -1 };
    } else if (sortBy === 'capacity_desc') {
      sort = { capacity: -1 };
    } else if (sortBy === 'newest') {
      sort = { createdAt: -1 };
    }

    const rooms = await Room.find(query).sort(sort);

    res.json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching rooms',
    });
  }
};

// @desc    Check available rooms dynamically for given dates
// @route   GET /api/rooms/check-availability
// @access  Private
export const checkAvailability = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, roomType, guests } = req.query;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both checkInDate and checkOutDate',
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid check-in or check-out date format',
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be strictly after check-in date',
      });
    }

    // Find all active bookings overlapping with the desired interval:
    // overlap if booking.checkInDate < reqCheckOut AND booking.checkOutDate > reqCheckIn
    const overlappingBookings = await Booking.find({
      status: { $in: ['Reserved', 'Checked-In'] },
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
    }).select('room');

    const bookedRoomIds = overlappingBookings.map((b) => b.room.toString());

    // Build room query
    const roomQuery = {
      _id: { $nin: bookedRoomIds },
      status: { $ne: 'Maintenance' },
    };

    if (roomType && roomType !== 'All') {
      roomQuery.roomType = roomType;
    }

    if (guests) {
      roomQuery.capacity = { $gte: Number(guests) };
    }

    const availableRooms = await Room.find(roomQuery).sort({ pricePerNight: 1 });

    res.json({
      success: true,
      count: availableRooms.length,
      data: availableRooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error checking room availability',
    });
  }
};

// @desc    Get single room details
// @route   GET /api/rooms/:id
// @access  Private
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Fetch housekeeping status as well
    const housekeeping = await Housekeeping.findOne({ room: room._id });

    res.json({
      success: true,
      data: {
        ...room.toObject(),
        housekeeping,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private
export const createRoom = async (req, res) => {
  try {
    const {
      roomNumber,
      roomType,
      pricePerNight,
      capacity,
      description,
      status,
      cleaningStatus,
      amenities,
      floor,
    } = req.body;

    const existingRoom = await Room.findOne({
      roomNumber: roomNumber.trim().toUpperCase(),
    });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: `Room number ${roomNumber} already exists`,
      });
    }

    const room = await Room.create({
      roomNumber: roomNumber.trim().toUpperCase(),
      roomType,
      pricePerNight: Number(pricePerNight),
      capacity: Number(capacity) || 2,
      description: description || '',
      status: status || 'Available',
      cleaningStatus: cleaningStatus || 'Clean',
      amenities: amenities || ['High-speed Wi-Fi', 'Smart TV', 'Air Conditioning', 'En-suite Bathroom'],
      floor: floor ? Number(floor) : parseInt(roomNumber[0], 10) || 1,
    });

    // Create corresponding housekeeping entry
    await Housekeeping.create({
      room: room._id,
      status: room.cleaningStatus,
      assignedStaff: 'Unassigned',
      priority: 'Medium',
      remarks: 'Room initialized',
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating room',
    });
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private
export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check if new roomNumber conflicts with another room
    if (req.body.roomNumber && req.body.roomNumber !== room.roomNumber) {
      const conflict = await Room.findOne({
        roomNumber: req.body.roomNumber.trim().toUpperCase(),
        _id: { $ne: room._id },
      });
      if (conflict) {
        return res.status(400).json({
          success: false,
          message: `Room number ${req.body.roomNumber} is already used by another room`,
        });
      }
      req.body.roomNumber = req.body.roomNumber.trim().toUpperCase();
    }

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // If cleaningStatus updated, sync housekeeping entry
    if (req.body.cleaningStatus) {
      await Housekeeping.findOneAndUpdate(
        { room: room._id },
        { status: req.body.cleaningStatus, lastCleaned: new Date() }
      );
    }

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: updatedRoom,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating room',
    });
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check if room has active or upcoming bookings
    const activeBooking = await Booking.findOne({
      room: room._id,
      status: { $in: ['Reserved', 'Checked-In'] },
    });

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete room ${room.roomNumber} because it has an active or reserved booking (${activeBooking.bookingId})`,
      });
    }

    await Room.findByIdAndDelete(req.params.id);
    await Housekeeping.findOneAndDelete({ room: room._id });

    res.json({
      success: true,
      message: `Room ${room.roomNumber} deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting room',
    });
  }
};
