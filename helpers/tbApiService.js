const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function jsonToParams(json) {
  if (typeof json === 'object' && json !== null && Object.keys(json).length > 0) {
    const params = Object.keys(json)
      .map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(json[k]);
      })
      .join('&');
    
    return '?' + params;
  } else {
    return '';
  }
}

const headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'X-Tadabase-App-id': process.env.APP_ID,
  'X-Tadabase-App-Key': process.env.APP_KEY,
  'X-Tadabase-App-Secret': process.env.APP_SECRET
}

module.exports = async function tadaApiCall(method, url, data) {
    console.log(url)
  return new Promise(async (resolve) => {
    try {
      const rateLimitFile = path.join(__dirname, 'tadabaseRateLimit.json');
      let rateLimitData;
      try {
        // Read the tadabaseRateLimit.json file
        rateLimitData = JSON.parse(fs.readFileSync(rateLimitFile, 'utf8'));
      } catch (err) {
        // If the file doesn't exist or is invalid JSON, initialize with default values
        rateLimitData = { remain: 0, await: 0 };
      }

      const now = Math.floor(Date.now() / 1000);
      const remain = rateLimitData.remain;
      const awaitTime = rateLimitData.await;
      console.log(remain, awaitTime)
      if (remain < 20) {
        const delay = now - awaitTime;
        console.log(`Waiting Rate Limit Refresh: ${delay / 1000} sec`);

        // Wait for the rate limit to reset
        setTimeout(async () => {
          var dataParametized = await jsonToParams(data) || '';
          try {
            const response = await axios({
              method: method,
              url: url + dataParametized,
              data: "",
              headers,
            });
            console.log('Tadabase API Call Success');
            // Omit the circular parts when logging
            const responseWithoutCircular = {
              status: response.status,
              headers: response.headers,
              // Add other properties you need here
            };
            //console.log('Response:', JSON.stringify(responseWithoutCircular, null, 2));
            resolve(response);

            // Update the rate limit data
            rateLimitData.remain = parseInt(response.headers['x-ratelimit-remaining']);
            rateLimitData.await = parseInt(response.headers['x-retry-after']) * 1000;
            fs.writeFileSync(rateLimitFile, JSON.stringify(rateLimitData, null, 2));
          } catch (error) {
            console.log('Tadabase API Call Error: ' + error);
            // Omit the circular parts when logging
            const errorWithoutCircular = {
              message: error.message,
              stack: error.stack,
              // Add other properties you need here
            };
            console.log('Error:', JSON.stringify(errorWithoutCircular, null, 2));
            resolve(errorWithoutCircular);
          }
        }, awaitTime);
      } else {
        var dataParametized = await jsonToParams(data) || '';
        try {
          const response = await axios({
            method: method,
            url: url + dataParametized,
            data: '',
            headers,
          });

          // Update the rate limit data from response headers
          rateLimitData.remain = parseInt(response.headers['x-ratelimit-remaining']);
          rateLimitData.await = parseInt(response.headers['x-retry-after']) * 1000;
          fs.writeFileSync(rateLimitFile, JSON.stringify(rateLimitData, null, 2));

          console.log('Tadabase API Call Success');
          // Omit the circular parts when logging
          const responseWithoutCircular = {
            status: response.status,
            headers: response.headers,
            // Add other properties you need here
          };
          //console.log('Response:', JSON.stringify(responseWithoutCircular, null, 2));
          resolve(response);
        } catch (error) {
          console.log('Tadabase API Call Error: ' + error);
          // Omit the circular parts when logging
          const errorWithoutCircular = {
            message: error.message,
            stack: error.stack,
            // Add other properties you need here
          };
          console.log('Error:', JSON.stringify(errorWithoutCircular, null, 2));
          resolve(errorWithoutCircular);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      resolve({ error: 'Internal server error' });
    }
  });
};
