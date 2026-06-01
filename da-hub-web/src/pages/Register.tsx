import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Rocket, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // The backend will enforce STUDENT role regardless of what is sent here
      await api.post('/users/register', { 
        name, 
        email, 
        registrationNumber, 
        password,
        role: 'STUDENT'
      });
      
      // Navigate to login on success
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data || 'Erro ao registrar usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-4">
      <div className="bg-zinc-900 border-4 border-zinc-50 p-8 rounded-none shadow-neo max-w-md w-full flex flex-col gap-6 relative">
        <Link 
          to="/" 
          className="absolute top-4 left-4 text-zinc-400 hover:text-zinc-50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex flex-col items-center gap-2 mb-2">
          <Rocket className="w-12 h-12 text-zinc-50" />
          <h1 className="text-3xl font-bold uppercase tracking-tighter text-zinc-50 text-center">
            DA Hub
          </h1>
          <p className="text-zinc-400 font-medium text-sm text-center">Credenciamento Universitário</p>
        </div>

        {error && (
          <div className="bg-red-500 text-zinc-50 border-4 border-red-700 p-4 font-bold uppercase text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-zinc-50 font-bold uppercase text-sm" htmlFor="name">
              Nome Completo
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-950 border-4 border-zinc-50 text-zinc-50 p-3 outline-none focus:shadow-neo transition-all font-medium placeholder:text-zinc-600"
              placeholder="Ex: Alan Turing"
              required
            />
          </div>

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
            <label className="text-zinc-50 font-bold uppercase text-sm" htmlFor="registrationNumber">
              Matrícula
            </label>
            <input
              id="registrationNumber"
              type="text"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className="bg-zinc-950 border-4 border-zinc-50 text-zinc-50 p-3 outline-none focus:shadow-neo transition-all font-medium placeholder:text-zinc-600"
              placeholder="Ex: 202310045"
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
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-zinc-50 text-zinc-950 border-4 border-zinc-950 font-bold uppercase py-3 px-6 hover:shadow-neo transition-all mt-4 w-full active:translate-y-1 active:translate-x-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Cadastrando...' : 'Criar Conta'}
          </button>
        </form>
      </div>
    </div>
  );
}
