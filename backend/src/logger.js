const axios = require('axios');
const { apiBaseUrl } = require('./config');
const { getAuthToken } = require('./auth');

const VALID_STACKS = ['backend', 'frontend'];
const VALID_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const VALID_PACKAGES = [
  'cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository',
  'component', 'hook', 'page', 'state', 'style', 'auth', 'config', 'middleware', 'utils'
];

async function Log(stack, level, pkg, message) {
  if (!VALID_STACKS.includes(stack)) {
    throw new Error(`Invalid stack: ${stack}. Must be one of ${VALID_STACKS.join(', ')}`);
  }
  if (!VALID_LEVELS.includes(level)) {
    throw new Error(`Invalid level: ${level}. Must be one of ${VALID_LEVELS.join(', ')}`);
  }
  if (!VALID_PACKAGES.includes(pkg)) {
    throw new Error(`Invalid package: ${pkg}. Must be one of ${VALID_PACKAGES.join(', ')}`);
  }
  if (!message || typeof message !== 'string') {
    throw new Error('Message must be a non-empty string');
  }

  try {
    const token = await getAuthToken();
    const response = await axios.post(
      `${apiBaseUrl}/logs`,
      {
        stack,
        level,
        package: pkg,
        message
      },
      {
        headers: {
          Authorization: token
        }
      }
    );

    if ([200, 201].includes(response.status)) {
      return {
        logID: response.data.logID,
        message: response.data.message
      };
    }
    throw new Error(`Logging failed with status: ${response.status} - ${JSON.stringify(response.data)}`);
  } catch (error) {
    throw new Error(`Logging error: ${error.message}`);
  }
}

module.exports = { Log };