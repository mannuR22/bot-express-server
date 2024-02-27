const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    _id: String,
    chatId: Number,
    name: String,
    city: String,
    country: String,
    password: String,
    status: {
        type: String,
        enum: ['blocked', 'unblocked'],
    },
    role: {
        type: String,
        enum: ['client', 'admin'],
        
    },
    createdAt: {
        type: Number,
        default: Date.now(),
    }
});

module.exports = mongoose.model("Users", userSchema, "Users");
