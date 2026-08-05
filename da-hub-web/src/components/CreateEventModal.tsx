import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Plus, Trash2, Image, Calendar, Clock, Upload, Sparkles, Link as LinkIcon } from 'lucide-react';
import { api } from '../services/api';
import type { EventData } from '../pages/Dashboard';

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
  eventToEdit?: EventData | null;
}

const STANDARD_CATEGORIES = ['EGAMES', 'SYMPOSIUM', 'CULTURE', 'PARTY'];

const PRESET_BANNERS = [
  { name: 'E-Games', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Simpósio / Palestra', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Artes & Cultura', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Festa Universitária', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80' },
];

export function CreateEventModal({ isOpen, onClose, onSuccess, eventToEdit }: CreateEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Category state
  const [categoryType, setCategoryType] = useState('EGAMES');
  const [customCategory, setCustomCategory] = useState('');
  
  // Capacity state
  const [isCapacityUnlimited, setIsCapacityUnlimited] = useState(false);
  const [maxCapacity, setMaxCapacity] = useState('100');
  
  // Max tickets per user state
  const [isTicketsPerUserUnlimited, setIsTicketsPerUserUnlimited] = useState(false);
  const [maxTicketsPerUser, setMaxTicketsPerUser] = useState('1');
  
  // Date & Time inputs
  const [eventDateOnly, setEventDateOnly] = useState('');
  const [eventTimeOnly, setEventTimeOnly] = useState('19:00');
  
  // Banner state
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerLoadError, setBannerLoadError] = useState(false);
  const [isConvertingWebP, setIsConvertingWebP] = useState(false);
  const [webpConversionSuccess, setWebpConversionSuccess] = useState(false);

  // Payment & Attachments
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('4,99');
  const [requiresAttachment, setRequiresAttachment] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentReq[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || '');
      setDescription(eventToEdit.description || '');
      setBannerUrl(eventToEdit.bannerUrl || '');
      setWebpConversionSuccess(false);
      
      // Category population
      if (STANDARD_CATEGORIES.includes(eventToEdit.category)) {
        setCategoryType(eventToEdit.category);
        setCustomCategory('');
      } else {
        setCategoryType('CUSTOM');
        setCustomCategory(eventToEdit.category || '');
      }

      // Capacity population
      if (!eventToEdit.maxCapacity || eventToEdit.maxCapacity >= 999999) {
        setIsCapacityUnlimited(true);
        setMaxCapacity('999999');
      } else {
        setIsCapacityUnlimited(false);
        setMaxCapacity(String(eventToEdit.maxCapacity));
      }

      // Max tickets per user population
      if (!eventToEdit.maxTicketsPerUser || eventToEdit.maxTicketsPerUser >= 999999) {
        setIsTicketsPerUserUnlimited(true);
        setMaxTicketsPerUser('999999');
      } else {
        setIsTicketsPerUserUnlimited(false);
        setMaxTicketsPerUser(String(eventToEdit.maxTicketsPerUser));
      }

      // Date & Time population
      if (eventToEdit.eventDate) {
        const parts = eventToEdit.eventDate.split('T');
        setEventDateOnly(parts[0] || '');
        setEventTimeOnly(parts[1] ? parts[1].substring(0, 5) : '19:00');
      } else {
        setEventDateOnly('');
        setEventTimeOnly('19:00');
      }

      // Paid population
      setIsPaid(!!eventToEdit.isPaid);
      setPrice(eventToEdit.price ? eventToEdit.price.toFixed(2).replace('.', ',') : '4,99');

      // Attachments population
      setRequiresAttachment(!!eventToEdit.requiresAttachment);
      if (eventToEdit.attachmentRequirementsJson) {
        try {
          setAttachments(JSON.parse(eventToEdit.attachmentRequirementsJson));
        } catch {
          setAttachments([]);
        }
      } else {
        setAttachments([]);
      }
    } else {
      // Default creation values
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const defaultDateStr = tomorrow.toISOString().split('T')[0];

      setTitle('');
      setDescription('');
      setCategoryType('EGAMES');
      setCustomCategory('');
      setIsCapacityUnlimited(false);
      setMaxCapacity('100');
      setIsTicketsPerUserUnlimited(false);
      setMaxTicketsPerUser('1');
      setEventDateOnly(defaultDateStr);
      setEventTimeOnly('19:00');
      setBannerUrl('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80');
      setWebpConversionSuccess(false);
      setIsPaid(false);
      setPrice('4,99');
      setRequiresAttachment(false);
      setAttachments([]);
    }
  }, [eventToEdit, isOpen]);

  useEffect(() => {
    setBannerLoadError(false);
  }, [bannerUrl]);

  if (!isOpen) return null;

  // Client-side WebP Image Converter using HTML Canvas
  const convertImageToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Não foi possível obter contexto do Canvas'));
            return;
          }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Falha na conversão para WebP'));
            },
            'image/webp',
            0.85 // 85% alta qualidade e compressão máxima
          );
        };
        img.onerror = () => reject(new Error('Erro ao carregar a imagem original'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  };

  const handleBannerFileUpload = async (file: File | null) => {
    if (!file) return;
    setError('');
    setIsConvertingWebP(true);
    setWebpConversionSuccess(false);

    try {
      // 1. Converte qualquer arquivo de imagem para .webp no navegador
      const webpBlob = await convertImageToWebP(file);
      const webpFile = new File([webpBlob], 'banner.webp', { type: 'image/webp' });

      // 2. Envia a imagem .webp convertida para o backend
      const formData = new FormData();
      formData.append('file', webpFile);

      const response = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      let uploadedUrl = response.data.url;
      if (uploadedUrl && !uploadedUrl.startsWith('http')) {
        uploadedUrl = `http://${window.location.hostname}:8080${uploadedUrl}`;
      }

      setBannerUrl(uploadedUrl);
      setWebpConversionSuccess(true);
    } catch (err: any) {
      console.error("Erro ao converter e enviar imagem para WebP", err);
      setError('Erro ao converter imagem para WebP. Certifique-se de escolher um arquivo de imagem válido.');
    } finally {
      setIsConvertingWebP(false);
    }
  };

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

  const handlePriceChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.,]/g, '');
    setPrice(cleaned);
  };

  const handlePriceBlur = () => {
    if (!price) return;
    const numeric = parseFloat(price.replace(',', '.'));
    if (!isNaN(numeric)) {
      setPrice(numeric.toFixed(2).replace('.', ','));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const finalCategory = categoryType === 'CUSTOM' ? customCategory.trim() : categoryType;
      if (!finalCategory) {
        throw new Error('Informe a categoria do evento.');
      }

      if (!eventDateOnly) {
        throw new Error('Selecione a data do evento.');
      }

      const finalTime = eventTimeOnly ? eventTimeOnly : '19:00';
      const formattedDate = `${eventDateOnly}T${finalTime}:00`;

      const parsedPrice = isPaid ? (parseFloat(price.replace(',', '.')) || 0) : 0;
      const finalCapacity = isCapacityUnlimited ? 999999 : parseInt(maxCapacity, 10);
      const finalMaxTickets = isTicketsPerUserUnlimited ? 999999 : parseInt(maxTicketsPerUser, 10);

      const payload = {
        title,
        description,
        category: finalCategory,
        eventDate: formattedDate,
        maxCapacity: finalCapacity,
        isPaid,
        price: parsedPrice,
        maxTicketsPerUser: finalMaxTickets,
        requiresAttachment,
        attachmentRequirementsJson: requiresAttachment ? JSON.stringify(attachments) : null,
        bannerUrl: bannerUrl.trim() || null
      };

      if (eventToEdit) {
        await api.put(`/events/${eventToEdit.id}`, payload);
        setSuccess('Evento atualizado com sucesso!');
      } else {
        await api.post('/events', payload);
        setSuccess('Evento criado com sucesso!');
      }
      
      setTimeout(() => {
        setSuccess('');
        onSuccess();
        onClose();
      }, 1200);

    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Acesso Negado: Apenas a Diretoria pode criar ou editar eventos.');
      } else {
        const msg = typeof err.response?.data === 'string' ? err.response.data : (err.response?.data?.message || err.message || 'Erro ao salvar evento.');
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
          className="absolute top-4 right-4 text-zinc-50 hover:text-red-500 transition-colors z-10"
        >
          <X className="w-8 h-8" />
        </button>

        <h2 className="text-2xl font-bold uppercase text-zinc-50 tracking-tighter mb-6 border-b-4 border-zinc-50 pb-2">
          {eventToEdit ? 'Editar Evento' : 'Criar Novo Evento Detalhado'}
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
          {/* Banner do Evento (Upload com Conversão WebP + URL da Imagem) */}
          <div className="border-4 border-zinc-800 p-4 bg-zinc-900 flex flex-col gap-4">
            <label className="text-zinc-50 font-bold uppercase text-sm flex items-center gap-2 border-b-2 border-zinc-800 pb-2">
              <Image className="w-5 h-5 text-yellow-400" />
              Banner / Foto de Capa do Evento
            </label>

            {/* Opção 1: Upload de Arquivo Próprio (Com conversão WebP automática) */}
            <div className="bg-zinc-950 border-2 border-yellow-400 p-3.5 flex flex-col gap-2 shadow-neo">
              <label className="text-yellow-400 font-bold uppercase text-xs flex items-center gap-1.5">
                <Upload className="w-4 h-4" />
                Opção 1: Anexar Seu Próprio Arquivo (Converte para WebP ⚡)
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleBannerFileUpload(e.target.files?.[0] || null)}
                disabled={isConvertingWebP}
                className="bg-zinc-900 border-2 border-zinc-50 text-zinc-300 p-2 text-xs font-medium cursor-pointer file:mr-4 file:py-1.5 file:px-3 file:border-2 file:border-zinc-50 file:bg-yellow-400 file:text-zinc-950 file:font-bold file:uppercase hover:file:bg-yellow-300"
              />

              {isConvertingWebP && (
                <div className="bg-yellow-400 text-zinc-950 p-2 font-bold uppercase text-xs flex items-center gap-2 animate-pulse border-2 border-zinc-950">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  ⚡ Convertendo imagem para formato super leve (.WebP) e salvando...
                </div>
              )}

              {webpConversionSuccess && (
                <div className="bg-green-500 text-zinc-950 p-2 font-bold uppercase text-xs flex items-center gap-1 border-2 border-zinc-950">
                  <CheckCircle className="w-4 h-4" />
                  ✓ Sucesso! Imagem convertida para formato otimizado (.WebP) e anexada ao evento!
                </div>
              )}
            </div>

            {/* Opção 2: URL de Imagem da Web ou Sugestões */}
            <div className="flex flex-col gap-2 pt-1">
              <label className="text-zinc-300 font-bold uppercase text-xs flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-zinc-400" />
                Opção 2: Ou Cole o Link (URL) / Escolha uma Capa Pronta:
              </label>

              <input
                type="text"
                value={bannerUrl}
                onChange={(e) => { setBannerUrl(e.target.value); setWebpConversionSuccess(false); }}
                placeholder="https://exemplo.com/minha-foto-banner.jpg"
                className="bg-zinc-950 border-4 border-zinc-50 text-zinc-50 p-3 outline-none focus:border-yellow-400 font-mono text-xs"
              />

              {/* Sugestões Rápidas */}
              <div className="flex flex-wrap gap-2 items-center mt-1">
                <span className="text-zinc-400 text-[11px] font-bold uppercase">Sugestões Rápidas:</span>
                {PRESET_BANNERS.map((preset) => (
                  <button
                    type="button"
                    key={preset.name}
                    onClick={() => { setBannerUrl(preset.url); setWebpConversionSuccess(false); }}
                    className="bg-zinc-800 text-zinc-300 border border-zinc-500 text-[10px] font-bold px-2 py-1 hover:bg-yellow-400 hover:text-zinc-950 transition-colors uppercase"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Pré-visualização da Capa Selecionada */}
            {bannerUrl && !bannerLoadError && (
              <div className="border-2 border-zinc-50 mt-1 relative overflow-hidden h-36 bg-zinc-950">
                <img 
                  src={bannerUrl} 
                  alt="Pré-visualização do Banner" 
                  className="w-full h-full object-cover"
                  onError={() => setBannerLoadError(true)}
                />
                <span className="absolute bottom-2 right-2 bg-zinc-950 text-yellow-400 text-[10px] font-bold px-2 py-0.5 border border-yellow-400 uppercase">
                  Pré-visualização da Capa
                </span>
              </div>
            )}
          </div>

          {/* Título */}
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

          {/* Descrição */}
          <div className="flex flex-col gap-1">
            <label className="text-zinc-50 font-bold uppercase text-sm">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-zinc-900 border-4 border-zinc-50 text-zinc-50 p-3 outline-none focus:shadow-neo transition-all font-medium min-h-[90px] resize-none"
              required
            />
          </div>

          {/* Categoria com opção de Personalizada */}
          <div className="flex flex-col gap-1 border-4 border-zinc-800 p-4 bg-zinc-900">
            <label className="text-zinc-50 font-bold uppercase text-sm">Categoria do Evento</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value)}
                className="bg-zinc-950 border-4 border-zinc-50 text-zinc-50 p-3 outline-none focus:shadow-neo transition-all font-bold uppercase"
                required
              >
                <option value="EGAMES">E-Games</option>
                <option value="SYMPOSIUM">Simpósio</option>
                <option value="CULTURE">Cultura</option>
                <option value="PARTY">Festa</option>
                <option value="CUSTOM">✏️ Outra / Personalizada</option>
              </select>

              {categoryType === 'CUSTOM' && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Digite sua categoria personalizada..."
                  className="bg-zinc-950 border-4 border-yellow-400 text-yellow-400 p-3 outline-none focus:shadow-neo transition-all font-bold uppercase"
                  required
                />
              )}
            </div>
          </div>

          {/* Data e Hora com Auto-Completar de 100% de Garantia */}
          <div className="border-4 border-zinc-800 p-4 bg-zinc-900 flex flex-col gap-2">
            <label className="text-zinc-50 font-bold uppercase text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow-400" />
                Data e Horário do Evento
              </span>
              <span className="text-yellow-400 text-xs font-bold">
                ✓ Horário auto-completado em 19:00
              </span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-zinc-400 text-xs font-bold uppercase flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Dia do Evento
                </label>
                <input
                  type="date"
                  value={eventDateOnly}
                  onChange={(e) => setEventDateOnly(e.target.value)}
                  className="bg-zinc-950 border-4 border-zinc-50 text-zinc-50 p-2.5 outline-none font-bold uppercase [color-scheme:dark]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-zinc-400 text-xs font-bold uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Horário (Padrão: 19:00)
                </label>
                <input
                  type="time"
                  value={eventTimeOnly}
                  onChange={(e) => setEventTimeOnly(e.target.value)}
                  className="bg-zinc-950 border-4 border-zinc-50 text-zinc-50 p-2.5 outline-none font-bold [color-scheme:dark]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Capacidade (Limite ou Infinito) & Máx Ingressos/Aluno */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Capacidade */}
            <div className="border-4 border-zinc-800 p-4 bg-zinc-900 flex flex-col gap-2">
              <label className="text-zinc-50 font-bold uppercase text-sm">Capacidade Total</label>
              
              <div className="flex gap-2 mb-1">
                <button
                  type="button"
                  onClick={() => setIsCapacityUnlimited(false)}
                  className={`flex-1 py-1.5 px-2 font-bold uppercase text-xs border-2 transition-all ${
                    !isCapacityUnlimited 
                      ? 'bg-yellow-400 text-zinc-950 border-zinc-950 shadow-neo' 
                      : 'bg-zinc-950 text-zinc-400 border-zinc-700'
                  }`}
                >
                  Com Limite
                </button>
                <button
                  type="button"
                  onClick={() => setIsCapacityUnlimited(true)}
                  className={`flex-1 py-1.5 px-2 font-bold uppercase text-xs border-2 transition-all ${
                    isCapacityUnlimited 
                      ? 'bg-yellow-400 text-zinc-950 border-zinc-950 shadow-neo' 
                      : 'bg-zinc-950 text-zinc-400 border-zinc-700'
                  }`}
                >
                  Sem Limite (∞)
                </button>
              </div>

              {!isCapacityUnlimited ? (
                <input
                  type="number"
                  min="1"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(e.target.value)}
                  className="bg-zinc-950 border-4 border-zinc-50 text-zinc-50 p-2.5 outline-none font-bold"
                  placeholder="Ex: 100"
                  required={!isCapacityUnlimited}
                />
              ) : (
                <div className="bg-zinc-950 border-4 border-yellow-400 text-yellow-400 p-2.5 font-bold uppercase text-center text-sm">
                  Inscrições Ilimitadas (∞)
                </div>
              )}
            </div>

            {/* Máx Ingressos por Aluno */}
            <div className="border-4 border-zinc-800 p-4 bg-zinc-900 flex flex-col gap-2">
              <label className="text-zinc-50 font-bold uppercase text-sm">Ingressos por Aluno</label>
              
              <div className="flex gap-2 mb-1">
                <button
                  type="button"
                  onClick={() => setIsTicketsPerUserUnlimited(false)}
                  className={`flex-1 py-1.5 px-2 font-bold uppercase text-xs border-2 transition-all ${
                    !isTicketsPerUserUnlimited 
                      ? 'bg-yellow-400 text-zinc-950 border-zinc-950 shadow-neo' 
                      : 'bg-zinc-950 text-zinc-400 border-zinc-700'
                  }`}
                >
                  Com Limite
                </button>
                <button
                  type="button"
                  onClick={() => setIsTicketsPerUserUnlimited(true)}
                  className={`flex-1 py-1.5 px-2 font-bold uppercase text-xs border-2 transition-all ${
                    isTicketsPerUserUnlimited 
                      ? 'bg-yellow-400 text-zinc-950 border-zinc-950 shadow-neo'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-700'
                  }`}
                >
                  Sem Limite (∞)
                </button>
              </div>

              {!isTicketsPerUserUnlimited ? (
                <input
                  type="number"
                  min="1"
                  value={maxTicketsPerUser}
                  onChange={(e) => setMaxTicketsPerUser(e.target.value)}
                  className="bg-zinc-950 border-4 border-zinc-50 text-zinc-50 p-2.5 outline-none font-bold"
                  placeholder="Ex: 1"
                  required={!isTicketsPerUserUnlimited}
                />
              ) : (
                <div className="bg-zinc-950 border-4 border-yellow-400 text-yellow-400 p-2.5 font-bold uppercase text-center text-sm">
                  Sem Limite por Aluno (∞)
                </div>
              )}
            </div>
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
                  type="text"
                  value={price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  onBlur={handlePriceBlur}
                  placeholder="Ex: 4,99"
                  className="bg-zinc-950 border-4 border-yellow-400 text-yellow-400 p-3 outline-none focus:shadow-neo transition-all font-bold text-lg"
                  required={isPaid}
                />
                <span className="text-zinc-400 text-[11px] font-medium">
                  Formatação automática de moeda (aceita vírgula ou ponto)
                </span>
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
            disabled={isLoading || isConvertingWebP || !!success}
            className="bg-zinc-50 text-zinc-950 border-4 border-zinc-950 font-bold uppercase py-4 px-6 hover:shadow-neo transition-all mt-2 w-full active:translate-y-1 active:translate-x-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isLoading ? 'Salvando Evento...' : isConvertingWebP ? 'Otimizando Imagem...' : eventToEdit ? 'Salvar Alterações do Evento' : 'Criar Evento Completo'}
          </button>
        </form>
      </div>
    </div>
  );
}
