
const mongoose = require('mongoose');

var authSchema = new mongoose.Schema({
    _id: String,
    token: String,
    isValid: Boolean,
    userId: String,
    createdAt: {
        type: Number,
        default: Date.now(),
    }
});

module.exports = mongoose.model("Auths", authSchema, "Auths");
