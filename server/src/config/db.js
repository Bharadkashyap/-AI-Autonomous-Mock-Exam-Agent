import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas with retry logic.
 * @param {string} uri - MongoDB connection URI
 * @param {number} maxRetries - Maximum connection attempts
 * @returns {Promise<void>}
 */
const connectDB = async (uri, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[DB] Connection attempt ${attempt}/${maxRetries}...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log(`[DB] ✅ MongoDB connected successfully — host: ${mongoose.connection.host}`);
      return;
    } catch (error) {
      console.error(`[DB] ❌ Connection attempt ${attempt} failed: ${error.message}`);
      if (attempt === maxRetries) {
        throw new Error(`Failed to connect to MongoDB after ${maxRetries} attempts: ${error.message}`);
      }
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`[DB] Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('[DB] ⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`[DB] Connection error: ${err.message}`);
});

export default connectDB;
