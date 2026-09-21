import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===================== MIDDLEWARE =====================
app.use(cors());
app.use(express.json());

// ===================== ROUTES =====================
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';

// 🔓 Public routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);

// 🔐 Protected routes (USER MUST BE LOGGED IN)
app.use(
  '/api/reservations',
  // ClerkExpressRequireAuth(), // REMOVED: Managed inside routes to allow public POST
  reservationRoutes
);

// ===================== TEST ROUTES =====================
app.get('/', (req, res) => {
  res.send('Restaurant API is running ✅');
});

// 🔐 Test Clerk auth
app.get(
  '/api/protected',
  ClerkExpressRequireAuth(),
  (req, res) => {
    res.json({
      message: 'Authenticated successfully ✅',
      userId: req.auth.userId,
    });
  }
);

// ===================== DATABASE =====================
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/alviro';

mongoose
  .connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('💡 Tip: Ensure MongoDB is running locally or provide a valid MONGODB_URI in server/.env');
  });

// ===================== SERVER =====================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});