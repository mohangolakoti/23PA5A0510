const express = require('express');
const { Log } = require('./logger');
const { createShortUrl, getUrlStats, redirectUrl } = require('./urlService');

const app = express();
app.use(express.json());

const { serverPort } = require('./config');

app.post('/shorturls', async (req, res) => {
  try {
    const { url, validity, shortcode } = req.body;
    if (!url) {
      await Log('backend', 'error', 'handler', 'Missing URL in request');
      return res.status(400).json({ error: 'URL is required' });
    }
    const result = await createShortUrl(url, validity, shortcode);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});

app.get('/shorturls/:shortcode', async (req, res) => {
  try {
    const stats = await getUrlStats(req.params.shortcode);
    res.status(200).json(stats);
  } catch (error) {
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});

app.get('/:shortcode', async (req, res) => {
  try {
    const url = await redirectUrl(req.params.shortcode, req);
    res.redirect(url);
  } catch (error) {
    res.status(error.message.includes('not found') ? 404 : 400).json({ error: error.message });
  }
});

app.listen(serverPort, async () => {
  await Log('backend', 'info', 'middleware', `Server running on port ${serverPort}`);
});