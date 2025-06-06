# ERCO - Plataforma de Comercio de Energía


## Estructura del Proyecto
```
erco/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/        # Componentes React reutilizables
│   ├── pages/            # Páginas/Rutas de la aplicación
│   ├── services/         # Servicios de API y WebSocket
│   ├── store/            # Estado global (Zustand)
│   ├── types/            # Definiciones de tipos TypeScript
│   └── utils/            # Utilidades y helpers
├── backend/              # Backend (Node.js + Express)
│   └── src/
│       ├── controllers/  # Controladores de rutas
│       ├── middleware/   # Middleware personalizado
│       ├── models/       # Modelos de MongoDB
│       ├── routes/       # Definición de rutas
│       ├── services/     # Servicios de negocio
│       └── types/        # Tipos TypeScript del backend
└── public/              # Archivos estáticos
```

## Tecnologías Principales

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Zustand (Gestión de estado)
- Socket.IO Client

### Backend
- Node.js
- Express
- TypeScript
- MongoDB
- Socket.IO
- JWT para autenticación

## Características

### Vendedores
- Publicación de ofertas de energía
- Especificación de cantidad, precio y disponibilidad
- Gestión de ofertas activas
- Historial de ventas

### Compradores
- Visualización de ofertas en tiempo real
- Filtrado por tipo de energía y ubicación
- Proceso de compra simplificado
- Historial de transacciones

## Requisitos Previos
- Node.js (v18 o superior)
- MongoDB
- npm o yarn

## Instalación y Configuración

1. **Clonar el Repositorio**
   ```bash
   git clone https://github.com/aivocolombia/energy-marketplace.git
   cd erco
   ```

2. **Configurar Variables de Entorno**

   Crear archivo `.env` en la raíz del proyecto:
  
   Crear archivo `.env` en la carpeta `backend`:
   

3. **Instalar Dependencias**
   ```bash
   # Instalar dependencias del frontend
   npm install

   # Instalar dependencias del backend
   cd backend
   npm install
   ```

4. **Iniciar la Aplicación**

   En una terminal (backend):
   ```bash
   cd backend
   npm run dev
   ```

   En otra terminal (frontend):
   ```bash
   cd ..
   npm run dev
   ```

5. **Acceder a la Aplicación**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001

## Comandos Disponibles

### Frontend
```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Construir para producción
npm run preview  # Vista previa de producción
npm run lint     # Ejecutar linter
```

### Backend
```bash
npm run dev      # Iniciar en modo desarrollo
npm run build    # Compilar TypeScript
npm run start    # Iniciar en producción
```

## Funcionalidades Principales

### Autenticación
- Registro de usuarios
- Inicio de sesión
- Gestión de roles (comprador/vendedor)

### Ofertas de Energía
- Creación y publicación
- Actualización en tiempo real
- Filtrado y búsqueda
- Proceso de compra

### Transacciones
- Registro de operaciones
- Historial detallado
- Estado de transacciones

## Seguridad
- Autenticación JWT
- Validación de roles
- Sanitización de datos
- CORS configurado
- Rate limiting

## Autor
Camilo Mora - [sh868936@gmail.com](mailto:sh868936@gmail.com)

## Licencia
Este proyecto está bajo la Licencia MIT.

---

© 2024 ERCO Energy Trading Platform
