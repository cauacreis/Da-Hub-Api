import { useState, useEffect } from 'react';
import { X, Search, Download, Eye, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import type { EventData } from '../pages/Dashboard';
import { CandidateAttachmentViewer } from './CandidateAttachmentViewer';
import type { AttachmentItem } from './CandidateAttachmentViewer';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CandidateTicket {
  ticketId: string;
  eventId: string;
  eventTitle: string;
  userName: string;
  userRegistrationNumber: string;
  userEmail: string;
  qrCodeHash: string;
  status: 'PAID' | 'USED' | 'CANCELLED' | 'PENDING_PAYMENT';
  paymentId?: string;
  attachments?: AttachmentItem[];
}

interface ManageCandidatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData | null;
}

export function ManageCandidatesModal({ isOpen, onClose, event }: ManageCandidatesModalProps) {
  const [tickets, setTickets] = useState<CandidateTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Attachment Viewer modal state
  const [selectedCandidateName, setSelectedCandidateName] = useState('');
  const [selectedAttachments, setSelectedAttachments] = useState<AttachmentItem[]>([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    if (isOpen && event) {
      fetchTickets();
    }
  }, [isOpen, event]);

  const fetchTickets = async () => {
    if (!event) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get(`/tickets/event/${event.id}`);
      setTickets(res.data);
    } catch (err: any) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || 'Erro ao carregar lista de candidatos.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (ticketId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'USED' ? 'PAID' : 'USED';
    try {
      await api.put(`/tickets/${ticketId}/status?status=${nextStatus}`);
      fetchTickets();
    } catch (err: any) {
      setError('Erro ao atualizar presença.');
    }
  };

  const handleOpenViewer = (candidateName: string, attachments?: AttachmentItem[]) => {
    setSelectedCandidateName(candidateName);
    setSelectedAttachments(attachments || []);
    setIsViewerOpen(true);
  };

  // PDF Report Generator (jspdf + autotable)
  const handleExportPdfReport = () => {
    if (!event) return;

    const doc = new jsPDF();
    const now = new Date().toLocaleString('pt-BR');

    // Title & Header
    doc.setFillColor(24, 24, 27); // Zinc-900
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(250, 250, 250);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('DA HUB - RELATÓRIO OFICIAL DE CANDIDATOS', 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`EVENTO: ${event.title.toUpperCase()} | DATA EMISSÃO: ${now}`, 14, 30);

    // Summary Statistics
    const totalBooked = tickets.length;
    const totalPresent = tickets.filter(t => t.status === 'USED').length;
    const totalAbsent = tickets.filter(t => t.status === 'PAID' || t.status === 'PENDING_PAYMENT').length;

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`RESUMO DA CATRACA: Total Inscritos: ${totalBooked} | Lidos (Presentes): ${totalPresent} | Ausentes: ${totalAbsent}`, 14, 50);

    // Section 1: Present Candidates (USED)
    doc.setFontSize(14);
    doc.text('1. CANDIDATOS PRESENTES (QR Code Lido)', 14, 62);

    const presentData = tickets
      .filter(t => t.status === 'USED')
      .map(t => [t.userName, t.userRegistrationNumber, t.userEmail, 'PRESENTE (USED)']);

    autoTable(doc, {
      startY: 66,
      head: [['Nome Completo', 'Matrícula', 'E-mail', 'Status']],
      body: presentData.length > 0 ? presentData : [['Nenhum candidato leu o QR Code até o momento.', '-', '-', '-']],
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 9 }
    });

    // Section 2: Absent Candidates
    const lastY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(14);
    doc.text('2. CANDIDATOS AUSENTES / NÃO LIDOS', 14, lastY);

    const absentData = tickets
      .filter(t => t.status === 'PAID' || t.status === 'PENDING_PAYMENT')
      .map(t => [t.userName, t.userRegistrationNumber, t.userEmail, t.status]);

    autoTable(doc, {
      startY: lastY + 4,
      head: [['Nome Completo', 'Matrícula', 'E-mail', 'Status Inscrição']],
      body: absentData.length > 0 ? absentData : [['Nenhum ausente cadastrado.', '-', '-', '-']],
      headStyles: { fillColor: [239, 68, 68] },
      styles: { fontSize: 9 }
    });

    doc.save(`Relatorio_Presenca_${event.title.replace(/\s+/g, '_')}.pdf`);
  };

  if (!isOpen || !event) return null;

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.userRegistrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-zinc-950 border-4 border-zinc-50 p-6 w-full max-w-5xl shadow-neo relative max-h-[92vh] overflow-y-auto flex flex-col gap-4">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-50 hover:text-red-500 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-zinc-50 pb-4">
          <div>
            <h2 className="text-2xl font-bold uppercase text-zinc-50 tracking-tighter">
              Candidatos Inscritos: <span className="text-yellow-400">{event.title}</span>
            </h2>
            <p className="text-zinc-400 text-xs font-bold uppercase">
              Total: {tickets.length} | Presentes (USED): {tickets.filter(t => t.status === 'USED').length}
            </p>
          </div>

          <button
            onClick={handleExportPdfReport}
            className="flex items-center gap-2 bg-yellow-400 text-zinc-950 border-4 border-zinc-950 font-bold uppercase py-2 px-4 hover:shadow-neo transition-all active:translate-y-1 active:translate-x-1 active:shadow-none text-xs"
          >
            <Download className="w-4 h-4" /> Exportar Relatório PDF
          </button>
        </div>

        {error && (
          <div className="bg-red-500 text-zinc-50 border-4 border-red-700 p-4 font-bold uppercase text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 bg-zinc-900 border-2 border-zinc-50 p-2 w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por Nome, Matrícula ou E-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-zinc-50 text-xs font-bold outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-bold text-xs uppercase">Filtrar:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-900 border-2 border-zinc-50 text-zinc-50 p-2 text-xs font-bold outline-none uppercase"
            >
              <option value="ALL">Todos os Status</option>
              <option value="PAID">Pago / Confirmado</option>
              <option value="USED">Presente (USED)</option>
              <option value="PENDING_PAYMENT">Pagamento Pendente</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Candidates Table */}
        {isLoading ? (
          <p className="text-zinc-400 font-bold uppercase text-center p-8 animate-pulse">Carregando candidatos...</p>
        ) : filteredTickets.length === 0 ? (
          <p className="text-zinc-500 font-bold uppercase text-center p-8">Nenhum candidato encontrado.</p>
        ) : (
          <div className="overflow-x-auto border-2 border-zinc-50">
            <table className="w-full text-left text-xs font-medium text-zinc-50">
              <thead className="bg-zinc-900 uppercase font-bold border-b-2 border-zinc-50 text-yellow-400">
                <tr>
                  <th className="p-3">Candidato</th>
                  <th className="p-3">Matrícula</th>
                  <th className="p-3">E-mail</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Anexos</th>
                  <th className="p-3 text-center">Ações / Presença</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-zinc-950">
                {filteredTickets.map((t) => (
                  <tr key={t.ticketId} className="hover:bg-zinc-900 transition-colors">
                    <td className="p-3 font-bold uppercase text-zinc-50">{t.userName}</td>
                    <td className="p-3 font-mono text-zinc-300">{t.userRegistrationNumber}</td>
                    <td className="p-3 text-zinc-400">{t.userEmail}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 font-bold text-[10px] uppercase border ${
                        t.status === 'USED' ? 'bg-green-500 text-zinc-950 border-green-700' :
                        t.status === 'PAID' ? 'bg-yellow-400 text-zinc-950 border-zinc-950' :
                        t.status === 'PENDING_PAYMENT' ? 'bg-orange-500 text-zinc-50 border-orange-700' :
                        'bg-red-500 text-zinc-50 border-red-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {t.attachments && t.attachments.length > 0 ? (
                        <button
                          onClick={() => handleOpenViewer(t.userName, t.attachments)}
                          className="bg-zinc-800 text-yellow-400 border border-yellow-400 font-bold px-2 py-1 text-[10px] uppercase hover:bg-yellow-400 hover:text-zinc-950 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> Ver ({t.attachments.length})
                        </button>
                      ) : (
                        <span className="text-zinc-600 font-bold text-[10px]">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(t.ticketId, t.status)}
                        className={`font-bold px-3 py-1 text-[10px] uppercase border-2 transition-all active:translate-y-0.5 ${
                          t.status === 'USED'
                            ? 'bg-zinc-800 text-red-400 border-red-400 hover:bg-red-500 hover:text-zinc-50'
                            : 'bg-green-500 text-zinc-950 border-zinc-950 hover:bg-green-400'
                        }`}
                      >
                        {t.status === 'USED' ? 'Desfazer Presença' : 'Marcar Presença (USED)'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Attachment Viewer Modal */}
        <CandidateAttachmentViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          candidateName={selectedCandidateName}
          attachments={selectedAttachments}
        />
      </div>
    </div>
  );
}
