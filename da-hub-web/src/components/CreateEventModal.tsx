import { useState } from 'react';
import { X, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { api } from '../services/api';

interface AttachmentReq {
  id: string;
  label: string;
  allowedTypes: string;
  required: boolean;
}

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
  
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('0.00');
  const [maxTicketsPerUser, setMaxTicketsPerUser] = useState('1');
  const [requiresAttachment, setRequiresAttachment] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentReq[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleAddAttachment = () => {
    const newReq: AttachmentReq = {
      id: 'req_' + Date.now(),
      label: 'Comprovante de estudante / Arte da categoria',
      allowedTypes: 'ALL',
      required: true
    };
    setAttachments([...attachments, newReq]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const handleUpdateAttachment = (id: string, field: keyof AttachmentReq, value: any) => {
    setAttachments(attachments.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

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
        eventDate: eventDate + ':00',
        maxCapacity: parseInt(maxCapacity, 10),
        isPaid,
        price: isPaid ? parseFloat(price) : 0,
        maxTicketsPerUser: parseInt(maxTicketsPerUser, 10),
        requiresAttachment,
        attachmentRequirementsJson: requiresAttachment ? JSON.stringify(attachments) : null
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
        setIsPaid(false);
        setPrice('0.00');
        setMaxTicketsPerUser('1');
        setRequiresAttachment(false);
        setAttachments([]);
        onSuccess();
        onClose();
      }, 1500);

    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Acesso Negado: Apenas a Diretoria pode criar eventos.');
      } else {
        const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || 'Erro ao conectar com o servidor.');
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-zinc-950 border-4 border-zinc-50 p-6 w-full max-w-2xl shadow-neo relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-50 hover:text-red-500 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        <h2 className="text-2xl font-bold uppercase text-zinc-50 tracking-tighter mb-6 border-b-4 border-zinc-50 pb-2">
          Criar Novo Evento Detalhado
        </h2>

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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-zinc-50 font-bold uppercase text-sm">Título do Evento</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-900 border-4 border-zinc-50 text-zinc-50 p-3 outline-none focus:shadow-neo transition-all font-medium"
              placeholder="Ex: Torneio de Valorant / Mostra de Artes"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-zinc-50 font-bold uppercase text-sm">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-zinc-900 border-4 border-zinc-50 text-zinc-50 p-3 outline-none focus:shadow-neo transition-all font-medium min-h-[90px] resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <label className="text-zinc-50 font-bold uppercase text-sm">Capacidade</label>
              <input
                type="number"
                min="1"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                className="bg-zinc-900 border-4 border-zinc-50 text-zinc-50 p-3 outline-none focus:shadow-neo transition-all font-medium"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-zinc-50 font-bold uppercase text-sm">Máx Ingressos/Aluno</label>
              <input
                type="number"
                min="1"
                value={maxTicketsPerUser}
                onChange={(e) => setMaxTicketsPerUser(e.target.value)}
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

          {/* Configurações de Pagamento (Mercado Pago) */}
          <div className="border-4 border-zinc-800 p-4 bg-zinc-900 flex flex-col gap-3">
            <label className="flex items-center gap-3 text-zinc-50 font-bold uppercase text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                className="w-5 h-5 accent-yellow-400 cursor-pointer"
              />
              Este evento vai ser pago? (Integrado com Mercado Pago)
            </label>

            {isPaid && (
              <div className="flex flex-col gap-1 mt-1 pl-8">
                <label className="text-yellow-400 font-bold uppercase text-xs">Valor da Inscrição (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.50"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-zinc-950 border-4 border-yellow-400 text-yellow-400 p-3 outline-none focus:shadow-neo transition-all font-bold"
                  required={isPaid}
                />
              </div>
            )}
          </div>

          {/* Configurações de Anexo */}
          <div className="border-4 border-zinc-800 p-4 bg-zinc-900 flex flex-col gap-3">
            <label className="flex items-center gap-3 text-zinc-50 font-bold uppercase text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={requiresAttachment}
                onChange={(e) => setRequiresAttachment(e.target.checked)}
                className="w-5 h-5 accent-yellow-400 cursor-pointer"
              />
              Adicionar opção que carrega um anexo na candidatura?
            </label>

            {requiresAttachment && (
              <div className="flex flex-col gap-3 mt-2 pl-2">
                <p className="text-zinc-400 text-xs font-medium uppercase">
                  Configure quais comprovantes ou arquivos os candidatos devem enviar:
                </p>

                {attachments.map((req) => (
                  <div key={req.id} className="bg-zinc-950 border-2 border-zinc-50 p-3 flex flex-col md:flex-row gap-2 items-center">
                    <input
                      type="text"
                      value={req.label}
                      onChange={(e) => handleUpdateAttachment(req.id, 'label', e.target.value)}
                      placeholder="Ex: Comprovante de estudante ou Envio da arte"
                      className="bg-zinc-900 border-2 border-zinc-50 text-zinc-50 p-2 text-xs font-bold flex-1 outline-none w-full"
                    />
                    <select
                      value={req.allowedTypes}
                      onChange={(e) => handleUpdateAttachment(req.id, 'allowedTypes', e.target.value)}
                      className="bg-zinc-900 border-2 border-zinc-50 text-zinc-50 p-2 text-xs font-bold outline-none uppercase"
                    >
                      <option value="ALL">Qualquer Arquivo (Vídeo, Imagem, PDF)</option>
                      <option value="IMAGE">Apenas Imagens (JPG, PNG)</option>
                      <option value="VIDEO">Apenas Vídeo (MP4)</option>
                      <option value="PDF">Apenas Documento PDF</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(req.id)}
                      className="text-red-500 hover:text-red-400 p-2 border-2 border-red-500 font-bold"
                      title="Remover Requisito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddAttachment}
                  className="flex items-center justify-center gap-2 bg-zinc-800 text-zinc-50 border-2 border-zinc-50 py-2 px-4 text-xs font-bold uppercase hover:bg-zinc-700 transition-all self-start mt-1"
                >
                  <Plus className="w-4 h-4 text-yellow-400" />
                  + Adicionar Campo de Anexo
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !!success}
            className="bg-zinc-50 text-zinc-950 border-4 border-zinc-950 font-bold uppercase py-4 px-6 hover:shadow-neo transition-all mt-2 w-full active:translate-y-1 active:translate-x-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isLoading ? 'Implantando Evento...' : 'Criar Evento Completo'}
          </button>
        </form>
      </div>
    </div>
  );
}
