import Booking from '../models/Booking.js';
import Customer from '../models/Customer.js';
import Room from '../models/Room.js';
import Bill from '../models/Bill.js';
import Housekeeping from '../models/Housekeeping.js';

// Helper to generate unique booking ID
const generateBookingId = () => {
  const year = new Date().getFullYear();
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `BK-${year}-${randomStr}`;
};

// Helper to generate invoice number
const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `INV-${year}-${randomStr}`;
};

// @desc    Get all bookings with filters & search
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res) => {
  try {
    const { status, search, startDate, endDate, roomId } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (roomId) {
      query.room = roomId;
    }

    if (startDate && endDate) {
      query.checkInDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    let bookings = await Booking.find(query)
      .populate('customer')
      .populate('room')
      .populate('bill')
      .sort({ createdAt: -1 });

    // In-memory search filter for populated customer name/phone or bookingId
    if (search) {
      const s = search.toLowerCase();
      bookings = bookings.filter((b) => {
        const idMatch = b.bookingId?.toLowerCase().includes(s);
        const customerMatch =
          b.customer?.name?.toLowerCase().includes(s) ||
          b.customer?.phone?.toLowerCase().includes(s) ||
          b.customer?.email?.toLowerCase().includes(s);
        const roomMatch = b.room?.roomNumber?.toLowerCase().includes(s);
        return idMatch || customerMatch || roomMatch;
      });
    }

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching bookings',
    });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer')
      .populate('room')
      .populate('bill');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a new customer booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      idType,
      idNumber,
      roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      specialRequests,
    } = req.body;

    // Validation
    if (!customerName || !customerPhone || !customerEmail || !roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required booking details',
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dates provided',
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date',
      });
    }

    // Calculate number of nights
    const diffTime = Math.abs(checkOut - checkIn);
    const numberOfNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Verify room existence
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Selected room not found',
      });
    }

    // Strictly check for overlapping bookings for this specific room
    const overlappingBooking = await Booking.findOne({
      room: roomId,
      status: { $in: ['Reserved', 'Checked-In'] },
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
    });

    if (overlappingBooking) {
      return res.status(400).json({
        success: false,
        message: `Room ${room.roomNumber} is already booked from ${new Date(
          overlappingBooking.checkInDate
        ).toLocaleDateString()} to ${new Date(
          overlappingBooking.checkOutDate
        ).toLocaleDateString()} (Booking ID: ${overlappingBooking.bookingId})`,
      });
    }

    // Find or create customer
    let customer = await Customer.findOne({
      $or: [{ email: customerEmail.trim().toLowerCase() }, { phone: customerPhone.trim() }],
    });

    if (!customer) {
      customer = await Customer.create({
        name: customerName.trim(),
        email: customerEmail.trim().toLowerCase(),
        phone: customerPhone.trim(),
        address: customerAddress || '',
        idType: idType || 'Passport',
        idNumber: idNumber || '',
      });
    } else {
      // Update details if provided
      if (customerAddress) customer.address = customerAddress;
      if (idType) customer.idType = idType;
      if (idNumber) customer.idNumber = idNumber;
      await customer.save();
    }

    // Calculate room charges
    const roomPricePerNight = room.pricePerNight;
    const totalRoomCharges = roomPricePerNight * numberOfNights;

    // Generate unique IDs
    const bookingId = generateBookingId();
    const invoiceNumber = generateInvoiceNumber();

    // Create the booking
    const booking = new Booking({
      bookingId,
      customer: customer._id,
      room: room._id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfNights,
      numberOfGuests: Number(numberOfGuests) || 1,
      roomPricePerNight,
      totalRoomCharges,
      status: 'Reserved',
      specialRequests: specialRequests || '',
    });

    // Create associated dynamic initial bill
    const bill = new Bill({
      invoiceNumber,
      booking: booking._id,
      customer: customer._id,
      room: room._id,
      roomDetails: {
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        pricePerNight: room.pricePerNight,
        numberOfNights,
      },
      roomCharges: totalRoomCharges,
      additionalServices: [],
      totalAdditionalServices: 0,
      extraCharges: 0,
      subtotal: totalRoomCharges,
      discountPercentage: 0,
      discountAmount: 0,
      taxPercentage: 12, // 12% GST
      taxAmount: Number(((totalRoomCharges * 12) / 100).toFixed(2)),
      grandTotal: Number((totalRoomCharges + (totalRoomCharges * 12) / 100).toFixed(2)),
      paidAmount: 0,
      balanceAmount: Number((totalRoomCharges + (totalRoomCharges * 12) / 100).toFixed(2)),
      paymentStatus: 'Pending',
    });

    await bill.save();
    booking.bill = bill._id;
    await booking.save();

    // If checkInDate is today, set room status to Reserved
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingCheckInDay = new Date(checkIn);
    bookingCheckInDay.setHours(0, 0, 0, 0);

    if (bookingCheckInDay.getTime() === today.getTime() && room.status === 'Available') {
      room.status = 'Reserved';
      await room.save();
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customer')
      .populate('room')
      .populate('bill');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating booking',
    });
  }
};

