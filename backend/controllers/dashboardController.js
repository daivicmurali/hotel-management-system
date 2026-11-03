import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import Bill from '../models/Bill.js';
import Payment from '../models/Payment.js';
import Housekeeping from '../models/Housekeeping.js';

// @desc    Get all dynamic dashboard statistics & chart analytics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Room Counts
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'Available' });
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const reservedRooms = await Room.countDocuments({ status: 'Reserved' });
    const maintenanceRooms = await Room.countDocuments({ status: 'Maintenance' });

    // Room Occupancy Percentage
    const occupancyRate = totalRooms > 0 ? Number(((occupiedRooms / totalRooms) * 100).toFixed(1)) : 0;

    // 2. Today's Date Range (00:00:00 to 23:59:59 local/UTC normalized)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Today's Check-ins (either scheduled for today or actually checked in today)
    const todaysCheckInsCount = await Booking.countDocuments({
      $or: [
        { checkInDate: { $gte: startOfToday, $lte: endOfToday } },
        { actualCheckIn: { $gte: startOfToday, $lte: endOfToday } },
      ],
    });

    const todaysCheckInsList = await Booking.find({
      $or: [
        { checkInDate: { $gte: startOfToday, $lte: endOfToday } },
        { actualCheckIn: { $gte: startOfToday, $lte: endOfToday } },
      ],
    })
      .populate('customer')
      .populate('room')
      .limit(6);

    // Today's Check-outs (either scheduled for today or actually checked out today)
    const todaysCheckOutsCount = await Booking.countDocuments({
      $or: [
        { checkOutDate: { $gte: startOfToday, $lte: endOfToday } },
        { actualCheckOut: { $gte: startOfToday, $lte: endOfToday } },
      ],
    });

    const todaysCheckOutsList = await Booking.find({
      $or: [
        { checkOutDate: { $gte: startOfToday, $lte: endOfToday } },
        { actualCheckOut: { $gte: startOfToday, $lte: endOfToday } },
      ],
    })
      .populate('customer')
      .populate('room')
      .limit(6);

    // 3. Revenue Metrics
    const paymentAggregation = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
        },
      },
    ]);
    const totalRevenue = paymentAggregation.length > 0 ? paymentAggregation[0].totalRevenue : 0;

    // Additional service revenue vs Room charges from Bills
    const billBreakdown = await Bill.aggregate([
      {
        $group: {
          _id: null,
          totalRoomCharges: { $sum: '$roomCharges' },
          totalServicesRevenue: { $sum: '$totalAdditionalServices' },
          totalTaxCollected: { $sum: '$taxAmount' },
          totalPendingBalance: { $sum: '$balanceAmount' },
        },
      },
    ]);

    const financialOverview = billBreakdown[0] || {
      totalRoomCharges: 0,
      totalServicesRevenue: 0,
      totalTaxCollected: 0,
      totalPendingBalance: 0,
    };

    // 4. Room Type Breakdown & Performance
    const roomsByType = await Room.aggregate([
      {
        $group: {
          _id: '$roomType',
          total: { $sum: 1 },
          occupied: {
            $sum: { $cond: [{ $eq: ['$status', 'Occupied'] }, 1, 0] },
          },
          avgPrice: { $avg: '$pricePerNight' },
        },
      },
    ]);

    // 5. Weekly Revenue Analytics (Last 7 Days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const dayPayments = await Payment.aggregate([
        {
          $match: {
            paymentDate: { $gte: dayStart, $lte: dayEnd },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$amount' },
          },
        },
      ]);

      const dayBookings = await Booking.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });

      last7Days.push({
        date: dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
        revenue: dayPayments.length > 0 ? dayPayments[0].revenue : 0,
        bookings: dayBookings,
      });
    }

    // 6. Housekeeping status count
    const housekeepingStats = {
      clean: await Housekeeping.countDocuments({ status: 'Clean' }),
      dirty: await Housekeeping.countDocuments({ status: 'Dirty' }),
      cleaning: await Housekeeping.countDocuments({ status: 'Cleaning' }),
      maintenance: await Housekeeping.countDocuments({ status: 'Maintenance' }),
    };

    // 7. Recent Bookings (top 5)
    const recentBookings = await Booking.find()
      .populate('customer')
      .populate('room')
      .populate('bill')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      data: {
        summary: {
          totalRooms,
          availableRooms,
          occupiedRooms,
          reservedRooms,
          maintenanceRooms,
          occupancyRate,
          todaysCheckIns: todaysCheckInsCount,
          todaysCheckOuts: todaysCheckOutsCount,
          totalRevenue: Number(totalRevenue.toFixed(2)),
          totalPendingBalance: Number(financialOverview.totalPendingBalance.toFixed(2)),
          totalRoomCharges: Number(financialOverview.totalRoomCharges.toFixed(2)),
          totalServicesRevenue: Number(financialOverview.totalServicesRevenue.toFixed(2)),
        },
        weeklyRevenue: last7Days,
        roomTypeDistribution: roomsByType,
        housekeepingStats,
        recentBookings,
        todaysCheckInsList,
        todaysCheckOutsList,
      },
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching dashboard statistics',
    });
  }
};
