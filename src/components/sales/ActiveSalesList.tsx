import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EnergyOffer {
  id: string;
  energyAmount: number;
  price: number;
  location: string;
  availableFrom: string;
  availableTo: string;
  status: 'active' | 'sold' | 'expired';
}

const ActiveSalesList: React.FC = () => {
  const [offers, setOffers] = useState<EnergyOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async () => {
    try {
      const response = await fetch('http://localhost:5001/energy-offers/my-offers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener las ofertas');
      }

      const data = await response.json();
      setOffers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las ofertas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleDelete = async (offerId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta oferta?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/energy-offers/${offerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la oferta');
      }

      setOffers(offers.filter(offer => offer.id !== offerId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la oferta');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (offers.length === 0) {
    return (
      <Typography variant="body1" color="textSecondary">
        No hay ofertas activas
      </Typography>
    );
  }

  return (
    <List>
      {offers.map((offer) => (
        <ListItem
          key={offer.id}
          divider
          secondaryAction={
            <Box>
              <IconButton edge="end" aria-label="editar" sx={{ mr: 1 }}>
                <EditIcon />
              </IconButton>
              <IconButton 
                edge="end" 
                aria-label="eliminar"
                onClick={() => handleDelete(offer.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          }
        >
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1">
                  {offer.energyAmount} kWh - ${offer.price}/kWh
                </Typography>
                <Chip 
                  label={offer.status} 
                  color={offer.status === 'active' ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            }
            secondary={
              <>
                <Typography variant="body2" component="span">
                  {offer.location}
                </Typography>
                <br />
                <Typography variant="body2" component="span">
                  Disponible: {format(new Date(offer.availableFrom), 'PPp', { locale: es })} - 
                  {format(new Date(offer.availableTo), 'PPp', { locale: es })}
                </Typography>
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default ActiveSalesList; 