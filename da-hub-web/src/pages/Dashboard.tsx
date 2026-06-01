import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, CalendarDays, Users, Tag } from 'lucide-react';
import { api } from '../services/api';
import { CreateEventModal } from '../components/CreateEventModal';
import { TicketModal } from '../components/TicketModal';

interface EventData {
  id: string;
  title: string;
  description: string;
  category: string;
  eventDate: string;
  maxCapacity: number;
  currentTicketsSold: number;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [bookingEventId, setBookingEventId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      } else {
        setError('Não foi possível carregar os eventos.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('@DAHub:token');
    navigate('/');
  };

  const handleBookTicket = async (eventId: string) => {
    try {
      setBookingEventId(eventId);
      setError('');
      const response = await api.post(`/tickets/book/${eventId}`);
      setTicketData(response.data);
      setIsTicketModalOpen(true);
      fetchEvents(); // Refresh capacity
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Você precisa estar logado para garantir ingresso.');
      } else {
        setError(err.response?.data?.message || err.response?.data || 'Erro ao garantir ingresso.');
      }
    } finally {
      setBookingEventId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

      <main className="flex-1 flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <h2 className="text-3xl font-bold uppercase text-zinc-50 tracking-tighter">Eventos Ativos</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-zinc-50 text-zinc-950 border-4 border-zinc-950 font-bold uppercase py-2 px-6 hover:shadow-neo transition-all active:translate-y-1 active:translate-x-1 active:shadow-none"
          >
            + Novo Evento
          </button>
        </div>

        {error && (
          <div className="bg-red-500 text-zinc-50 border-4 border-red-700 p-4 font-bold uppercase">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="bg-zinc-900 border-4 border-zinc-50 p-8 shadow-neo flex justify-center items-center">
            <p className="text-zinc-50 font-bold uppercase animate-pulse">Carregando satélites...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-zinc-900 border-4 border-zinc-50 p-12 shadow-neo flex flex-col items-center justify-center gap-4 text-center">
            <CalendarDays className="w-16 h-16 text-zinc-600" />
            <p className="text-zinc-400 font-bold text-xl uppercase tracking-widest">
              Nenhum evento programado.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-zinc-900 border-4 border-zinc-50 p-6 flex flex-col gap-4 shadow-neo hover:shadow-neo-hover transition-all group">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-xl font-bold uppercase text-zinc-50 group-hover:text-yellow-400 transition-colors line-clamp-2">
                    {event.title}
                  </h3>
                  <span className="bg-zinc-800 text-xs font-bold px-2 py-1 border-2 border-zinc-50 text-zinc-50 uppercase whitespace-nowrap">
                    {event.category}
                  </span>
                </div>
                
                <p className="text-zinc-400 text-sm font-medium line-clamp-3 flex-1">
                  {event.description}
                </p>

                <div className="flex flex-col gap-2 mt-4 pt-4 border-t-2 border-zinc-800">
                  <div className="flex items-center gap-2 text-zinc-300 text-sm font-bold">
                    <CalendarDays className="w-4 h-4" />
                    {formatDate(event.eventDate)}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300 text-sm font-bold">
                    <Users className="w-4 h-4" />
                    {event.currentTicketsSold} / {event.maxCapacity} Ingressos
                  </div>
                </div>

                <button 
                  onClick={() => handleBookTicket(event.id)}
                  disabled={event.currentTicketsSold >= event.maxCapacity || bookingEventId === event.id}
                  className={`border-4 border-zinc-950 font-bold uppercase py-2 px-4 transition-all mt-2 w-full text-sm flex items-center justify-center gap-2 ${
                    event.currentTicketsSold >= event.maxCapacity 
                      ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' 
                      : 'bg-zinc-50 text-zinc-950 hover:bg-yellow-400 hover:shadow-neo active:translate-y-1 active:translate-x-1 active:shadow-none'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  {bookingEventId === event.id 
                    ? 'Emitindo...' 
                    : event.currentTicketsSold >= event.maxCapacity 
                      ? 'Esgotado' 
                      : 'Garantir Ingresso'
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchEvents}
      />

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        ticket={ticketData}
      />
    </div>
  );
}
