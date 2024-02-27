
const mongoose = require('mongoose');

var botSetting = new mongoose.Schema({
    _id: String,
    cronExp: String,
    apiKeys: {
        bot: String,
        weather: String
    },
    createdAt: {
        type: Number,
        default: Date.now(),
    }
});

module.exports = mongoose.model("BotSettings", botSetting, "BotSettings");
