import express from 'express';
import {
  getHousekeeping,
  getDirtyRooms,
  updateHousekeeping,
} from '../controllers/housekeepingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getHousekeeping);
router.get('/dirty', getDirtyRooms);
router.put('/:id', updateHousekeeping);

export default router;
