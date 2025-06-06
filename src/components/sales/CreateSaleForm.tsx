import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { es } from 'date-fns/locale';
import PublishOfferModal from './PublishOfferModal';

interface SaleFormData {
  energyAmount: string;
  price: string;
  location: string;
  availableFrom: Date | null;
  availableTo: Date | null;
}

const CreateSaleForm: React.FC = () => {
  const [formData, setFormData] = useState<SaleFormData>({
    energyAmount: '',
    price: '',
    location: '',
    availableFrom: null,
    availableTo: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.energyAmount || !formData.price || !formData.location || !formData.availableFrom || !formData.availableTo) {
      setError('Por favor, completa todos los campos requeridos');
      return;
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:5001/energy-offers/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          energyAmount: Number(formData.energyAmount),
          price: Number(formData.price),
          location: formData.location,
          availableFrom: formData.availableFrom?.toISOString(),
          availableTo: formData.availableTo?.toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear la oferta');
      }

      setSuccess(true);
      setFormData({
        energyAmount: '',
        price: '',
        location: '',
        availableFrom: null,
        availableTo: null
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la oferta');
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box component="form" onSubmit={handleOpenModal} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="energyAmount"
              label="Cantidad de Energía (kWh)"
              type="number"
              fullWidth
              required
              value={formData.energyAmount}
              onChange={handleChange}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="price"
              label="Precio por kWh ($)"
              type="number"
              fullWidth
              required
              value={formData.price}
              onChange={handleChange}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="location"
              label="Ubicación"
              fullWidth
              required
              value={formData.location}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DateTimePicker
              label="Disponible Desde"
              value={formData.availableFrom}
              onChange={(newValue) => {
                setFormData(prev => ({ ...prev, availableFrom: newValue }));
              }}
              slotProps={{ textField: { fullWidth: true, required: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DateTimePicker
              label="Disponible Hasta"
              value={formData.availableTo}
              onChange={(newValue) => {
                setFormData(prev => ({ ...prev, availableTo: newValue }));
              }}
              slotProps={{ textField: { fullWidth: true, required: true } }}
            />
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Oferta creada exitosamente
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ 
            mt: 3,
            background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #43A047 0%, #1E88E5 100%)',
            }
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Crear Oferta'}
        </Button>

        <PublishOfferModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmPublish}
          offerData={formData}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default CreateSaleForm; 