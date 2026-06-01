import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token } = response.data;
      
      if (token) {
        localStorage.setItem('@DAHub:token', token);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data || 'Erro ao conectar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-4">
      <div className="bg-zinc-900 border-4 border-zinc-50 p-8 rounded-none shadow-neo max-w-md w-full flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 mb-2">
          <Rocket className="w-12 h-12 text-zinc-50" />
          <h1 className="text-3xl font-bold uppercase tracking-tighter text-zinc-50">
            DA Hub
          </h1>
          <p className="text-zinc-400 font-medium text-sm">Painel Administrativo</p>
        </div>

        {error && (
          <div className="bg-red-500 text-zinc-50 border-4 border-red-700 p-4 font-bold uppercase text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-zinc-50 font-bold uppercase text-sm" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-950 border-4 border-zinc-50 text-zinc-50 p-3 outline-none focus:shadow-neo transition-all font-medium placeholder:text-zinc-600"
              placeholder="seuemail@dahub.dev"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-zinc-50 font-bold uppercase text-sm" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-950 border-4 border-zinc-50 text-zinc-50 p-3 outline-none focus:shadow-neo transition-all font-medium placeholder:text-zinc-600"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-zinc-50 text-zinc-950 border-4 border-zinc-950 font-bold uppercase py-3 px-6 hover:shadow-neo transition-all mt-4 w-full active:translate-y-1 active:translate-x-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando...' : 'Iniciar Sessão'}
          </button>
        </form>

        <div className="text-center mt-2">
          <p className="text-zinc-400 font-medium text-sm">
            Ainda não tem conta?{' '}
            <button 
              onClick={() => navigate('/register')} 
              className="text-yellow-400 hover:text-zinc-50 transition-colors uppercase font-bold tracking-wider"
            >
              Crie uma
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
