import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, HeartHandshake, ShieldCheck, User } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const url = isRegistering ? 'http://localhost:3000/registro' : 'http://localhost:3000/login';
    const body = isRegistering ? { nombre, correo, password } : { correo, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error');
      }

      if (!isRegistering) {
        // En login exitoso, guardamos el token y llamamos a onLogin
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        onLogin();
      } else {
        // En registro exitoso, cambiamos a modo login
        setIsRegistering(false);
        setNombre('');
        setPassword('');
        // Mostrar mensaje de éxito (podrías usar un toast aquí)
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError(null);
    setNombre('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
        
        {/* Columna Izquierda */}
        <div className="flex flex-col space-y-8">
          <div className="flex items-center gap-6">
            <img 
              src="/src/assets/logo.png" 
              alt="Palabras de Esperanza Logo" 
              className="h-24 w-auto drop-shadow-lg"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">
              Sistema de Control de Inventarios
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed max-w-md">
              Gestión profesional de préstamos de aparatos ortopédicos para nuestra comunidad
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="bg-[#94d6c6] p-6 rounded-[32px] border border-[#94d6c6]/20 shadow-lg shadow-[#94d6c6]/20 hover:shadow-xl hover:shadow-[#94d6c6]/30 transition-all group">
              <div className="bg-white/30 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
                <ShieldCheck className="text-slate-900 w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Control Eficiente</h3>
              <p className="text-slate-800 text-sm leading-snug font-medium">Gestión completa de inventario y préstamos</p>
            </div>
            
            <div className="bg-[#ff8a71] p-6 rounded-[32px] border border-[#ff8a71]/20 shadow-lg shadow-[#ff8a71]/20 hover:shadow-xl hover:shadow-[#ff8a71]/30 transition-all group">
              <div className="bg-white/30 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
                <HeartHandshake className="text-white w-6 h-6" />
              </div>
              <h3 className="font-bold text-white mb-1">Ayuda Comunitaria</h3>
              <p className="text-white/90 text-sm leading-snug font-medium">Servicio digno para quienes lo necesitan</p>
            </div>
          </div>
        </div>

        {/* Columna Derecha - Formulario */}
        <div className="flex flex-col space-y-6">
          <div className="bg-white p-8 md:p-10 rounded-[40px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-md mx-auto">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900">
                {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
              </h3>
              <p className="text-slate-500 mt-2 text-sm">
                {isRegistering 
                  ? 'Ingresa tus datos para registrarte en el sistema' 
                  : 'Ingresa tus credenciales para acceder al sistema'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {isRegistering && (
                <div className="space-y-2 group">
                  <label htmlFor="nombre" className="text-sm font-semibold text-slate-700 ml-1">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400 group-focus-within:text-[#5ba4c7] transition-colors" />
                    </div>
                    <input
                      type="text"
                      id="nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all"
                      placeholder="Juan Pérez"
                      required={isRegistering}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 group">
                <label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-[#5ba4c7] transition-colors" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all"
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700 ml-1">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#5ba4c7] transition-colors" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {!isRegistering && (
                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center group cursor-pointer">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white checked:bg-[#5ba4c7] checked:border-[#5ba4c7] transition-all"
                      />
                      <svg
                        className="absolute left-1 top-1 h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="ml-3 text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Recordarme</span>
                  </label>
                  <a href="#" className="text-sm font-bold text-[#5ba4c7] hover:text-[#5ba4c7]/80 hover:underline decoration-2 underline-offset-4 transition-all">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#5ba4c7] hover:bg-[#5ba4c7]/90 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-[#5ba4c7]/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>{isLoading ? 'Procesando...' : (isRegistering ? 'Registrarse' : 'Iniciar sesión')}</span>
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button 
                onClick={toggleMode}
                className="text-sm font-semibold text-slate-600 hover:text-[#5ba4c7] transition-colors"
              >
                {isRegistering 
                  ? '¿Ya tienes una cuenta? Inicia sesión aquí' 
                  : '¿No tienes cuenta? Regístrate aquí'}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-[11px] text-center text-slate-400 font-medium leading-relaxed uppercase tracking-wider">
                Sistema exclusivo para personal autorizado <br /> del Centro Comunitario
              </p>
            </div>
          </div>

          <div className="bg-[#ffe4c4]/30 border border-[#ffe4c4] py-4 px-6 rounded-2xl flex items-center justify-center group cursor-pointer hover:bg-[#ffe4c4]/50 transition-all">
            <p className="text-sm font-semibold text-slate-700">
              ¿Necesitas ayuda? <span className="text-[#5ba4c7] font-bold ml-1 group-hover:underline">Contacta al administrador del sistema</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
