import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Customer from '../models/Customer.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Bill from '../models/Bill.js';
import Payment from '../models/Payment.js';
import Housekeeping from '../models/Housekeeping.js';

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Room.deleteMany({});
    await Customer.deleteMany({});
    await Booking.deleteMany({});
    await Service.deleteMany({});
    await Bill.deleteMany({});
    await Payment.deleteMany({});
    await Housekeeping.deleteMany({});

    console.log('[Seed] Creating default users...');
    const admin = await User.create({
      name: 'Alexander Wright',
      email: 'admin@grandhotel.com',
      password: 'password123',
      role: 'admin',
      phone: '+1 (555) 234-5678',
    });

    const receptionist = await User.create({
      name: 'Sarah Jenkins',
      email: 'receptionist@grandhotel.com',
      password: 'password123',
      role: 'receptionist',
      phone: '+1 (555) 345-6789',
    });

    console.log('[Seed] Creating services catalog...');
    const services = await Service.insertMany([
      {
        name: 'Continental Buffet Breakfast',
        category: 'Food and Restaurant',
        price: 25,
        description: 'Fresh pastries, artisan cheeses, hot dishes, and fresh juices',
        icon: 'Coffee',
      },
      {
        name: 'Gourmet 3-Course Dinner',
        category: 'Food and Restaurant',
        price: 65,
        description: 'Chef special 3-course dinner with wine pairing',
        icon: 'Utensils',
      },
      {
        name: 'Express Laundry Service',
        category: 'Laundry',
        price: 30,
        description: 'Same day wash, dry, and iron within 4 hours',
        icon: 'Shirt',
      },
      {
        name: 'Dry Cleaning & Suit Press',
        category: 'Laundry',
        price: 45,
        description: 'Professional eco-friendly dry cleaning and pressing',
        icon: 'Scissors',
      },
      {
        name: 'Late-Night In-Room Dining',
        category: 'Room Service',
        price: 35,
        description: 'Full hot meal delivered directly to your room 24/7',
        icon: 'BellRing',
      },
      {
        name: 'Fresh Exotic Fruit Platter',
        category: 'Room Service',
        price: 20,
        description: 'Seasonal tropical fruits served chilled',
        icon: 'Apple',
      },
      {
        name: 'Swedish Full Body Massage (60m)',
        category: 'Spa',
        price: 90,
        description: 'Relaxing full body therapeutic massage with essential oils',
        icon: 'Sparkles',
      },
      {
        name: 'Aromatherapy & Sauna Pass',
        category: 'Spa',
        price: 50,
        description: 'Private sauna session accompanied by customized scent therapy',
        icon: 'Flame',
      },
      {
        name: 'Deluxe Rollaway Extra Bed',
        category: 'Extra Bed',
        price: 40,
        description: 'Memory foam foldable guest bed with luxury linens',
        icon: 'BedDouble',
      },
      {
        name: 'Baby Crib & High Chair',
        category: 'Extra Bed',
        price: 15,
        description: 'Safe sanitized wooden baby cot with hypoallergenic bedding',
        icon: 'Baby',
      },
      {
        name: 'VIP Airport Limousine Transfer',
        category: 'Other Services',
        price: 75,
        description: 'Private chauffeur luxury vehicle pickup or drop-off',
        icon: 'Car',
      },
      {
        name: 'Executive Boardroom Rental (Half-day)',
        category: 'Other Services',
        price: 150,
        description: 'Audio-visual equipped 12-person private conference room',
        icon: 'Briefcase',
      },
    ]);

    console.log('[Seed] Creating rooms...');
    const roomData = [
      // Single Rooms
      {
        roomNumber: '101',
        roomType: 'Single Room',
        pricePerNight: 85,
        capacity: 1,
        floor: 1,
        description: 'Cozy, modern single room designed for solo travelers and business guests.',
        status: 'Available',
        cleaningStatus: 'Clean',
        amenities: ['High-speed Wi-Fi', 'Smart TV', 'Work Desk', 'En-suite Bathroom', 'Coffee Maker'],
      },
      {
        roomNumber: '102',
        roomType: 'Single Room',
        pricePerNight: 85,
        capacity: 1,
        floor: 1,
        description: 'Quiet courtyard-facing single room with ergonomic workstation.',
        status: 'Available',
        cleaningStatus: 'Clean',
        amenities: ['High-speed Wi-Fi', 'Smart TV', 'Work Desk', 'En-suite Bathroom'],
      },
      // Double Rooms
      {
        roomNumber: '201',
        roomType: 'Double Room',
        pricePerNight: 130,
        capacity: 2,
        floor: 2,
        description: 'Comfortable double room with plush queen-size bed and city view.',
        status: 'Occupied',
        cleaningStatus: 'Clean',
        amenities: ['High-speed Wi-Fi', 'Smart TV', 'Air Conditioning', 'En-suite Bathroom', 'Mini Fridge'],
      },
      {
        roomNumber: '202',
        roomType: 'Double Room',
        pricePerNight: 130,
        capacity: 2,
        floor: 2,
        description: 'Spacious double room with twin beds and modern walk-in shower.',
        status: 'Reserved',
        cleaningStatus: 'Clean',
        amenities: ['High-speed Wi-Fi', 'Smart TV', 'Air Conditioning', 'En-suite Bathroom'],
      },
      {
        roomNumber: '203',
        roomType: 'Double Room',
        pricePerNight: 140,
        capacity: 2,
        floor: 2,
        description: 'Corner double room with private balcony and sunset views.',
        status: 'Available',
        cleaningStatus: 'Clean',
        amenities: ['High-speed Wi-Fi', 'Smart TV', 'Balcony', 'Air Conditioning', 'En-suite Bathroom'],
      },
      // Deluxe Rooms
      {
        roomNumber: '301',
        roomType: 'Deluxe Room',
        pricePerNight: 210,
        capacity: 3,
        floor: 3,
        description: 'Premium deluxe room featuring a king-size bed, sofa lounge, and soaking tub.',
        status: 'Occupied',
        cleaningStatus: 'Clean',
        amenities: ['High-speed Wi-Fi', '55" OLED TV', 'Soaking Tub', 'Espresso Machine', 'Mini Bar', 'Bathrobes'],
      },
      {
        roomNumber: '302',
        roomType: 'Deluxe Room',
        pricePerNight: 210,
        capacity: 3,
        floor: 3,
        description: 'Luxurious room with panoramic skyline view and premium marble bath.',
        status: 'Available',
        cleaningStatus: 'Dirty', // Needs cleaning
        amenities: ['High-speed Wi-Fi', '55" OLED TV', 'Balcony', 'Espresso Machine', 'Mini Bar'],
      },
      // Suite Rooms
      {
        roomNumber: '401',
        roomType: 'Suite Room',
        pricePerNight: 350,
        capacity: 4,
        floor: 4,
        description: 'Presidential Suite with separate master bedroom, living salon, and private dining.',
        status: 'Occupied',
        cleaningStatus: 'Clean',
        amenities: ['High-speed Wi-Fi', 'Living Room', 'Dining Area', 'Jacuzzi', 'Butler Service', 'Walk-in Closet'],
      },
      {
        roomNumber: '402',
        roomType: 'Suite Room',
        pricePerNight: 320,
        capacity: 4,
        floor: 4,
        description: 'Penthouse suite with panoramic terrace and private hot tub.',
        status: 'Available',
        cleaningStatus: 'Clean',
        amenities: ['High-speed Wi-Fi', 'Private Terrace', 'Jacuzzi', 'Fireplace', 'Wine Cellar'],
      },
    ];

    const rooms = await Room.insertMany(roomData);

    console.log('[Seed] Creating housekeeping assignments...');
    const staffMembers = ['Maria Santos', 'David Chen', 'Elena Rostova', 'Carlos Ramirez'];
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      await Housekeeping.create({
        room: room._id,
        status: room.cleaningStatus,
        assignedStaff: staffMembers[i % staffMembers.length],
        priority: room.cleaningStatus === 'Dirty' ? 'High' : 'Medium',
        remarks: room.cleaningStatus === 'Dirty' ? 'Requires turnover cleaning & fresh linen' : 'Inspected & ready',
        lastCleaned: new Date(Date.now() - (i + 1) * 3600000 * 5),
      });
    }

    console.log('[Seed] Creating sample customers...');
    const customers = await Customer.insertMany([
      {
        name: 'Emily Watson',
        email: 'emily.watson@example.com',
        phone: '+1 (555) 789-0123',
        address: '742 Evergreen Terrace, Springfield, OR',
        idType: 'Passport',
        idNumber: 'P98421034',
      },
      {
        name: 'Marcus Brody',
        email: 'marcus.brody@example.com',
        phone: '+1 (555) 890-1234',
        address: '120 Broadway St, New York, NY',
        idType: 'Driving License',
        idNumber: 'DL-NY-44829',
      },
      {
        name: 'Sophia Lorenzen',
        email: 'sophia.l@example.com',
        phone: '+1 (555) 901-2345',
        address: '45 Harbour Quay, San Francisco, CA',
        idType: 'Passport',
        idNumber: 'P12938472',
      },
      {
        name: 'Jonathan Sterling',
        email: 'j.sterling@example.com',
        phone: '+1 (555) 432-1098',
        address: '88 Lakeview Drive, Chicago, IL',
        idType: 'National ID',
        idNumber: 'NAT-883921',
      },
    ]);

    console.log('[Seed] Creating active & historical bookings with bills and payments...');
    const today = new Date();

    // Booking 1: Checked-In guest (Room 201)
    const checkIn1 = new Date(today);
    checkIn1.setDate(today.getDate() - 2);
    const checkOut1 = new Date(today);
    checkOut1.setDate(today.getDate() + 1);
    const nights1 = 3;
    const room201 = rooms.find((r) => r.roomNumber === '201');
    const roomCharges1 = room201.pricePerNight * nights1;

    const booking1 = await Booking.create({
      bookingId: 'BK-2026-A101',
      customer: customers[0]._id,
      room: room201._id,
      checkInDate: checkIn1,
      checkOutDate: checkOut1,
      actualCheckIn: checkIn1,
      numberOfNights: nights1,
      numberOfGuests: 2,
      roomPricePerNight: room201.pricePerNight,
      totalRoomCharges: roomCharges1,
      status: 'Checked-In',
      specialRequests: 'High floor, feather-free pillows',
    });

    const bill1 = new Bill({
      invoiceNumber: 'INV-2026-9001',
      booking: booking1._id,
      customer: customers[0]._id,
      room: room201._id,
      roomDetails: {
        roomNumber: room201.roomNumber,
        roomType: room201.roomType,
        pricePerNight: room201.pricePerNight,
        numberOfNights: nights1,
      },
      roomCharges: roomCharges1,
      additionalServices: [
        {
          name: 'Continental Buffet Breakfast',
          category: 'Food and Restaurant',
          quantity: 2,
          unitPrice: 25,
          totalPrice: 50,
          date: new Date(),
        },
        {
          name: 'Express Laundry Service',
          category: 'Laundry',
          quantity: 1,
          unitPrice: 30,
          totalPrice: 30,
          date: new Date(),
        },
      ],
      totalAdditionalServices: 80,
      extraCharges: 0,
      discountPercentage: 5,
      taxPercentage: 12,
      paidAmount: 200,
    });
    bill1.recalculateTotals();
    await bill1.save();

    booking1.bill = bill1._id;
    await booking1.save();

    const payment1 = await Payment.create({
      paymentId: 'PAY-2026-001',
      bill: bill1._id,
      booking: booking1._id,
      customer: customers[0]._id,
      amount: 200,
      paymentMethod: 'Card',
      transactionReference: 'TXN-VISA-9921',
      remarks: 'Advance deposit paid at check-in',
      paymentDate: checkIn1,
    });

    // Booking 2: Deluxe Room 301 (Checked-In)
    const checkIn2 = new Date(today);
    checkIn2.setDate(today.getDate() - 1);
    const checkOut2 = new Date(today);
    checkOut2.setDate(today.getDate() + 2);
    const nights2 = 3;
    const room301 = rooms.find((r) => r.roomNumber === '301');
    const roomCharges2 = room301.pricePerNight * nights2;

    const booking2 = await Booking.create({
      bookingId: 'BK-2026-B202',
      customer: customers[1]._id,
      room: room301._id,
      checkInDate: checkIn2,
      checkOutDate: checkOut2,
      actualCheckIn: checkIn2,
      numberOfNights: nights2,
      numberOfGuests: 2,
      roomPricePerNight: room301.pricePerNight,
      totalRoomCharges: roomCharges2,
      status: 'Checked-In',
      specialRequests: 'Late checkout requested',
    });

    const bill2 = new Bill({
      invoiceNumber: 'INV-2026-9002',
      booking: booking2._id,
      customer: customers[1]._id,
      room: room301._id,
      roomDetails: {
        roomNumber: room301.roomNumber,
        roomType: room301.roomType,
        pricePerNight: room301.pricePerNight,
        numberOfNights: nights2,
      },
      roomCharges: roomCharges2,
      additionalServices: [
        {
          name: 'Swedish Full Body Massage (60m)',
          category: 'Spa',
          quantity: 2,
          unitPrice: 90,
          totalPrice: 180,
          date: new Date(),
        },
        {
          name: 'Gourmet 3-Course Dinner',
          category: 'Food and Restaurant',
          quantity: 2,
          unitPrice: 65,
          totalPrice: 130,
          date: new Date(),
        },
      ],
      totalAdditionalServices: 310,
      extraCharges: 0,
      discountPercentage: 0,
      taxPercentage: 12,
      paidAmount: 500,
    });
    bill2.recalculateTotals();
    await bill2.save();

    booking2.bill = bill2._id;
    await booking2.save();

    await Payment.create({
      paymentId: 'PAY-2026-002',
      bill: bill2._id,
      booking: booking2._id,
      customer: customers[1]._id,
      amount: 500,
      paymentMethod: 'UPI',
      transactionReference: 'UPI-774829103',
      remarks: 'UPI instant payment',
      paymentDate: checkIn2,
    });

    // Booking 3: Suite Room 401 (Checked-In, fully paid)
    const checkIn3 = new Date(today);
    checkIn3.setDate(today.getDate() - 3);
    const checkOut3 = new Date(today);
    checkOut3.setDate(today.getDate() + 1);
    const nights3 = 4;
    const room401 = rooms.find((r) => r.roomNumber === '401');
    const roomCharges3 = room401.pricePerNight * nights3;

    const booking3 = await Booking.create({
      bookingId: 'BK-2026-C303',
      customer: customers[2]._id,
      room: room401._id,
      checkInDate: checkIn3,
      checkOutDate: checkOut3,
      actualCheckIn: checkIn3,
      numberOfNights: nights3,
      numberOfGuests: 3,
      roomPricePerNight: room401.pricePerNight,
      totalRoomCharges: roomCharges3,
      status: 'Checked-In',
      specialRequests: 'VIP welcoming champagne',
    });

    const bill3 = new Bill({
      invoiceNumber: 'INV-2026-9003',
      booking: booking3._id,
      customer: customers[2]._id,
      room: room401._id,
      roomDetails: {
        roomNumber: room401.roomNumber,
        roomType: room401.roomType,
        pricePerNight: room401.pricePerNight,
        numberOfNights: nights3,
      },
      roomCharges: roomCharges3,
      additionalServices: [
        {
          name: 'VIP Airport Limousine Transfer',
          category: 'Other Services',
          quantity: 1,
          unitPrice: 75,
          totalPrice: 75,
          date: checkIn3,
        },
      ],
      totalAdditionalServices: 75,
      extraCharges: 0,
      discountPercentage: 10,
      taxPercentage: 12,
    });
    bill3.recalculateTotals();
    bill3.paidAmount = bill3.grandTotal;
    bill3.recalculateTotals();
    await bill3.save();

    booking3.bill = bill3._id;
    await booking3.save();

    await Payment.create({
      paymentId: 'PAY-2026-003',
      bill: bill3._id,
      booking: booking3._id,
      customer: customers[2]._id,
      amount: bill3.grandTotal,
      paymentMethod: 'Card',
      transactionReference: 'TXN-AMEX-44910',
      remarks: 'Full upfront payment with Amex',
      paymentDate: checkIn3,
    });

    // Booking 4: Upcoming Reserved (Room 202)
    const checkIn4 = new Date(today);
    checkIn4.setDate(today.getDate() + 1);
    const checkOut4 = new Date(today);
    checkOut4.setDate(today.getDate() + 4);
    const nights4 = 3;
    const room202 = rooms.find((r) => r.roomNumber === '202');
    const roomCharges4 = room202.pricePerNight * nights4;

    const booking4 = await Booking.create({
      bookingId: 'BK-2026-D404',
      customer: customers[3]._id,
      room: room202._id,
      checkInDate: checkIn4,
      checkOutDate: checkOut4,
      numberOfNights: nights4,
      numberOfGuests: 2,
      roomPricePerNight: room202.pricePerNight,
      totalRoomCharges: roomCharges4,
      status: 'Reserved',
      specialRequests: 'Quiet room away from elevator',
    });

    const bill4 = new Bill({
      invoiceNumber: 'INV-2026-9004',
      booking: booking4._id,
      customer: customers[3]._id,
      room: room202._id,
      roomDetails: {
        roomNumber: room202.roomNumber,
        roomType: room202.roomType,
        pricePerNight: room202.pricePerNight,
        numberOfNights: nights4,
      },
      roomCharges: roomCharges4,
      additionalServices: [],
      totalAdditionalServices: 0,
      extraCharges: 0,
      discountPercentage: 0,
      taxPercentage: 12,
      paidAmount: 0,
    });
    bill4.recalculateTotals();
    await bill4.save();

    booking4.bill = bill4._id;
    await booking4.save();

    // Booking 5: Completed Checked-Out booking in history
    const checkIn5 = new Date(today);
    checkIn5.setDate(today.getDate() - 7);
    const checkOut5 = new Date(today);
    checkOut5.setDate(today.getDate() - 4);
    const nights5 = 3;
    const room101 = rooms.find((r) => r.roomNumber === '101');
    const roomCharges5 = room101.pricePerNight * nights5;

    const booking5 = await Booking.create({
      bookingId: 'BK-2026-E505',
      customer: customers[0]._id,
      room: room101._id,
      checkInDate: checkIn5,
      checkOutDate: checkOut5,
      actualCheckIn: checkIn5,
      actualCheckOut: checkOut5,
      numberOfNights: nights5,
      numberOfGuests: 1,
      roomPricePerNight: room101.pricePerNight,
      totalRoomCharges: roomCharges5,
      status: 'Checked-Out',
      specialRequests: 'None',
    });

    const bill5 = new Bill({
      invoiceNumber: 'INV-2026-9005',
      booking: booking5._id,
      customer: customers[0]._id,
      room: room101._id,
      roomDetails: {
        roomNumber: room101.roomNumber,
        roomType: room101.roomType,
        pricePerNight: room101.pricePerNight,
        numberOfNights: nights5,
      },
      roomCharges: roomCharges5,
      additionalServices: [
        {
          name: 'Continental Buffet Breakfast',
          category: 'Food and Restaurant',
          quantity: 3,
          unitPrice: 25,
          totalPrice: 75,
          date: checkIn5,
        },
      ],
      totalAdditionalServices: 75,
      extraCharges: 0,
      discountPercentage: 0,
      taxPercentage: 12,
    });
    bill5.recalculateTotals();
    bill5.paidAmount = bill5.grandTotal;
    bill5.recalculateTotals();
    await bill5.save();

    booking5.bill = bill5._id;
    await booking5.save();

    await Payment.create({
      paymentId: 'PAY-2026-005',
      bill: bill5._id,
      booking: booking5._id,
      customer: customers[0]._id,
      amount: bill5.grandTotal,
      paymentMethod: 'Cash',
      transactionReference: 'CASH-REC-1029',
      remarks: 'Settled in full at front desk upon checkout',
      paymentDate: checkOut5,
    });

    console.log('[Seed] Database successfully populated with realistic hotel data!');
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    throw error;
  }
};

// If run directly via node utils/seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      console.log('[Seed] Finished successfully. Exiting.');
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}
