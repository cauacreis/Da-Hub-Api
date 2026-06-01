import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('@DAHub:token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6 flex flex-col gap-6">
      <header className="flex items-center justify-between bg-zinc-900 border-4 border-zinc-50 p-6 shadow-neo">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-zinc-50" />
          <h1 className="text-2xl font-bold uppercase text-zinc-50 tracking-tighter">Painel da Diretoria</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 text-zinc-50 border-4 border-red-700 font-bold uppercase py-2 px-4 hover:shadow-neo transition-all active:translate-y-1 active:translate-x-1 active:shadow-none"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </header>

      <main className="bg-zinc-900 border-4 border-zinc-50 p-8 shadow-neo flex-1 flex items-center justify-center">
        <p className="text-zinc-400 font-medium text-lg uppercase tracking-widest text-center">
          Bem-vindo ao centro de comando.
          <br />
          Selecione um módulo para começar.
        </p>
      </main>
    </div>
  );
}
