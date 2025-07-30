import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import axios from 'axios';
import { Log } from '../logger/logger';

function UrlList() {
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const knownShortcodes = Array.from({ length: 10 }, (_, i) => `short${i + 1}`);
        const responses = await Promise.all(
          knownShortcodes.map((shortcode) =>
            axios.get(`http://localhost:5000/shorturls/${shortcode}`).catch(() => null)
          )
        );
        const stats = responses
          .filter((res) => res && res.data)
          .map((res) => res.data);
        await Log('frontend', 'info', 'component', `Fetched stats for ${stats.length} URLs`);
        setUrls(stats);
      } catch (error) {
        await Log('frontend', 'error', 'component', `Error fetching stats: ${error.message}`);
      }
    };
    fetchStats();
  }, []);

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ p: 2 }}>Shortened URLs Statistics</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Short Link</TableCell>
            <TableCell>Original URL</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Expiry</TableCell>
            <TableCell>Click Count</TableCell>
            <TableCell>Click Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {urls.map((url) => (
            <TableRow key={url.shortLink}>
              <TableCell>{url.shortLink}</TableCell>
              <TableCell>{url.originalUrl}</TableCell>
              <TableCell>{new Date(url.createdAt).toLocaleString()}</TableCell>
              <TableCell>{new Date(url.expiry).toLocaleString()}</TableCell>
              <TableCell>{url.clickCount}</TableCell>
              <TableCell>
                {url.clickDetails.map((click, i) => (
                  <div key={i}>
                    {click.timestamp} - {click.referrer} ({click.location})
                  </div>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default UrlList;