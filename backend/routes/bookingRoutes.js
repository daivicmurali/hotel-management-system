import express from 'express';
import {
  getBookings,
  getBookingById,
  createBooking,
  checkInCustomer,
  checkOutCustomer,
  cancelBooking,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.put('/:id/check-in', checkInCustomer);
router.put('/:id/check-out', checkOutCustomer);
router.put('/:id/cancel', cancelBooking);

export default router;
