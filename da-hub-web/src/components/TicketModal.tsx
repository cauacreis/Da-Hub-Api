import { QrCode } from 'lucide-react';

interface TicketData {
  eventTitle: string;
  userName: string;
  userEmail: string;
  userRegistrationNumber: string;
  qrCodeHash: string;
  status: string;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: TicketData | null;
}

export function TicketModal({ isOpen, onClose, ticket }: TicketModalProps) {
  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-zinc-100 border-8 border-zinc-950 p-8 w-full max-w-md shadow-neo relative">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-zinc-950 mb-2 border-b-8 border-zinc-950 pb-4 text-center">
          Ingresso Digital
        </h2>

        <div className="flex flex-col gap-6 mt-6 text-zinc-950">
          <div>
            <p className="text-xs font-bold uppercase text-zinc-500 mb-1">Evento</p>
            <p className="text-xl font-black uppercase leading-tight line-clamp-2">
              {ticket.eventTitle}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase text-zinc-500 mb-1">Participante</p>
            <p className="text-lg font-bold uppercase truncate">{ticket.userName}</p>
            <div className="flex gap-4 mt-1">
              <p className="text-sm font-bold text-zinc-600 bg-zinc-200 px-2 py-0.5 border-2 border-zinc-950">
                {ticket.userRegistrationNumber}
              </p>
              <p className="text-sm font-bold text-zinc-600 truncate">
                {ticket.userEmail}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-end border-t-4 border-dashed border-zinc-400 pt-6 mt-2">
            <div>
              <p className="text-xs font-bold uppercase text-zinc-500 mb-1">Status</p>
              <div className="bg-zinc-950 text-zinc-50 font-black uppercase px-4 py-1 inline-block">
                {ticket.status}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <QrCode className="w-16 h-16 text-zinc-950" />
            </div>
          </div>

          <div className="bg-zinc-200 p-4 border-4 border-zinc-950 mt-2 text-center">
            <p className="text-[10px] font-bold uppercase text-zinc-600 mb-1 tracking-widest">Código Hash</p>
            <p className="font-mono text-sm font-bold text-zinc-950 break-all select-all">
              {ticket.qrCodeHash}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-8 bg-zinc-950 text-zinc-50 border-4 border-zinc-950 font-black uppercase py-4 hover:bg-zinc-800 transition-colors active:translate-y-1 active:translate-x-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
        >
          Fechar e Salvar
        </button>
      </div>
    </div>
  );
}
