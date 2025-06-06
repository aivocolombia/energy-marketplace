import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'buyer',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones básicas
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.email.trim()) {
      setError('El correo electrónico es requerido');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    try {
      const response = await authAPI.register(formData);
      setAuth(response.user, response.token);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al registrar usuario');
      }
      console.error('Error en registro:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-erco-primary via-erco-tertiary to-erco-secondary p-4">
      {/* Círculos decorativos con blur */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-erco-secondary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-erco-primary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-erco-tertiary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative bg-white/10 backdrop-blur-lg w-full max-w-md p-8 rounded-2xl shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            ERCO Energy
          </h2>
          <p className="text-white/80 text-lg">
            Crear nueva cuenta
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                Nombre
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-white/50 text-white backdrop-blur-sm focus:ring-2 focus:ring-erco-secondary focus:border-transparent"
                placeholder="Nombre completo"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-white/50 text-white backdrop-blur-sm focus:ring-2 focus:ring-erco-secondary focus:border-transparent"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-white/50 text-white backdrop-blur-sm focus:ring-2 focus:ring-erco-secondary focus:border-transparent"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="role" className="sr-only">
                Rol
              </label>
              <select
                id="role"
                name="role"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-white/50 text-white backdrop-blur-sm focus:ring-2 focus:ring-erco-secondary focus:border-transparent appearance-none"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="buyer" className="text-gray-900">Comprador</option>
                <option value="seller" className="text-gray-900">Vendedor</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="text-white bg-red-500/10 backdrop-blur-sm px-4 py-3 rounded-lg text-sm text-center border border-red-500/20">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-erco-secondary hover:bg-erco-secondary/90 text-gray-900 font-medium rounded-xl transition-all duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-erco-secondary"
            >
              Registrarse
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 