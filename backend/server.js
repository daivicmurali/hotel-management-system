import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import housekeepingRoutes from './routes/housekeepingRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

import User from './models/User.js';
import { seedDatabase } from './utils/seed.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Grand Horizon Hotel Management System API',
  });
});

// Manual database reseed endpoint
app.post('/api/seed', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database reseeded successfully with demo data' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/bills', billingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/reports', reportRoutes);

// Serve frontend in production
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize Server & Database
const startServer = async () => {
  try {
    await connectDB();

    // Check if initial admin user or rooms exist, otherwise auto-seed
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Bootstrap] No existing users found. Auto-seeding initial hotel data...');
      await seedDatabase();
    }

    const server = app.listen(PORT, () => {
      console.log(`[Server] Grand Horizon HMS Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`[Server] API Base URL: http://localhost:${PORT}/api`);
    });

    return server;
  } catch (error) {
    console.error('[Server] Critical failure starting application:', error);
    process.exit(1);
  }
};

startServer();

export default app;
