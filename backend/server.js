import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import paymentRoutes from './routes/paymentRoutes.js'; // ⭐ NEW

// Recreate __dirname for ES Modules and load root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
console.log("TEST ROUTE REGISTERED");

app.get('/api/test', (req, res) => {
  console.log("TEST ROUTE ACCESSED");

  res.status(200).json({
    success: true,
    message: "Backend is working!"
  });
});

// API Routes
app.use('/api/payments', paymentRoutes); // ⭐ NEW

const PORT = process.env.PORT || 5000;

// Connect to Database, then start server
connectDB().then(() => {
  app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});

app.on("error", (error) => {
  console.error("SERVER ERROR:", error);
});
});