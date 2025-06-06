import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Grid } from '@mui/material';
import SalesStats from './SalesStats';
import ActiveSalesList from './ActiveSalesList';
import CreateSaleForm from './CreateSaleForm';
import { useNavigate } from 'react-router-dom';

interface SalesModuleProps {
  userRole: string;
}

const SalesModule: React.FC<SalesModuleProps> = ({ userRole }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole !== 'seller') {
      navigate('/');
    }
  }, [userRole, navigate]);

  if (userRole !== 'seller') {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Panel de Ventas
      </Typography>
      
      <Grid container spacing={3}>
        {/* Estadísticas de ventas */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <SalesStats />
          </Paper>
        </Grid>

        {/* Formulario para crear nueva venta */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Crear Nueva Oferta
            </Typography>
            <CreateSaleForm />
          </Paper>
        </Grid>

        {/* Lista de ventas activas */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ofertas Activas
            </Typography>
            <ActiveSalesList />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SalesModule; 