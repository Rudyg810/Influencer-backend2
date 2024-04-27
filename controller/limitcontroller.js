const Limit = require("../models/limit");
const User = require("../models/usermodel")
limitcontroller = {}
// Get limit by user ID
limitcontroller.getLimitByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find limit entry by user ID
        const limit = await Limit.findOne({ user: userId });

        if (limit) {
            res.json(limit);
        } else {
            res.status(404).json({ message: "Limit entry not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Update limit for user
limitcontroller.updateLimit = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            customData: {
                revisions: revision,
                qualityThumbnails: thumbnail,
                youtubeRedirection: redirection,
                competitorCheck: competitorcheck,
                youtubeIdeaGenerators: ideaGenerator,
                postEverywhere: posteverywhere,
                scriptWriter: scriptgenerator,
                titleGeneration: ask
            },
            subscriptionType
        } = req.body;

        // Find limit entry by user ID
        const limit = await Limit.findOne({ user: userId });
        const user = await User.findOne({ _id: userId });
        if(!user){
            res.status(404).json({ message: "User entry not found" });
        }
        user.verfied= true;
        await user.save();
        console.log(limit)
        if (limit) {
            limit.channel.ask = ask || limit.channel.ask;
            limit.channel.revision = revision || limit.channel.revision;
            limit.ideaGenerator = ideaGenerator || limit.ideaGenerator
            limit.posteverywhere = posteverywhere || limit.posteverywhere
            limit.scriptgenerator = scriptgenerator || limit.scriptgenerator
            limit.competitorcheck = competitorcheck || limit.competitorcheck
            limit.thumbnail = thumbnail || limit.thumbnail;
            limit.redirection = redirection || limit.redirection;
            limit.subscriptionType = subscriptionType || limit.subscriptionType;
            await limit.save();
            res.json({ message: "Limit updated successfully" });
        } else {
            res.status(404).json({ message: "Limit entry not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};


// Reset limit to default values
limitcontroller.resetLimit = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find limit entry by user ID
        const limit = await Limit.findOne({ user: userId });

        // Reset limit entry to default values
        if (limit) {
            limit.channel.ask = 0;
            limit.channel.revision = 0;
            limit.thumbnail = 0;
            limit.redirection = 0;
            limit.ideaGenerator = 0;
            limit.posteverywhere = 0;
            limit.competitorcheck = 0;
            limit.scriptgenerator = 0;

            await limit.save();
            res.json({ message: "Limit reset to default values" });
        } else {
            res.status(404).json({ message: "Limit entry not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Reduce limit for user
limitcontroller.reduceLimit = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limitTypes } = req.body;

        // Find limit entry by user ID
        const limit = await Limit.findOne({ user: userId });
        console.log(limit)

        if (limit) {
            limitTypes.forEach(async (limitType) => {
                switch (limitType) {
                    case 'ask':
                        if (limit.channel.ask > 0) {
                            limit.channel.ask--;
                        }
                        break;                    
                    case 'revision':
                        if (limit.channel.revision > 0) {
                            limit.channel.revision--;
                        }
                        break;
                    case 'thumbnail':
                        if (limit.thumbnail > 0) {
                            limit.thumbnail--;
                        }
                        break;
                    case 'redirection':
                        if (limit.redirection > 0) {
                            limit.redirection--;
                        }
                        break;
                    case 'competitorcheck':
                        if (limit.competitorcheck > 0) {
                            limit.competitorcheck--;
                        }
                        break;

                    case 'scriptgenerator':
                        if (limit.scriptgenerator > 0) {
                            limit.scriptgenerator--;
                        }
                        break;

                    case 'posteverywhere':
                        if (limit.posteverywhere > 0) {
                            limit.posteverywhere--;
                        }
                        break;

                    case 'ideaGenerator':
                        if (limit.ideaGenerator > 0) {
                            limit.ideaGenerator--;
                        }
                        break;
                    default:
                        break;
                }
            });
            await limit.save();
            res.json({ message: "Limit reduced successfully" });
        } else {
            res.status(404).json({ message: "Limit entry not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = limitcontroller;
