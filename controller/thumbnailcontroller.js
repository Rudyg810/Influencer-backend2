const Thumbnail = require("../models/thumbnail");
const User = require("../models/usermodel");

const thumbnailController = {};
const {Buffer} = require("buffer")

thumbnailController.getThumbnail = async (req, res) => {
    try {
        const thumbnails = await Thumbnail.find({}); // Fetch all thumbnails

        if (!thumbnails || thumbnails.length === 0) {
            return res.status(404).json({ message: "No thumbnails found" });
        }

        // Iterate over each thumbnail
        const thumbnailData = await Promise.all(thumbnails.map(async (thumbnail) => {
            const user = await User.findById(thumbnail.user); // Fetch the user corresponding to the thumbnail
            if (!user) {
                return { thumbnail, email: "User not found" }; // If user not found, provide a default email
            }
            return { thumbnail, email: user.email }; // Combine thumbnail data with user email
        }));
console.log(thumbnailData)
        res.json(thumbnailData); // Send the combined data
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = thumbnailController;


thumbnailController.getsingleThumbnail = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Find the user by userId
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Find the thumbnail associated with the user
        const thumbnail = await Thumbnail.findOne({ user: userId });

        if (!thumbnail) {
            return res.status(404).json({ message: "Thumbnail not found" });
        }

        res.json({
            thumbnail,
            email: user.email
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
thumbnailController.createThumbnail = async (req, res) => {
    try {
      const { images, description, userId } = req.body;
  
      // Check if images is an array
      if (!Array.isArray(images)) {
        return res.status(400).json({ message: "Images must be provided as an array" });
      }
      const imageDataBuffers = images.map(image => Buffer.from(image.data));
      // Create new thumbnail entry
      const thumbnail = new Thumbnail({
        Images: imageDataBuffers,
        description: description,
        user:userId // Assuming userId is a valid ObjectId
      });
  
      await thumbnail.save();
      console.log("Thumbnail created successfully:", thumbnail);
      res.json({ message: "Thumbnail created successfully", thumbnail: thumbnail });
    } catch (error) {
      console.error("Error creating thumbnail:", error);
      res.status(500).json({ message: "Server Error" });
    }
  };
  

// Rework thumbnail (delete)
thumbnailController.reworkThumbnail = async (req, res) => {
    try {
        const { userId } = req.params;

        // Delete thumbnail by ID
        await Thumbnail.findOneAndDelete({_id:userId});
        
        res.status(200).json({ message: "Thumbnail deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Update verification (delivered)
thumbnailController.updateVerification = async (req, res) => {
    try {
        const { userId } = req.params;
        const response = await Thumbnail.findOneAndUpdate({_id:userId},{delivered:true})
        res.status(200).json({ message: "Verification updated successfully" });
        console.log(response)

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = thumbnailController;
