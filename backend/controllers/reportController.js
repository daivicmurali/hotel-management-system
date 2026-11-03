import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Bill from '../models/Bill.js';
import Payment from '../models/Payment.js';

// @desc    Get comprehensive occupancy and revenue reports
// @route   GET /api/reports/analytics
// @access  Private
export const getAnalyticsReport = async (req, res) => {
  try {
    const { range = '30days' } = req.query;

    const daysCount = range === '7days' ? 7 : range === '90days' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);
    startDate.setHours(0, 0, 0, 0);

    // 1. Daily Occupancy & Revenue trend over selected range
    const trendData = [];
    const totalRooms = await Room.countDocuments();

    for (let i = daysCount - 1; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const dStart = new Date(day);
      dStart.setHours(0, 0, 0, 0);
      const dEnd = new Date(day);
      dEnd.setHours(23, 59, 59, 999);

      // Bookings active on this day
      const activeBookings = await Booking.countDocuments({
        status: { $in: ['Reserved', 'Checked-In', 'Checked-Out'] },
        checkInDate: { $lte: dEnd },
        checkOutDate: { $gte: dStart },
      });

      // Daily revenue from payments
      const payments = await Payment.aggregate([
        {
          $match: {
            paymentDate: { $gte: dStart, $lte: dEnd },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$amount' },
          },
        },
      ]);

      const occupancyRate = totalRooms > 0 ? Number(((activeBookings / totalRooms) * 100).toFixed(1)) : 0;

      trendData.push({
        date: dStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        occupancyRate: Math.min(100, occupancyRate),
        occupiedRooms: activeBookings,
        revenue: payments.length > 0 ? Number(payments[0].revenue.toFixed(2)) : 0,
      });
    }

    // 2. Revenue by Service Category
    const servicesRevenueByCategory = await Bill.aggregate([
      { $unwind: '$additionalServices' },
      {
        $group: {
          _id: '$additionalServices.category',
          totalRevenue: { $sum: '$additionalServices.totalPrice' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // 3. Payment Method Distribution
    const paymentMethods = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // 4. Performance by Room Type
    const roomTypeStats = await Booking.aggregate([
      {
        $lookup: {
          from: 'rooms',
          localField: 'room',
          foreignField: '_id',
          as: 'roomInfo',
        },
      },
      { $unwind: '$roomInfo' },
      {
        $group: {
          _id: '$roomInfo.roomType',
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalRoomCharges' },
          avgNights: { $avg: '$numberOfNights' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        trendData,
        servicesRevenueByCategory,
        paymentMethods,
        roomTypeStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating reports',
    });
  }
};
