const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/usermodel")
const { getUserInfo } = require("./Yt.controller");

const auth = {};
auth.twitterLogin = async (useremail,token ) =>{
    try {
      console.log(username, token)
          let existingUser = await User.findOne({ email: useremail });
          if (existingUser) {
            existingUser.twitterId ={
                accessToken: token.accessToken,
                token_type: token.token_type,
                expires_in: token.expires_in,
                scope: token.scope,
                refreshToken: token.refreshToken
              }
            existingUser.profilePhoto = photo;
            await existingUser.save();
            console.log(existingUser)
            if (!existingUser.verfied) {
              console.log("Not verified");
              const jwttoken = jwt.sign(
                {
                  data: {
                    userId: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email,
                    accessToken_g: token.access_token
                  }
                },
                process.env.JWT_SECRET
              );
              return { message: "Not Verified", success: true, token: jwttoken };
            }
            console.log("registered:", existingUser);
            const jwttoken = jwt.sign(
              {
                data: {
                  userId: existingUser._id,
                  name: existingUser.name,
                  email: existingUser.email,
                  accessToken_x: token.access_token
                }
              },
              process.env.JWT_SECRET
            );
            return { success: true, jwttoken };
          }
      } catch (error) {
        return { success: false, message: `${error}` };
      }
  
}

// Controller to get all users with role 0
auth.getAllRoleZeroUsers = async (req, res) => {
  try {
      const users = await User.find({ role: 0 });
      res.json(users);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
  }
}

// Controller to get all users with role 0
auth.getAll = async (req, res) => {
  try {
      const all = await User.find({});
      res.json(all);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
  }
}

// Controller to get all users with role 1
auth.getAllRoleOneUsers = async (req, res) => {
  try {
      const users = await User.find({ role: 1 });
      res.json(users);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
  }
}

auth.googleSignIn = async (token, useremail) => {
    try {
      console.log("::::::::::::::::::::::::::::::::")
      console.log(token,useremail)
      console.log("::::::::::::::::::::::::::::::::")
      if (!useremail) {
        const { name, email, photo } = await getUserInfo(token);
  
        let existingUser = await User.findOne({ email: email });
        if (existingUser) {
          existingUser.googleId = {
            access_token: token.access_token,
            scope: token.scope,
            token_type: token.token_type,
            expiry_date: token.expiry_date,
            id_token:token.id_token
          };
          existingUser.profilePhoto = photo;
          existingUser.name = name;
          await existingUser.save();
          if (!existingUser.verfied) {
            console.log("Not verified");
            const jwttoken = jwt.sign(
              {
                data: {
                  userId: existingUser._id,
                  name: existingUser.name,
                  email: existingUser.email,
                  accessToken_g: token.access_token
                }
              },
              process.env.JWT_SECRET
            );
            return { message: "Not Verified", success: true, token: jwttoken };
          }
          console.log("registered:", existingUser);
          const jwttoken = jwt.sign(
            {
              data: {
                userId: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                accessToken_g: token.access_token
              }
            },
            process.env.JWT_SECRET
          );
          return { success: true, jwttoken };
        } else {
          const password = Math.random().toString(36).slice(-8); // Generate random password
          const hashedPassword = await bcrypt.hash(password, 10); // Encrypt password
          const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword,
            googleId: {
              access_token: `${token.access_token}`,
              scope: `${token.scope}`,
              token_type: `${token.token_type}`,
              expiry_date: token.expiry_date,
              id_token: token.id_token
            }
          });
          await newUser.save();
          if (!newUser.verfied) {
            console.log("Not verified");
            console.log("New user registered:", newUser);
            const jwttoken2 = jwt.sign(
              {
                data: {
                  userId: newUser._id,
                  name: newUser.name,
                  email: newUser.email,
                  accessToken_g: token.access_token
                }
              },
              process.env.JWT_SECRET
            );
            return {
              success: true,
              token: jwttoken2,
              message: "Not Verified"
            };
          }
          console.log("New user registered:", newUser);
          const jwttoken2 = jwt.sign(
            {
              data: {
                userId: newUser._id,
                name: newUser.name,
                email: newUser.email,
                accessToken_g: token.access_token
              }
            },
            process.env.JWT_SECRET
          );
          return { jwttoken2, success: true };
        }
      } else {
        console.log("*******************************", useremail)
       existingUser = await User.findOne({ email: useremail });
      console.log(existingUser)
        if (existingUser) {
          existingUser.googleId = {
            access_token: token.access_token,
            scope: token.scope,
            token_type: token.token_type,
            id_token: token.id_token,
            expiry_date: token.expiry_date
          };
          console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&")

          await existingUser.save();
          console.log(">>>>>>>>>>>>>>>>>>>>>")
          console.log(existingUser)
          console.log(">>>>>>>>>>>>>>>>>>>>>")
          if (!existingUser.verfied) {
            console.log("Not verified");
            const jwttoken = jwt.sign(
              {
                data: {
                  userId: existingUser._id,
                  name: existingUser.name,
                  email: existingUser.email,
                  accessToken_g: token.access_token
                }
              },
              process.env.JWT_SECRET
            );
            return { message: "Not Verified", success: true, token: jwttoken };
          }
          console.log("registered:", existingUser);
          const jwttoken = jwt.sign(
            {
              data: {
                userId: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                accessToken_g: token.access_token
              }
            },
            process.env.JWT_SECRET
          );
          return { success: true, jwttoken };
        }
      }
    } catch (error) {
      return { success: false, message: `${error}` };
    }
  };
  
