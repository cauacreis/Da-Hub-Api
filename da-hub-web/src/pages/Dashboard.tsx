import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, CalendarDays, Users, Tag, Upload, DollarSign, Tv, UserCheck, Edit, Image } from 'lucide-react';
import { api } from '../services/api';
import { CreateEventModal } from '../components/CreateEventModal';
import { TicketModal } from '../components/TicketModal';
import { CandidateRegistrationModal } from '../components/CandidateRegistrationModal';
import { ManageCandidatesModal } from '../components/ManageCandidatesModal';
import { TvPresentationModal } from '../components/TvPresentationModal';

export interface AttachmentRequirement {
  id: string;
  label: string;
  allowedTypes: string;
  required: boolean;
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  category: string;
  eventDate: string;
  maxCapacity: number;
  currentTicketsSold: number;
  isPaid?: boolean;
  price?: number;
  maxTicketsPerUser?: number;
  requiresAttachment?: boolean;
  attachmentRequirementsJson?: string;
  bannerUrl?: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventData | null>(null);

  const [ticketData, setTicketData] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [bookingEventId, setBookingEventId] = useState<string | null>(null);

  // Modals State
  const [candidateRegEvent, setCandidateRegEvent] = useState<EventData | null>(null);
  const [adminCandidateEvent, setAdminCandidateEvent] = useState<EventData | null>(null);
  const [tvEvent, setTvEvent] = useState<EventData | null>(null);

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
        const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || 'Não foi possível carregar os dados.');
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('@DAHub:token');
    navigate('/');
  };

  const handleBookTicketClick = (event: EventData) => {
    if (event.requiresAttachment || event.isPaid) {
      setCandidateRegEvent(event);
    } else {
      handleDirectBookTicket(event.id);
    }
  };

  const handleDirectBookTicket = async (eventId: string) => {
    try {
      setBookingEventId(eventId);
      setError('');
      const response = await api.post(`/tickets/book/${eventId}`);
      setTicketData(response.data);
      setIsTicketModalOpen(true);
      fetchData();
    } catch (err: any) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || 'Erro ao garantir ingresso.');
      setError(msg);
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
      const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || 'Erro ao cancelar inscrição.');
      setError(msg);
    }
  };

  const handleOpenCreateModal = () => {
    setEventToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: EventData) => {
    setEventToEdit(event);
    setIsModalOpen(true);
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
          <h1 className="text-2xl font-bold uppercase text-zinc-50 tracking-tighter">Painel DA Hub</h1>
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
              onClick={handleOpenCreateModal}
              className="bg-zinc-50 text-zinc-950 border-4 border-zinc-950 font-bold uppercase py-2 px-6 hover:shadow-neo transition-all active:translate-y-1 active:translate-x-1 active:shadow-none text-sm"
            >
              + Novo Evento Detalhado
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500 text-zinc-50 border-4 border-red-700 p-4 font-bold uppercase text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="bg-zinc-900 border-4 border-zinc-50 p-8 shadow-neo flex justify-center items-center">
            <p className="text-zinc-50 font-bold uppercase animate-pulse">Carregando eventos do diretório...</p>
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
                const myTicket = myTickets.find(t => t.eventId === event.id && (t.status === 'PAID' || t.status === 'USED' || t.status === 'PENDING_PAYMENT'));
                const isUnlimited = !event.maxCapacity || event.maxCapacity >= 999999;
                
                return (
                <div key={event.id} className="bg-zinc-900 border-4 border-zinc-50 flex flex-col shadow-neo hover:shadow-neo-hover transition-all group relative overflow-hidden">
                  {/* Event Banner Header */}
                  <div className="h-44 w-full bg-zinc-950 border-b-4 border-zinc-50 overflow-hidden relative flex items-center justify-center">
                    {event.bannerUrl ? (
                      <img 
                        src={event.bannerUrl} 
                        alt={event.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 flex flex-col items-center justify-center gap-2">
                        <Image className="w-12 h-12 text-zinc-700" />
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">DA Hub Event</span>
                      </div>
                    )}
                    
                    {/* Category & Price Badge overlay on top right */}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                      <span className="bg-zinc-950/90 text-xs font-bold px-2 py-1 border-2 border-zinc-50 text-zinc-50 uppercase whitespace-nowrap backdrop-blur-sm shadow-neo">
                        {event.category}
                      </span>
                      {event.isPaid ? (
                        <span className="bg-yellow-400 text-zinc-950 text-[10px] font-bold px-2 py-0.5 border-2 border-zinc-950 uppercase flex items-center gap-0.5 shadow-neo">
                          <DollarSign className="w-3 h-3" /> R$ {event.price?.toFixed(2)}
                        </span>
                      ) : (
                        <span className="bg-green-500 text-zinc-950 text-[10px] font-bold px-2 py-0.5 border-2 border-zinc-950 uppercase shadow-neo">
                          Gratuito
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col gap-4 flex-1">
                    <h3 className="text-xl font-bold uppercase text-zinc-50 group-hover:text-yellow-400 transition-colors line-clamp-2">
                      {event.title}
                    </h3>

                    <p className="text-zinc-400 text-sm font-medium line-clamp-3 flex-1">
                      {event.description}
                    </p>

                    {event.requiresAttachment && (
                      <div className="bg-zinc-950 border-2 border-zinc-700 p-2 text-xs font-bold text-yellow-400 uppercase flex items-center gap-1">
                        <Upload className="w-4 h-4" /> Exige Anexo de Comprovante / Arte
                      </div>
                    )}

                    <div className="flex flex-col gap-2 mt-2 pt-4 border-t-2 border-zinc-800">
                      <div className="flex items-center gap-2 text-zinc-300 text-sm font-bold">
                        <CalendarDays className="w-4 h-4" />
                        {formatDate(event.eventDate)}
                      </div>
                      <div className="flex items-center gap-2 text-zinc-300 text-sm font-bold">
                        <Users className="w-4 h-4" />
                        {isUnlimited 
                          ? `${event.currentTicketsSold} / ∞ Ingressos (Ilimitado)` 
                          : `${event.currentTicketsSold} / ${event.maxCapacity} Ingressos`
                        }
                      </div>
                    </div>

                    {/* Student Ticket Action */}
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
                        onClick={() => handleBookTicketClick(event)}
                        disabled={(!isUnlimited && event.currentTicketsSold >= event.maxCapacity) || bookingEventId === event.id}
                        className={`border-4 border-zinc-950 font-bold uppercase py-2 px-4 transition-all mt-2 w-full text-sm flex items-center justify-center gap-2 ${
                          !isUnlimited && event.currentTicketsSold >= event.maxCapacity 
                            ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' 
                            : 'bg-zinc-50 text-zinc-950 hover:bg-yellow-400 hover:shadow-neo active:translate-y-1 active:translate-x-1 active:shadow-none'
                        }`}
                      >
                        <Tag className="w-4 h-4" />
                        {bookingEventId === event.id 
                          ? 'Emitindo...' 
                          : (!isUnlimited && event.currentTicketsSold >= event.maxCapacity)
                            ? 'Esgotado' 
                            : event.requiresAttachment || event.isPaid 
                              ? 'Candidatar-se (Anexo / Pago)'
                              : 'Garantir Ingresso'
                        }
                      </button>
                    )}

                    {/* Admin Tools: Manage Candidates, Edit & TV Mode */}
                    {userRole !== 'STUDENT' && (
                      <div className="flex gap-2 border-t-2 border-zinc-800 pt-3 mt-1 flex-wrap">
                        <button
                          onClick={() => handleOpenEditModal(event)}
                          className="bg-zinc-800 text-yellow-400 border-2 border-yellow-400 font-bold uppercase py-1.5 px-2 hover:bg-yellow-400 hover:text-zinc-950 transition-all text-[11px] flex items-center justify-center gap-1"
                          title="Editar Informações do Evento"
                        >
                          <Edit className="w-3.5 h-3.5" /> Editar
                        </button>

                        <button
                          onClick={() => setAdminCandidateEvent(event)}
                          className="flex-1 bg-zinc-800 text-zinc-50 border-2 border-zinc-50 font-bold uppercase py-1.5 px-2 hover:bg-zinc-700 transition-all text-[11px] flex items-center justify-center gap-1"
                          title="Gerenciar Candidatos e Presenças"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-yellow-400" /> Candidatos
                        </button>

                        {event.requiresAttachment && (
                          <button
                            onClick={() => setTvEvent(event)}
                            className="bg-yellow-400 text-zinc-950 border-2 border-zinc-950 font-bold uppercase py-1.5 px-2 hover:bg-yellow-300 transition-all text-[11px] flex items-center justify-center gap-1"
                            title="Modo TV / Datashow HDMI"
                          >
                            <Tv className="w-3.5 h-3.5" /> Modo TV
                          </button>
                        )}
                      </div>
                    )}
                  </div>
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

      {/* Modals */}
      <CreateEventModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEventToEdit(null); }} 
        onSuccess={fetchData}
        eventToEdit={eventToEdit}
      />

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        ticket={ticketData}
      />

      <CandidateRegistrationModal
        isOpen={!!candidateRegEvent}
        onClose={() => setCandidateRegEvent(null)}
        event={candidateRegEvent}
        onSuccess={fetchData}
      />

      <ManageCandidatesModal
        isOpen={!!adminCandidateEvent}
        onClose={() => setAdminCandidateEvent(null)}
        event={adminCandidateEvent}
      />

      <TvPresentationModal
        isOpen={!!tvEvent}
        onClose={() => setTvEvent(null)}
        event={tvEvent}
      />
    </div>
  );
}
