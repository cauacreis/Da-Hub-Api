import { Rocket } from 'lucide-react';

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-4">
      <div className="bg-zinc-900 border-4 border-zinc-50 p-8 rounded-none shadow-neo max-w-md w-full text-center flex flex-col items-center gap-6">
        <Rocket className="w-16 h-16 text-zinc-50" />
        <h1 className="text-4xl font-bold uppercase tracking-tighter">
          DA Hub
        </h1>
        <p className="text-zinc-400 font-medium">
          O Painel Neo-Brutalista está vivo. Conexão Axios pronta para decolar.
        </p>
        <button className="bg-zinc-50 text-zinc-950 border-4 border-zinc-950 font-bold uppercase py-3 px-6 hover:shadow-neo transition-all mt-4 w-full active:translate-y-1 active:translate-x-1 active:shadow-none">
          Iniciar Sessão
        </button>
      </div>
    </div>
  );
}

export default App;
