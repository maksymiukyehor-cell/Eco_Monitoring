
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`mDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('mDB connection error:', error.message);
    process.exit(1);
  }
};

//connection
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to mDB');
}); 

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
}); 

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from mDB');
});

//shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('mDB connection closed due to app termination');
  process.exit(0);
});

export default connectDB;