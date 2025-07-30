const { Log } = require('./logger');
const { baseUrl } = require('./config');

const urlStore = new Map();
const clickStore = new Map();

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidShortcode(shortcode) {
  return /^[a-zA-Z0-9]{5,10}$/.test(shortcode);
}

async function generateShortcode() {
  const { nanoid } = await import('nanoid/async');
  let shortcode;
  do {
    shortcode = await nanoid(6);
  } while (urlStore.has(shortcode));
  await Log('backend', 'info', 'utils', `Generated shortcode: ${shortcode}`);
  return shortcode;
}

async function createShortUrl(url, validity = 30, customShortcode) {
  try {
    if (!isValidUrl(url)) {
      await Log('backend', 'error', 'handler', `Invalid URL: ${url}`);
      throw new Error('Invalid URL format');
    }

    let shortcode = customShortcode;
    if (shortcode) {
      if (!isValidShortcode(shortcode)) {
        await Log('backend', 'error', 'handler', `Invalid custom shortcode: ${shortcode}`);
        throw new Error('Custom shortcode must be alphanumeric and 5-10 characters');
      }
      if (urlStore.has(shortcode)) {
        await Log('backend', 'error', 'handler', `Shortcode already exists: ${shortcode}`);
        throw new Error('Custom shortcode already in use');
      }
    } else {
      shortcode = await generateShortcode();
    }

    const expiry = new Date(Date.now() + validity * 60 * 1000).toISOString();
    urlStore.set(shortcode, { url, createdAt: new Date().toISOString(), expiry });
    clickStore.set(shortcode, []);
    await Log('backend', 'info', 'handler', `Created short URL: ${shortcode} for ${url}`);
    return { shortLink: `${baseUrl}/${shortcode}`, expiry };
  } catch (error) {
    await Log('backend', 'error', 'handler', `Error creating short URL: ${error.message}`);
    throw error;
  }
}

async function getUrlStats(shortcode) {
  try {
    if (!urlStore.has(shortcode)) {
      await Log('backend', 'error', 'handler', `Shortcode not found: ${shortcode}`);
      throw new Error('Shortcode not found');
    }

    const { url, createdAt, expiry } = urlStore.get(shortcode);
    const clicks = clickStore.get(shortcode) || [];
    await Log('backend', 'info', 'handler', `Retrieved stats for shortcode: ${shortcode}`);
    return {
      shortLink: `${baseUrl}/${shortcode}`,
      originalUrl: url,
      createdAt,
      expiry,
      clickCount: clicks.length,
      clickDetails: clicks
    };
  } catch (error) {
    await Log('backend', 'error', 'handler', `Error retrieving stats: ${error.message}`);
    throw error;
  }
}

async function redirectUrl(shortcode, req) {
  try {
    if (!urlStore.has(shortcode)) {
      await Log('backend', 'error', 'handler', `Shortcode not found for redirect: ${shortcode}`);
      throw new Error('Shortcode not found');
    }

    const { url, expiry } = urlStore.get(shortcode);
    if (new Date() > new Date(expiry)) {
      await Log('backend', 'error', 'handler', `Shortcode expired: ${shortcode}`);
      throw new Error('Short URL has expired');
    }

    const clickData = {
      timestamp: new Date().toISOString(),
      referrer: req.get('Referrer') || 'unknown',
      location: 'IN'
    };
    clickStore.get(shortcode).push(clickData);
    await Log('backend', 'info', 'handler', `Redirected shortcode: ${shortcode} to ${url}`);
    return url;
  } catch (error) {
    await Log('backend', 'error', 'handler', `Error redirecting: ${error.message}`);
    throw error;
  }
}

module.exports = { createShortUrl, getUrlStats, redirectUrl };