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
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [bookingEventId, setBookingEventId] = useState<string | null>(null);

  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>('STUDENT');

  useEffect(() => {
    const token = localStorage.getItem('@DAHub:token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (e) {
        console.error("Failed to parse token payload", e);
      }
    }
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [eventsResponse, myTicketsResponse] = await Promise.all([
        api.get(`/events?page=${currentPage}&size=6`),
        api.get('/tickets/my').catch(() => ({ data: [] }))
      ]);
      setEvents(eventsResponse.data.content || eventsResponse.data);
      setTotalPages(eventsResponse.data.totalPages || 1);
      setMyTickets(myTicketsResponse.data);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      } else {
        setError('Não foi possível carregar os dados.');
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
      fetchData(); // Refresh capacity and my tickets
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

  const handleCancelTicket = async (ticketId: string) => {
    if (!window.confirm('Tem certeza que deseja cancelar sua inscrição?')) return;
    try {
      await api.post(`/tickets/${ticketId}/cancel`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || 'Erro ao cancelar inscrição.');
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
        <div className="flex items-center gap-4">
          {userRole !== 'STUDENT' && (
            <button
              onClick={() => navigate('/scanner')}
              className="text-zinc-400 hover:text-zinc-50 font-bold uppercase text-xs tracking-widest transition-colors flex items-center gap-1"
            >
              Modo Catraca
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 text-zinc-50 border-4 border-red-700 font-bold uppercase py-2 px-4 hover:shadow-neo transition-all active:translate-y-1 active:translate-x-1 active:shadow-none"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <h2 className="text-3xl font-bold uppercase text-zinc-50 tracking-tighter">Eventos Ativos</h2>
          {userRole !== 'STUDENT' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-zinc-50 text-zinc-950 border-4 border-zinc-950 font-bold uppercase py-2 px-6 hover:shadow-neo transition-all active:translate-y-1 active:translate-x-1 active:shadow-none"
            >
              + Novo Evento
            </button>
          )}
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
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const myTicket = myTickets.find(t => t.eventId === event.id && (t.status === 'PAID' || t.status === 'USED'));
                return (
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

                  {myTicket ? (
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => { setTicketData(myTicket); setIsTicketModalOpen(true); }}
                        className="flex-1 bg-yellow-400 text-zinc-950 border-4 border-zinc-950 font-bold uppercase py-2 px-2 hover:shadow-neo transition-all active:translate-y-1 active:translate-x-1 active:shadow-none text-xs flex items-center justify-center gap-1"
                      >
                        <Tag className="w-3 h-3" /> Ver Ingresso
                      </button>
                      <button 
                        onClick={() => handleCancelTicket(myTicket.ticketId)}
                        className="bg-zinc-950 text-red-500 border-4 border-red-500 font-bold uppercase py-2 px-2 hover:bg-red-500 hover:text-zinc-950 hover:shadow-neo transition-all active:translate-y-1 active:translate-x-1 active:shadow-none text-xs flex items-center justify-center"
                        title="Cancelar Inscrição"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
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
                  )}
                </div>
              )})}
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="bg-zinc-950 text-zinc-50 border-4 border-zinc-50 font-bold uppercase py-2 px-6 hover:shadow-neo disabled:opacity-50 disabled:cursor-not-allowed transition-all active:translate-y-1 active:translate-x-1 active:shadow-none"
                >
                  Anterior
                </button>
                <span className="text-zinc-50 font-bold uppercase tracking-widest">
                  {currentPage + 1} / {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="bg-zinc-950 text-zinc-50 border-4 border-zinc-50 font-bold uppercase py-2 px-6 hover:shadow-neo disabled:opacity-50 disabled:cursor-not-allowed transition-all active:translate-y-1 active:translate-x-1 active:shadow-none"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <CreateEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData}
      />

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        ticket={ticketData}
      />
    </div>
  );
}
