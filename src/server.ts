import app from './app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://adeyemitaiwo24434:rtC6zJingtXSbZGW@cluster0.joj4v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });