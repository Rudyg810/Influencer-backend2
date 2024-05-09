var {google} = require('googleapis');
const config = require('../config');
const youtube = google.youtube('v3');
var OAuth2 = google.auth.OAuth2;
const request = require('request');

const fs = require("fs")
const streamifier = require('streamifier');

async function postVideo(auth, videoBase64, videoTitle, videoDescription, videoTags) {
  const video = {
    snippet: {
      title: videoTitle || 'My Video Title',
      description: videoDescription || 'My Video Description',
      tags: videoTags || ['tag1', 'tag2'],
      categoryId: '22' // Entertainment category ID as string
    },
    status: {
      privacyStatus: 'public' // Can be 'public', 'private', or 'unlisted'
    }
  };

  // Convert base64 data to readable stream
  const stream = streamifier.createReadStream(Buffer.from(videoBase64, 'base64'));

  const request = await youtube.videos.insert({
    auth: auth,
    part: 'snippet,status',
    requestBody: video,
    media: {
      mimeType: 'video/*',
      body: stream, // Pass the readable stream here
    },
  });

  return request.data;
}
  const getUserInfo = async (token) => {
    const oauth2Client = new OAuth2(
      config.googleClientId,
      config.googleClientSecret,
      config.redirectURI
    );
  
    oauth2Client.setCredentials(token);
    const people = google.people({ version: "v1", auth: oauth2Client });
  
    try {
      const response = await people.people.get({
        resourceName: "people/me",
        personFields: "names,emailAddresses,photos",
      });
      const name =
        response.data.names && response.data.names[0]
          ? response.data.names[0].displayName
          : "Unknown";
      const email =
        response.data.emailAddresses && response.data.emailAddresses[0]
          ? response.data.emailAddresses[0].value
          : null;
      const photo =
        response.data.photos && response.data.photos[0]
          ? response.data.photos[0].url
          : null;
      const data = { name, email, photo }
      console.log(data)
      return data;
    } catch (err) {
      console.log("Error while trying to retrieve user information:", err);
      return;
    }
  };
async function getChannel(auth) {
    const response = await youtube.channels.list({
      auth: auth,
      part: 'snippet,contentDetails,statistics',
      mine: true,
    });
    const channels = response.data.items;
    if (channels.length === 0) {
      console.log('No channel found.');
    } else {
      console.log('This channel\'s ID is %s. Its title is \'%s\', and ' +
                  'it has %s views.',
                  channels[0].id,
                  channels[0].snippet.title,
                  channels[0].statistics.viewCount);
    }
  }


async function searchVideos(auth, query, filter) {
  const search = await youtube.search.list({
    auth: auth,
    part: 'snippet',
    q: query,
    type: 'video',
    order: 'viewCount',
    maxResults: 3
  });

  const videos = search.data.items;
  const videoDetails = [];

  for (const video of videos) {
    const videoId = video.id.videoId;
    const videoRequest = await youtube.videos.list({
      auth: auth,
      part: 'snippet,statistics',
      id: videoId
    });
    const videoInfo = videoRequest.data.items[0];
    const videoSnippet = videoInfo.snippet;
    const videoStats = videoInfo.statistics;
    const channelRequest = await youtube.channels.list({
      auth: auth,
      part: 'snippet',
      id: videoSnippet.channelId
    });
    const channelInfo = channelRequest.data.items[0];
    const channelSnippet = channelInfo.snippet;
    const thumbnailUrl = videoSnippet.thumbnails.medium.url;

    videoDetails.push({
      id: videoId,
      title: videoSnippet.title,
      description: videoSnippet.description,
      thumbnailUrl: thumbnailUrl,
      channelName: channelSnippet.title,
      views: videoStats.viewCount,
      engagements: videoStats.likeCount + videoStats.dislikeCount,
      likes: videoStats.likeCount,
      dislikes: videoStats.dislikeCount
    });
  }

  console.log(videoDetails);
  return videoDetails
}


const revokeAccessToken = (accessToken, callback) => {
  const url = 'https://oauth2.googleapis.com/revoke';
  const options = {
    url: url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      token: accessToken
    }
  };

  request(options, (error, response, body) => {
    if (error) {
      console.error('Error revoking access token:', error);
      return callback(error);
    }

    if (response.statusCode !== 200) {
      console.error('Error revoking access token:', body);
      return callback(new Error('Failed to revoke access token'));
    }

    console.log('Access token revoked successfully');
    return callback(null);
  });
};

module.exports = {getChannel,postVideo,revokeAccessToken,getUserInfo,searchVideos}