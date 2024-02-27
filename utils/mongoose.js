const mongoose = require('mongoose');
const  MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/telegram-bot-data'; // You should store your MongoDB URI in an environment variable

const connectDB = async () => {
  
  try {
    db = await mongoose.connect(MONGO_URI);
    console.log('connected to mongo');
    return db;
  } catch (error) {
    console.log('Error connecting to MongoDB:' + error.message);
    process.exit(1); // Exit the process if unable to connect to MongoDB
  }
};

module.exports = connectDB;
