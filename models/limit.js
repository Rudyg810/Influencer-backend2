const mongoose = require("mongoose");

const limitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    channel: {
        ask: {
            type: Number,
            default: 0,
            required: true
        },
        revision: {
            type: Number,
            default: 0,
            required: true
        }
    },
    thumbnail: {
        type: Number,
        default: 0
    },
    ideaGenerator: {
        type: Number,
        default: 0
    },
    redirection: {
        type: Number,
        default: 0
    },
    posteverywhere: {
        type: Number,
        default: 0
    },
    scriptgenerator: {
        type: Number,
        default: 0
    },
    competitorcheck: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("Limit", limitSchema);





