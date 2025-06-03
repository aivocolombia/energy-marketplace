import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await authAPI.login(email, password);
      setAuth(response.user, response.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales inválidas');
    }
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
            Inicia sesión en tu cuenta
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-white/50 text-white backdrop-blur-sm focus:ring-2 focus:ring-erco-secondary focus:border-transparent"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
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
              Iniciar sesión
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              ¿No tienes cuenta? Regístrate
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 