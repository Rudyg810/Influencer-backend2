const { default: axios } = require("axios");

const uploadTweet = (text, access_token) => {
  const url = 'https://api.twitter.com/2/tweets';
  const tweet = {
    text: `${text}`
  };
  const uploadingmethord = {
    method: 'post',
    url: url,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`
    },
    data: tweet
  };
  // return the promise returned by axios
  return axios(uploadingmethord);
}

  async function getUserInfo_X(accessToken) {
    const response = await axios.get('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log(response.data);
    const id = response.data.data.id;
    const res = await axios.get(`https://api.twitter.com/2/users/${id}`)
    console.log(res)
    return response.data;
  }
module.exports = {uploadTweet,getUserInfo_X};