const axios = require('axios');
const { apiBaseUrl, authCredentials } = require('./config');

async function getAuthToken() {
  try {
    const response = await axios.post(`${apiBaseUrl}/auth`, authCredentials);
    if ([200, 201].includes(response.status)) {
      if (response.data.token_type && response.data.access_token) {
        return `${response.data.token_type} ${response.data.access_token}`;
      }
      throw new Error(`Invalid response format: ${JSON.stringify(response.data)}`);
    }
    throw new Error(`Authentication failed with status: ${response.status} - ${JSON.stringify(response.data)}`);
  } catch (error) {
    const errorMessage = error.response 
      ? `Authentication error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
      : `Authentication error: ${error.message}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

module.exports = { getAuthToken };