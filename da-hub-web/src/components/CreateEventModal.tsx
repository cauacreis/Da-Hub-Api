import { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateEventModal({ isOpen, onClose, onSuccess }: CreateEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('EGAMES');
  const [eventDate, setEventDate] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const payload = {
        title,
        description,
        category,
        eventDate: eventDate + ':00', // LocalDateTime expects seconds
        maxCapacity: parseInt(maxCapacity, 10),
      };

      await api.post('/events', payload);
      
      setSuccess('Evento criado com sucesso!');
      setTimeout(() => {
        setSuccess('');
        setTitle('');
        setDescription('');
        setCategory('EGAMES');
        setEventDate('');
        setMaxCapacity('');
        onSuccess();
        onClose();
      }, 1500);

    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Acesso Negado: Apenas a Diretoria pode criar eventos.');
      } else if (err.response?.status === 400) {
        // Spring validation error format
        const data = err.response.data;
        if (data.errors && data.errors.length > 0) {
          setError(`Erro de validação: ${data.errors[0].defaultMessage || 'Verifique os dados informados.'}`);
        } else if (data.message) {
          setError(`Erro: ${data.message}`);
        } else {
          setError('Erro de validação. Verifique os dados informados.');
        }
      } else {
        setError(err.response?.data?.message || err.response?.data || 'Erro ao conectar com o servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-zinc-950 border-4 border-zinc-50 p-6 w-full max-w-xl shadow-neo relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-50 hover:text-red-500 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        <h2 className="text-2xl font-bold uppercase text-zinc-50 tracking-tighter mb-6 border-b-4 border-zinc-50 pb-2">
          Criar Novo Evento
        </h2>

        {error && (
          <div className="bg-red-500 text-zinc-50 border-4 border-red-700 p-4 font-bold uppercase text-sm flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-500 text-zinc-50 border-4 border-green-700 p-4 font-bold uppercase text-sm flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-zinc-50 font-bold uppercase text-sm">Título do Evento</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-900 border-4 border-zinc-50 text-zinc-50 p-3 outline-none focus:shadow-neo transition-all font-medium"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-zinc-50 font-bold uppercase text-sm">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-zinc-900 border-4 border-zinc-50 text-zinc-50 p-3 outline-none focus:shadow-neo transition-all font-medium min-h-[100px] resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-zinc-50 font-bold uppercase text-sm">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-zinc-900 border-4 border-zinc-50 text-zinc-50 p-3 outline-none focus:shadow-neo transition-all font-medium uppercase"
                required
              >
                <option value="EGAMES">E-Games</option>
                <option value="SYMPOSIUM">Simpósio</option>
                <option value="CULTURE">Cultura</option>
                <option value="PARTY">Festa</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-zinc-50 font-bold uppercase text-sm">Capacidade Máxima</label>
              <input
                type="number"
                min="1"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                className="bg-zinc-900 border-4 border-zinc-50 text-zinc-50 p-3 outline-none focus:shadow-neo transition-all font-medium"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-zinc-50 font-bold uppercase text-sm">Data e Hora</label>
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="bg-zinc-900 border-4 border-zinc-50 text-zinc-50 p-3 outline-none focus:shadow-neo transition-all font-medium [color-scheme:dark]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !!success}
            className="bg-zinc-50 text-zinc-950 border-4 border-zinc-950 font-bold uppercase py-4 px-6 hover:shadow-neo transition-all mt-4 w-full active:translate-y-1 active:translate-x-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isLoading ? 'Implantando...' : 'Criar Evento'}
          </button>
        </form>
      </div>
    </div>
  );
}
