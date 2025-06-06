# Documentación de Endpoints ERCO Energy

## Variables de Entorno
```bash
# URL base para todos los endpoints
BASE_URL=http://localhost:5001
```

## Autenticación

### Registro de Usuario
```bash
curl -X POST ${BASE_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuario Ejemplo",
    "email": "usuario@ejemplo.com",
    "password": "123456",
    "role": "seller"
  }'
```
- **Descripción**: Registra un nuevo usuario en el sistema
- **Roles permitidos**: Público
- **Validaciones**:
  - name: requerido
  - email: debe ser válido
  - password: mínimo 6 caracteres
  - role: debe ser 'buyer' o 'seller'

### Inicio de Sesión
```bash
curl -X POST ${BASE_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "123456"
  }'
```
- **Descripción**: Inicia sesión y devuelve un token JWT
- **Roles permitidos**: Público
- **Respuesta**: Token JWT para autenticación

### Obtener Perfil
```bash
curl -X GET ${BASE_URL}/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
- **Descripción**: Obtiene la información del perfil del usuario autenticado
- **Roles permitidos**: Usuario autenticado
- **Requiere**: Token JWT

## Ofertas de Energía

### Crear Oferta
```bash
curl -X POST ${BASE_URL}/energy-offers/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "energyAmount": 100,
    "price": 50.5,
    "location": "Ciudad Ejemplo",
    "availableFrom": "2024-03-20T00:00:00Z",
    "availableTo": "2024-03-21T00:00:00Z"
  }'
```
- **Descripción**: Crea una nueva oferta de energía
- **Roles permitidos**: Vendedor
- **Requiere**: Token JWT

### Actualizar Precio de Oferta
```bash
curl -X PUT ${BASE_URL}/energy-offers/{offerId}/price \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newPrice": 45.5
  }'
```
- **Descripción**: Actualiza el precio de una oferta existente
- **Roles permitidos**: Vendedor (dueño de la oferta)
- **Requiere**: Token JWT

### Obtener Ofertas del Vendedor
```bash
curl -X GET ${BASE_URL}/energy-offers/my-offers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
- **Descripción**: Obtiene todas las ofertas creadas por el vendedor autenticado
- **Roles permitidos**: Vendedor
- **Requiere**: Token JWT

### Obtener Ofertas Activas
```bash
curl -X GET ${BASE_URL}/energy-offers/active \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
- **Descripción**: Obtiene todas las ofertas activas disponibles
- **Roles permitidos**: Compradores y Vendedores
- **Requiere**: Token JWT

## Notas Importantes
1. Todos los endpoints (excepto registro y login) requieren autenticación mediante token JWT
2. El token JWT debe ser incluido en el header 'Authorization' con el formato 'Bearer YOUR_JWT_TOKEN'
3. Las fechas deben estar en formato ISO 8601
4. Los precios deben ser números con hasta 2 decimales
5. Las cantidades de energía deben ser números positivos

## Códigos de Estado
- 200: Operación exitosa
- 201: Recurso creado exitosamente
- 400: Error en la solicitud
- 401: No autorizado
- 403: Prohibido
- 404: Recurso no encontrado
- 500: Error interno del servidor 