// @desc    Process customer check-in
// @route   PUT /api/bookings/:id/check-in
// @access  Private
export const checkInCustomer = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status === 'Checked-In') {
      return res.status(400).json({
        success: false,
        message: 'Guest is already checked in',
      });
    }

    if (booking.status === 'Checked-Out' || booking.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot check-in a booking with status '${booking.status}'`,
      });
    }

    // Update booking status
    booking.status = 'Checked-In';
    booking.actualCheckIn = new Date();
    await booking.save();

    // Update room status to Occupied
    await Room.findByIdAndUpdate(booking.room._id, {
      status: 'Occupied',
    });

    const updatedBooking = await Booking.findById(booking._id)
      .populate('customer')
      .populate('room')
      .populate('bill');

    res.json({
      success: true,
      message: `Customer successfully checked in to Room ${booking.room.roomNumber}`,
      data: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing check-in',
    });
  }
};

// @desc    Process customer check-out
// @route   PUT /api/bookings/:id/check-out
// @access  Private
export const checkOutCustomer = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room')
      .populate('bill');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status !== 'Checked-In') {
      return res.status(400).json({
        success: false,
        message: `Booking must be in 'Checked-In' status to process check-out. Current status: '${booking.status}'`,
      });
    }

    // Check bill payment status - user should be notified if balance pending
    let bill = null;
    if (booking.bill) {
      bill = await Bill.findById(booking.bill);
      if (bill) {
        bill.recalculateTotals();
        await bill.save();
      }
    }

    // Update booking
    booking.status = 'Checked-Out';
    booking.actualCheckOut = new Date();
    await booking.save();

    // Update room status to Available and cleaning status to Dirty
    await Room.findByIdAndUpdate(booking.room._id, {
      status: 'Available',
      cleaningStatus: 'Dirty',
    });

    // Update or create housekeeping record requiring cleaning
    await Housekeeping.findOneAndUpdate(
      { room: booking.room._id },
      {
        status: 'Dirty',
        priority: 'High',
        remarks: `Needs turnover cleaning after checkout of booking ${booking.bookingId}`,
      },
      { upsert: true }
    );

    const updatedBooking = await Booking.findById(booking._id)
      .populate('customer')
      .populate('room')
      .populate('bill');

    res.json({
      success: true,
      message: `Checkout completed for Room ${booking.room.roomNumber}. Room marked as Dirty for housekeeping.`,
      data: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing check-out',
    });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status === 'Checked-Out') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an already completed booking',
      });
    }

    booking.status = 'Cancelled';
    await booking.save();

    // Free room status if it was Reserved
    const room = await Room.findById(booking.room);
    if (room && room.status === 'Reserved') {
      room.status = 'Available';
      await room.save();
    }

    res.json({
      success: true,
      message: `Booking ${booking.bookingId} cancelled successfully`,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
