const config = require("../../../config");
const Update = require("../models/update");
const User = require("../models/usermodel");
const AWS = require("aws-sdk");
let counter = 0
const SES_config = {
  accessKeyId: config.AWS_ACCESS_KEY, 
  secretAccessKey: config.AWS_SECRET_KEY,
  region: config.AWS_SES_REGION
};

const AWS_SES = new AWS.SES(SES_config);

const SendMail = async (recipientMail, name, data) => {
  let params = {
    Source: config.AWS_SES_SENDER,
    Destination: {
      ToAddresses: [recipientMail] 
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8', 
          Data: `${data}`
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `Hello ${name}`
      }
    }
  };
   try {
    const res = await AWS_SES.sendEmail(params).promise();
    console.log("Email has been sent", res);
  } catch (err) {
    console.log(err);
  }
};
const updateController = {  
    createUpdate: async function(req, res) {
      try {
        counter++;
        const { userId } = req.params;
        const { price, level1, level2, level3 } = req.body;
        console.log(userId, req.body);
               const user = await User.findOne({ _id: userId });
        if (!user) {
          return res.status(400).json({ success: false, message: "User not found" });
        }
               const email = user.email;
        
        
        let update = await Update.findOne({});
               if (!update) {
          
          update = new Update({
            users: [email], 
            totalPrice: price,
            counter: {
              level1,
              level2,
              level3
            }
          });
        } else {
          if(!update.users.includes(email)){
      update.users.push(email); 
          }
          update.totalPrice += price;
          update.counter.level1 += level1;
          update.counter.level2 += level2;
          update.counter.level3 += level3;
        }
               await update.save();

        const response = await Update.findOne({});
        if (counter % 10 === 0) {
            SendMail("rudy.tech.contact810@gmail.com", "rudra", response);
        }
               res.status(200).json({ success: true, update: response });
      } catch (error) {
        console.error("Error creating update:", error);
        res.status(400).json({ success: false, message: "Error creating update" });
      }
    }
  };
  module.exports = updateController;
