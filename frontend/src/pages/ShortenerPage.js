import { useState } from 'react';
import { Typography, Paper } from '@mui/material';
import UrlForm from '../components/UrlForm';
import { Log } from '../logger/logger';

function ShortenerPage() {
  const [results, setResults] = useState([]);

  const handleSubmit = async (newResults) => {
    setResults(newResults);
    await Log('frontend', 'info', 'page', `Displayed ${newResults.length} shortened URLs`);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        URL Shortener
      </Typography>
      <UrlForm onSubmit={handleSubmit} />
      {results.length > 0 && (
        <div>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Shortened URLs
          </Typography>
          {results.map((result, index) => (
            <div key={index}>
              <Typography>
                Original: {result.originalUrl}<br />
                Short Link: <a href={result.shortLink}>{result.shortLink}</a><br />
                Expiry: {new Date(result.expiry).toLocaleString()}
              </Typography>
            </div>
          ))}
        </div>
      )}
    </Paper>
  );
}

export default ShortenerPage;