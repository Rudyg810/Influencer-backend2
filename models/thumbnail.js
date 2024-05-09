const mongoose = require("mongoose");

const thumbnailSchema = new mongoose.Schema({
    Images: [{
        type: Buffer, // Assuming the image path or URL
        required: true
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    description: {
        type: String
    },
    delivered: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Thumbnail", thumbnailSchema);
