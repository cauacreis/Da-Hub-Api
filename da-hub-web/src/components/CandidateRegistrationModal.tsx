import { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle, QrCode, CreditCard } from 'lucide-react';
import { api } from '../services/api';
import { EventData, AttachmentRequirement } from '../pages/Dashboard';

interface CandidateRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData | null;
  onSuccess: () => void;
}

export function CandidateRegistrationModal({ isOpen, onClose, event, onSuccess }: CandidateRegistrationModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<{ [reqId: string]: File }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentData, setPaymentData] = useState<any>(null);

  if (!isOpen || !event) return null;

  let requirements: AttachmentRequirement[] = [];
  if (event.requiresAttachment && event.attachmentRequirementsJson) {
    try {
      requirements = JSON.parse(event.attachmentRequirementsJson);
    } catch (e) {
      console.error("Failed to parse requirements", e);
    }
  }

  const handleFileChange = (reqId: string, file: File | null) => {
    if (file) {
      // Basic client-size check: 15MB limit
      if (file.size > 15 * 1024 * 1024) {
        setError('O arquivo selecionado excede o limite máximo de 15MB.');
        return;
      }
      setError('');
      setSelectedFiles(prev => ({ ...prev, [reqId]: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Check required fields
      for (const req of requirements) {
        if (req.required && !selectedFiles[req.id]) {
          setError(`Por favor, envie o anexo obrigatório: "${req.label}"`);
          setIsLoading(false);
          return;
        }
      }

      const formData = new FormData();
      requirements.forEach(req => {
        const file = selectedFiles[req.id];
        if (file) {
          formData.append('files', file);
          formData.append('labels', req.label);
        }
      });

      const response = await api.post(`/tickets/book-with-attachments/${event.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const ticket = response.data;

      // If event is paid, generate Mercado Pago preference
      if (event.isPaid) {
        try {
          const prefRes = await api.post(`/payments/preference/${ticket.ticketId}`);
          setPaymentData(prefRes.data);
          setSuccess('Inscrição registrada! Realize o pagamento abaixo para validar seu ingresso.');
        } catch (pErr) {
          setSuccess('Inscrição criada com pagamento pendente.');
        }
      } else {
        setSuccess('Candidatura e ingresso garantidos com sucesso!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }

    } catch (err: any) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || 'Erro ao realizar candidatura.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulatePaymentApproval = async () => {
    if (!paymentData) return;
    setIsLoading(true);
    try {
      // Extract ticket ID or call approval endpoint
      await api.post(`/payments/${paymentData.ticketId || paymentData.paymentId}/approve`).catch(() => {});
      setSuccess('Pagamento aprovado via Mercado Pago!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (e) {
      setSuccess('Pagamento confirmado!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
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

        <h2 className="text-2xl font-bold uppercase text-zinc-50 tracking-tighter mb-2 border-b-4 border-zinc-50 pb-2">
          Candidatar-se: {event.title}
        </h2>

        {event.isPaid && (
          <div className="bg-yellow-400 text-zinc-950 p-3 font-bold uppercase text-sm border-2 border-zinc-950 mb-4 flex items-center justify-between">
            <span>Evento Pago: R$ {event.price?.toFixed(2)}</span>
            <span className="bg-zinc-950 text-yellow-400 px-2 py-0.5 text-xs">Mercado Pago</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500 text-zinc-50 border-4 border-red-700 p-4 font-bold uppercase text-sm flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-500 text-zinc-50 border-4 border-green-700 p-4 font-bold uppercase text-sm flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {!paymentData ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {requirements.length > 0 ? (
              <div className="flex flex-col gap-3">
                <p className="text-zinc-300 font-bold uppercase text-xs">
                  Envie os comprovantes / arquivos solicitados pela organização:
                </p>

                {requirements.map((req) => (
                  <div key={req.id} className="bg-zinc-900 border-2 border-zinc-50 p-4 flex flex-col gap-2">
                    <label className="text-zinc-50 font-bold uppercase text-sm flex items-center gap-2">
                      <Upload className="w-4 h-4 text-yellow-400" />
                      {req.label}
                      {req.required && <span className="text-red-500 text-xs">*Obrigatório</span>}
                    </label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(req.id, e.target.files?.[0] || null)}
                      className="bg-zinc-950 border-2 border-zinc-700 text-zinc-300 p-2 text-xs font-medium cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-2 file:border-zinc-50 file:bg-yellow-400 file:text-zinc-950 file:font-bold file:uppercase hover:file:bg-yellow-300"
                      required={req.required}
                    />
                    {selectedFiles[req.id] && (
                      <span className="text-green-400 text-xs font-bold">
                        ✓ Selecionado: {selectedFiles[req.id].name} ({(selectedFiles[req.id].size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-400 text-sm font-medium">
                Este evento não possui requisitos adicionais de anexos. Clique abaixo para confirmar sua candidatura.
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !!success}
              className="bg-yellow-400 text-zinc-950 border-4 border-zinc-950 font-bold uppercase py-3 px-6 hover:shadow-neo transition-all mt-4 w-full active:translate-y-1 active:translate-x-1 active:shadow-none disabled:opacity-50 text-base"
            >
              {isLoading ? 'Enviando Candidatura...' : event.isPaid ? 'Prosseguir para Pagamento (Mercado Pago)' : 'Finalizar Candidatura'}
            </button>
          </form>
        ) : (
          /* Mercado Pago Checkout Section */
          <div className="flex flex-col gap-4 bg-zinc-900 border-4 border-yellow-400 p-6">
            <h3 className="text-lg font-bold uppercase text-yellow-400 flex items-center gap-2">
              <CreditCard className="w-6 h-6" /> Pagamento Via Mercado Pago (PIX)
            </h3>
            
            <p className="text-zinc-300 text-xs font-medium uppercase">
              Escaneie o código PIX abaixo ou clique no link para concluir o pagamento de R$ {paymentData.amount?.toFixed(2)}:
            </p>

            <div className="bg-zinc-950 border-2 border-zinc-50 p-4 flex flex-col items-center gap-2">
              <QrCode className="w-32 h-32 text-yellow-400" />
              <span className="text-zinc-400 text-[10px] break-all font-mono text-center">
                {paymentData.qrCodePix}
              </span>
            </div>

            <a
              href={paymentData.initPoint}
              target="_blank"
              rel="noreferrer"
              className="bg-blue-500 text-zinc-50 border-2 border-zinc-50 font-bold uppercase py-2 px-4 text-xs text-center hover:bg-blue-600 transition-colors"
            >
              Abrir Checkout Oficial do Mercado Pago ↗
            </a>

            <button
              onClick={handleSimulatePaymentApproval}
              disabled={isLoading}
              className="bg-green-500 text-zinc-950 border-4 border-zinc-950 font-bold uppercase py-3 px-4 hover:shadow-neo transition-all text-xs"
            >
              [Simulação Sandbox] Confirmar Pagamento do PIX
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
