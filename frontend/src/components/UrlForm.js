import { useState } from 'react';
import { TextField, Button, Grid, Typography, Box } from '@mui/material';
import axios from 'axios';
import { Log } from '../logger/logger';

function UrlForm({ onSubmit }) {
  const [urls, setUrls] = useState([
    { url: '', validity: '', shortcode: '' },
    { url: '', validity: '', shortcode: '' },
    { url: '', validity: '', shortcode: '' },
    { url: '', validity: '', shortcode: '' },
    { url: '', validity: '', shortcode: '' }
  ]);

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidShortcode = (shortcode) => {
    return !shortcode || /^[a-zA-Z0-9]{5,10}$/.test(shortcode);
  };

  const handleChange = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    setUrls(newUrls);
  };

  const handleSubmit = async () => {
    try {
      const validUrls = urls.filter(({ url }) => url.trim() !== '');
      if (validUrls.length === 0) {
        await Log('frontend', 'error', 'component', 'No URLs provided');
        alert('Please provide at least one URL');
        return;
      }

      for (const { url, validity, shortcode } of validUrls) {
        if (!isValidUrl(url)) {
          await Log('frontend', 'error', 'component', `Invalid URL: ${url}`);
          alert(`Invalid URL: ${url}`);
          return;
        }
        if (!isValidShortcode(shortcode)) {
          await Log('frontend', 'error', 'component', `Invalid shortcode: ${shortcode}`);
          alert('Shortcode must be alphanumeric and 5-10 characters');
          return;
        }
        if (validity && (isNaN(validity) || validity <= 0)) {
          await Log('frontend', 'error', 'component', `Invalid validity: ${validity}`);
          alert('Validity must be a positive integer');
          return;
        }
      }

      const responses = await Promise.all(
        validUrls.map(({ url, validity, shortcode }) =>
          axios.post('http://localhost:5000/shorturls', {
            url,
            validity: validity ? parseInt(validity) : 30,
            shortcode
          })
        )
      );

      const results = responses.map((res, i) => ({
        originalUrl: validUrls[i].url,
        shortLink: res.data.shortLink,
        expiry: res.data.expiry
      }));

      await Log('frontend', 'info', 'component', `Created ${results.length} short URLs`);
      onSubmit(results);
    } catch (error) {
      await Log('frontend', 'error', 'component', `Error creating short URLs: ${error.message}`);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Shorten URLs (up to 5)</Typography>
      {urls.map((urlData, index) => (
        <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Original URL"
              value={urlData.url}
              onChange={(e) => handleChange(index, 'url', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Validity (minutes)"
              type="number"
              value={urlData.validity}
              onChange={(e) => handleChange(index, 'validity', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Custom Shortcode (optional)"
              value={urlData.shortcode}
              onChange={(e) => handleChange(index, 'shortcode', e.target.value)}
            />
          </Grid>
        </Grid>
      ))}
      <Button variant="contained" onClick={handleSubmit}>
        Shorten URLs
      </Button>
    </Box>
  );
}

export default UrlForm;