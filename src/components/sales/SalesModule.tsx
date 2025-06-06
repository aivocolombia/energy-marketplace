import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
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
      
      <Box sx={{ display: 'grid', gap: 3 }}>
        {/* Estadísticas de ventas */}
        <Box>
          <Paper sx={{ p: 2 }}>
            <SalesStats />
          </Paper>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Formulario para crear nueva venta */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Crear Nueva Oferta
            </Typography>
            <CreateSaleForm />
          </Paper>

          {/* Lista de ventas activas */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ofertas Activas
            </Typography>
            <ActiveSalesList />
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default SalesModule; 