auth.registerUser = async (req, res) => {
    try {
        let verification = false
        let role = req.body.role
        const { name, email, password, scheme, verfied} = req.body;
        if(scheme){
            return res.status(401).json({
                message:
                "Cannot initialize scheme at user registration"
            })
        }
        if(verfied){
            return res.status(401).json({
                message:
                "Cannot initialize verification at user registration"
            })
        }
        if(role){
            if(role == 5){
                role = 1;
                verification = true
            }
            else{
                return res.status(401).json({
                    message:
                    "Cannot initialize role at user registration"
                })
            }
        }
        if (!name || !email || !password ) {
            return res.status(400).json({ message: "Name, email, password are required" });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            console.log("User already exists:", user);
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, email,role,verfied:verification, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        console.log("New user registered:", user);
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

auth.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log("Invalid credentials");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ data:{userId: user._id, name:user.name,email:user.email} }, process.env.JWT_SECRET);
        console.log("User logged in:", user);
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

auth.updateUserInfo = async (req, res) => {
    try {
        const { password,newPassword } = req.body;
        const {userId} = req.params
        console.log(req.params,req.body)
        if (!password || !userId || !newPassword) { console.log("kdwojifsvb lkswdjfbhfv ")
            return res.status(400).json({ message: "password and new password required " });
           
        }
        const user =await  User.findById(userId)
        console.log(user)

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log("Invalid credentials");
            return res.status(401).json({ message: "Invalid credentials" });
        }
        else{ 
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          await User.findOneAndUpdate({_id:user._id},{password:hashedPassword})
          console.log("User information updated successfully");
          res.json({ message: "User information updated successfully" });

        }
       
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

auth.getUserInfo = async (req, res) => {
    try {
        const {userId} = req.params;
        const user = await User.findById(userId);
        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }
        console.log("User info retrieved:", user);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
auth.getUserByGoogleAccessToken = async (req, res) => {
    try {
        const { accessToken } = req.body;
        const user = await User.findOne({ 'googleId.accessToken': accessToken });
        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }
        console.log("User info retrieved:", user);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

auth.getUserByGoogleRefreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const user = await User.findOne({ 'googleId.refreshToken': refreshToken });
        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }
        console.log("User info retrieved:", user);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

auth.getUserByTwitterAccessToken = async (req, res) => {
    try {
        const { accessToken } = req.body;
        const user = await User.findOne({ 'twitterId.accessToken': accessToken });
        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }
        console.log("User info retrieved:", user);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

auth.getUserByTwitterRefreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const user = await User.findOne({ 'twitterId.refreshToken': refreshToken });
        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }
        console.log("User info retrieved:", user);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};


auth.checkVerify = async (req,res) =>{
    try{
        const {userId} = req.params;
        const user = await User.findById(userId);
        console.log(user)
        res.json(user.verfied)
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
}
auth.getScheme = async (req,res) => {
    try{
        const userId = req.params;
        const user = User.findById(userId)
        const scheme = user.scheme;
        console.log(user.scheme)
        res.json({
            scheme
        })
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

auth.deleteUser = async (req, res) => {
    try {
        const id = req.params.userId;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }
        console.log("User deleted successfully:", user);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = auth;
