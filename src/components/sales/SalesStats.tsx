import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import BoltIcon from '@mui/icons-material/Bolt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const StatCard = ({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) => (
  <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
    <Box sx={{ 
      backgroundColor: `${color}20`,
      borderRadius: '50%',
      p: 1,
      mr: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {React.cloneElement(icon as React.ReactElement, { sx: { color } })}
    </Box>
    <Box>
      <Typography color="textSecondary" variant="body2">
        {title}
      </Typography>
      <Typography variant="h6">
        {value}
      </Typography>
    </Box>
  </Box>
);

const SalesStats: React.FC = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Paper elevation={2}>
          <StatCard
            title="Ventas Totales"
            value="15 kWh"
            icon={<TrendingUpIcon />}
            color="#4CAF50"
          />
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper elevation={2}>
          <StatCard
            title="Ingresos"
            value="$2,500"
            icon={<MonetizationOnIcon />}
            color="#2196F3"
          />
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper elevation={2}>
          <StatCard
            title="Energía Disponible"
            value="50 kWh"
            icon={<BoltIcon />}
            color="#FF9800"
          />
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper elevation={2}>
          <StatCard
            title="Ofertas Activas"
            value="3"
            icon={<AccessTimeIcon />}
            color="#9C27B0"
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SalesStats; 