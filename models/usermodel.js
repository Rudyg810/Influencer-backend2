const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Limit = require('./limit'); // Import Limit model here

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    role:{
        type:Number,
        required: true,
        default:0
    },
    verfied: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        trim: true
    },
    profilePhoto: {
        type: String, // Assuming the profile photo will be stored as a URL
        trim: true
    },
    googleId: {
        access_token: String,
        id_token:String,
        scope: String,
        token_type: String,
        expiry_date: Number
    },
    twitterId: {
        type: {
            accessToken: String,
            token_type: String,
            expires_in: Number,
            scope: String,
            refreshToken: String
        }
    },
    scheme: {
        type: String,
        enum: ['level_1', 'level_2', 'level_3'] // Validator to ensure scheme is one of these values
    },
    limit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Limit"
    }
}, {
    timestamps: true
});

// Post-save hook to create a limit for the user
userSchema.post('save', async function (doc) {
    try {
        // Check if the user already has a limit
        if (!doc.limit) {
            let limitObject = {};
            // Define limits based on the user's scheme
            if (doc.scheme === 'level_2') {
                limitObject = {
                    channel: {
                        ask: 10,
                        revision: 10
                    },
                    thumbnail: 20,
                    redirection: 30,
                    ideaGenerator:20
                };
            } else if (doc.scheme === 'level_3') {
                limitObject = {
                    channel: {
                        ask: 15,
                        revision: 15
                    },
                    thumbnail: 30,
                    redirection: 40,
                    ideaGenerator:30
                };
            } else if (doc.scheme === "level_1") {
                limitObject = {
                    channel: {
                        ask: 5,
                        revision: 5
                    },
                    thumbnail: 10,
                    ideaGenerator:10,
                    redirection: 20
                };
            } else {
                limitObject = {
                    channel: {
                        ask: 0,
                        revision: 0
                    },
                    thumbnail: 0,
                    redirection: 0
                }
            };
            // Create a new limit entry for the user
            const limit = new Limit({
                user: doc._id,
                ...limitObject
            });
            await limit.save();
            // Assign the limit ID to the user's limit field
            doc.limit = limit._id;
            await doc.save();
        }
    } catch (error) {
        console.error("Error creating limit:", error);
    }
});

module.exports = mongoose.model("User", userSchema);
