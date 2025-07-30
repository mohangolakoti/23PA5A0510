import { Typography, Paper } from '@mui/material';
import UrlList from '../components/UrlList';
import { Log } from '../logger/logger';

function StatsPage() {
  Log('frontend', 'info', 'page', 'Loaded Statistics page');
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        URL Statistics
      </Typography>
      <UrlList />
    </Paper>
  );
}

export default StatsPage;