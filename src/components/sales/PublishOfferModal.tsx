import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  styled,
  IconButton,
  TextField,
  Autocomplete,
  FormControl,
  FormHelperText,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { format, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { energyOfferService, CreateOfferData } from '../../services/energyOfferService';

const BlurredDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiBackdrop-root': {
    backdropFilter: 'blur(8px)',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  '& .MuiDialog-paper': {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: theme.spacing(2),
    maxWidth: '600px',
    width: '90%',
  }
}));

const GradientBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
  padding: theme.spacing(3),
  borderRadius: '12px',
  color: 'white',
  marginBottom: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
    zIndex: 1,
  }
}));

const FormBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  padding: theme.spacing(2),
}));

const CIUDADES_COLOMBIA = [
  'Medellín', 'Bogotá', 'Cali', 'Barranquilla', 'Cartagena', 
  'Santa Marta', 'Bucaramanga', 'Pereira', 'Manizales', 'Armenia',
  'Cúcuta', 'Ibagué', 'Neiva', 'Villavicencio', 'Pasto'
];

const TIPOS_ENERGIA = [
  { value: 'solar', label: 'Solar' },
  { value: 'hidráulica', label: 'Hidráulica' },
  { value: 'biomasa', label: 'Biomasa' },
  { value: 'eólica', label: 'Eólica' }
];

interface PublishOfferModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  offerData: {
    energyAmount: string;
    price: string;
    location: string;
    availableFrom: Date | null;
    availableTo: Date | null;
  };
}

const PublishOfferModal: React.FC<PublishOfferModalProps> = ({
  open,
  onClose,
  onConfirm,
  offerData
}) => {
  const [formData, setFormData] = useState({
    energyAmount: '',
    pricePerUnit: '',
    location: '',
    type: '' as 'solar' | 'hidráulica' | 'biomasa' | 'eólica' | '',
    availableFrom: null as Date | null,
    availableTo: null as Date | null
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    energyAmount: '',
    pricePerUnit: '',
    location: '',
    type: '',
    dates: '',
    submit: ''
  });

  const validateForm = () => {
    const newErrors = {
      energyAmount: '',
      pricePerUnit: '',
      location: '',
      type: '',
      dates: '',
      submit: ''
    };

    if (!formData.energyAmount || Number(formData.energyAmount) <= 0) {
      newErrors.energyAmount = 'La cantidad debe ser mayor a 0';
    }

    if (!formData.pricePerUnit || Number(formData.pricePerUnit) <= 0) {
      newErrors.pricePerUnit = 'El precio debe ser mayor a 0';
    }

    if (!formData.location) {
      newErrors.location = 'Selecciona una ubicación';
    }

    if (!formData.type || !['solar', 'hidráulica', 'biomasa', 'eólica'].includes(formData.type)) {
      newErrors.type = 'Selecciona un tipo de energía válido';
    }

    if (!formData.availableFrom || !formData.availableTo) {
      newErrors.dates = 'Ambas fechas son requeridas';
    } else if (isAfter(formData.availableFrom, formData.availableTo)) {
      newErrors.dates = 'La fecha inicial debe ser anterior a la fecha final';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors(prev => ({ ...prev, submit: '' }));

    try {
      const offerData: CreateOfferData = {
        energyAmount: Number(formData.energyAmount),
        pricePerUnit: Number(formData.pricePerUnit),
        location: formData.location,
        type: formData.type as 'solar' | 'hidráulica' | 'biomasa' | 'eólica',
        availableFrom: formData.availableFrom!.toISOString(),
        availableTo: formData.availableTo!.toISOString()
      };

      if (!offerData.type || !['solar', 'hidráulica', 'biomasa', 'eólica'].includes(offerData.type)) {
        throw new Error('Tipo de energía no válido');
      }

      if (!offerData.location.trim()) {
        throw new Error('La ubicación es requerida');
      }

      if (isNaN(offerData.energyAmount) || offerData.energyAmount <= 0) {
        throw new Error('La cantidad de energía debe ser mayor que 0');
      }

      if (isNaN(offerData.pricePerUnit) || offerData.pricePerUnit <= 0) {
        throw new Error('El precio por unidad debe ser mayor que 0');
      }

      console.log('Enviando oferta:', offerData);
      const newOffer = await energyOfferService.createOffer(offerData);
      console.log('Respuesta:', newOffer);
      
      await onConfirm();
      
      onClose();
      setFormData({
        energyAmount: '',
        pricePerUnit: '',
        location: '',
        type: '',
        availableFrom: null,
        availableTo: null
      });
    } catch (error) {
      console.error('Error al crear oferta:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Error al crear la oferta'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <BlurredDialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: -8,
              top: -8,
              color: 'grey.500',
            }}
          >
            <CloseIcon />
          </IconButton>

          <GradientBox>
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
              Nueva Oferta de Energía
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Ingresa los detalles de tu oferta
            </Typography>
            <CheckCircleOutlineIcon 
              sx={{ 
                position: 'absolute',
                right: 16,
                top: 16,
                fontSize: 40,
                opacity: 0.8
              }} 
            />
          </GradientBox>

          <DialogContent>
            <FormBox>
              {errors.submit && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.submit}
                </Alert>
              )}
              
              <TextField
                label="Cantidad de Energía (kWh)"
                type="number"
                value={formData.energyAmount}
                onChange={(e) => setFormData({ ...formData, energyAmount: e.target.value })}
                error={!!errors.energyAmount}
                helperText={errors.energyAmount}
                InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                fullWidth
              />

              <TextField
                label="Precio por kWh ($)"
                type="number"
                value={formData.pricePerUnit}
                onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                error={!!errors.pricePerUnit}
                helperText={errors.pricePerUnit}
                InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                fullWidth
              />

              <Autocomplete
                options={CIUDADES_COLOMBIA}
                value={formData.location}
                onChange={(_, newValue) => setFormData({ ...formData, location: newValue || '' })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ubicación"
                    error={!!errors.location}
                    helperText={errors.location}
                  />
                )}
                fullWidth
              />

              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>Tipo de Energía</InputLabel>
                <Select
                  value={formData.type}
                  label="Tipo de Energía"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'solar' | 'hidráulica' | 'biomasa' | 'eólica' | '' })}
                >
                  {TIPOS_ENERGIA.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <DateTimePicker
                  label="Disponible Desde"
                  value={formData.availableFrom}
                  onChange={(newValue) => setFormData({ ...formData, availableFrom: newValue })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.dates
                    }
                  }}
                />
                <DateTimePicker
                  label="Disponible Hasta"
                  value={formData.availableTo}
                  onChange={(newValue) => setFormData({ ...formData, availableTo: newValue })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.dates
                    }
                  }}
                />
              </Box>
              {errors.dates && (
                <FormHelperText error>{errors.dates}</FormHelperText>
              )}
            </FormBox>
          </DialogContent>

          <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
            <Button 
              onClick={onClose}
              variant="outlined"
              disabled={loading}
              sx={{ 
                borderRadius: '8px',
                px: 3,
                borderColor: 'grey.300',
                color: 'grey.700'
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
              sx={{ 
                borderRadius: '8px',
                px: 4,
                background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #43A047 0%, #1E88E5 100%)',
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Publicar Oferta'
              )}
            </Button>
          </DialogActions>
        </Box>
      </BlurredDialog>
    </LocalizationProvider>
  );
};

export default PublishOfferModal; 