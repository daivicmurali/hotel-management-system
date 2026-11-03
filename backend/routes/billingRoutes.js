import express from 'express';
import {
  getBills,
  getBillById,
  addServiceToBill,
  removeServiceFromBill,
  updateBillCharges,
  recordPayment,
  getPayments,
} from '../controllers/billingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getBills);
router.get('/payments', getPayments);
router.get('/:id', getBillById);
router.post('/:id/add-service', addServiceToBill);
router.delete('/:id/services/:serviceItemId', removeServiceFromBill);
router.put('/:id/update-charges', updateBillCharges);
router.post('/:id/payments', recordPayment);

export default router;
