import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

// Cache the connection on `global` so warm serverless invocations (Vercel) reuse it.
const cache = global._mongo || (global._mongo = { promise: null, lastFailure: 0 });
const RETRY_AFTER_MS = 30_000;

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) return null;
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  // After a failed attempt, don't make every request wait on another timeout.
  if (!cache.promise && Date.now() - cache.lastFailure < RETRY_AFTER_MS) return null;

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 10 })
      .then((m) => {
        console.log(`MongoDB connected: ${m.connection.host}/${m.connection.name}`);
        return m.connection;
      })
      .catch((err) => {
        console.error('MongoDB connection failed:', err.message);
        cache.promise = null;
        cache.lastFailure = Date.now();
        return null;
      });
  }
  return cache.promise;
}

export const isConnected = () => mongoose.connection.readyState === 1;
