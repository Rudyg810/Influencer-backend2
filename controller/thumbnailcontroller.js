const Thumbnail = require("../models/thumbnail");
const User = require("../models/usermodel");

const thumbnailController = {};

thumbnailController.getThumbnail = async (req, res) => {
    try {
        const thumbnail = await Thumbnail.find({})
        const user = User.findById(thumbnail.user)
        
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
                
        if (!thumbnail) {
            return res.status(404).json({ message: "Thumbnail not found" });
        }

        res.json({
            ...thumbnail,
            email:user.email
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

thumbnailController.createThumbnail = async (req, res) => {
    try {
        const { images, description, userId } = req.body;
        console.log(req.body);

        // Check if Images is an array

        // Convert base64 strings to Buffer and extract image data
        const imageBuffers = images.map((base64Image) => {
            const base64Data = base64Image.split(',')[1];
            return Buffer.from(base64Data, 'base64');
        });
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
        console.log(imageBuffers)
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")

        // Create new thumbnail entry
        const thumbnail = new Thumbnail({
            Images: imageBuffers,
            description,
            user: userId
        });

        await thumbnail.save();
        console.log(thumbnail)
        res.json({ message: "Thumbnail created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Rework thumbnail (delete)
thumbnailController.reworkThumbnail = async (req, res) => {
    try {
        const { thumbnailId } = req.params;

        // Delete thumbnail by ID
        await Thumbnail.findByIdAndDelete(thumbnailId);
        
        res.json({ message: "Thumbnail deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Update verification (delivered)
thumbnailController.updateVerification = async (req, res) => {
    try {
        const { thumbnailId } = req.params;
        const { userId, delivered } = req.body;

        // Check if user is admin (you can import the function for this)
        // Assuming isAdmin function is imported and returns true/false
        
        if (isAdmin(userId)) {
            // Update verification for thumbnail
            await Thumbnail.findByIdAndUpdate(thumbnailId, { delivered });
            res.json({ message: "Verification updated successfully" });
        } else {
            res.status(403).json({ message: "Unauthorized access" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = thumbnailController;
