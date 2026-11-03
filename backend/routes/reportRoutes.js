import express from 'express';
import { getAnalyticsReport } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/analytics', getAnalyticsReport);

export default router;
