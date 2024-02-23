const mongoose = require("mongoose");
const user = require("./userModel");

const chat = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: user,
    },
    message: {
        type: String,
        require: true,
    },
    time: {
        type: Date,
        require: true,
    },
});

module.exports = mongoose.model("chat", chat)