import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, ChevronLeft, ChevronRight, Maximize, Minimize, Settings, Tv, Quote } from 'lucide-react';
import { api } from '../services/api';
import type { EventData } from '../pages/Dashboard';
import type { AttachmentItem } from './CandidateAttachmentViewer';

interface SlideItem {
  attachmentId: string;
  candidateName: string;
  candidateRegistration: string;
  requirementLabel: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  description?: string;
}

interface TvPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData | null;
}

export function TvPresentationModal({ isOpen, onClose, event }: TvPresentationModalProps) {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [slideDuration, setSlideDuration] = useState(5); // seconds
  const [showCandidateInfo, setShowCandidateInfo] = useState(true);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && event) {
      fetchEventAttachments();
    }
  }, [isOpen, event]);

  const fetchEventAttachments = async () => {
    if (!event) return;
    try {
      const res = await api.get(`/tickets/event/${event.id}`);
      const tickets: any[] = res.data;

      const extractedSlides: SlideItem[] = [];
      tickets.forEach(t => {
        if (t.attachments && t.attachments.length > 0) {
          t.attachments.forEach((att: AttachmentItem) => {
            extractedSlides.push({
              attachmentId: att.id,
              candidateName: t.userName,
              candidateRegistration: t.userRegistrationNumber,
              requirementLabel: att.requirementLabel,
              fileName: att.fileName,
              filePath: att.filePath,
              mimeType: att.mimeType,
              description: att.description
            });
          });
        }
      });

      setSlides(extractedSlides);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Failed to load slides for TV presentation", err);
    }
  };

  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, slideDuration * 1000);

    return () => clearInterval(timer);
  }, [isPlaying, slideDuration, slides.length]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.error(err));
      setIsFullscreen(false);
    }
  };

  if (!isOpen || !event) return null;

  const currentSlide = slides[currentIndex];

  const getFullUrl = (filePath: string) => {
    if (filePath.startsWith('http')) return filePath;
    return `http://${window.location.hostname}:8080${filePath}`;
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Header Bar */}
      <div className="bg-zinc-950/90 border-b-4 border-yellow-400 p-4 flex justify-between items-center z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Tv className="w-8 h-8 text-yellow-400 animate-pulse" />
          <div>
            <h1 className="text-xl font-bold uppercase text-zinc-50 tracking-tighter">
              TRANSMISSÃO TV / HDMI: <span className="text-yellow-400">{event.title}</span>
            </h1>
            <p className="text-zinc-400 text-xs font-bold uppercase">
              {slides.length > 0 ? `Slide ${currentIndex + 1} de ${slides.length}` : 'Aguardando anexos dos candidatos...'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-zinc-900 border-2 border-zinc-50 text-zinc-50 hover:text-yellow-400 font-bold uppercase text-xs flex items-center gap-1"
            title="Configurações do Slideshow"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-zinc-900 border-2 border-zinc-50 text-zinc-50 hover:text-yellow-400 font-bold uppercase text-xs flex items-center gap-1"
            title="Alternar Tela Cheia"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 bg-red-600 border-2 border-zinc-50 text-zinc-50 hover:bg-red-700 font-bold uppercase text-xs"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Settings Overlay Drawer */}
      {showSettings && (
        <div className="absolute top-20 right-4 bg-zinc-950 border-4 border-yellow-400 p-6 z-20 shadow-neo w-80 flex flex-col gap-4">
          <h3 className="text-lg font-bold uppercase text-yellow-400 border-b-2 border-yellow-400 pb-2">
            Ajustes da Transmissão
          </h3>

          <div className="flex flex-col gap-1">
            <label className="text-zinc-50 font-bold uppercase text-xs">Tempo por Slide (Segundos):</label>
            <select
              value={slideDuration}
              onChange={(e) => setSlideDuration(Number(e.target.value))}
              className="bg-zinc-900 border-2 border-zinc-50 text-zinc-50 p-2 text-xs font-bold outline-none uppercase"
            >
              <option value={3}>3 Segundos</option>
              <option value={5}>5 Segundos</option>
              <option value={10}>10 Segundos</option>
              <option value={15}>15 Segundos</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-zinc-50 font-bold uppercase text-xs">Ajuste de Tela:</label>
            <select
              value={fitMode}
              onChange={(e) => setFitMode(e.target.value as any)}
              className="bg-zinc-900 border-2 border-zinc-50 text-zinc-50 p-2 text-xs font-bold outline-none uppercase"
            >
              <option value="contain">Manter Proporção (Contain)</option>
              <option value="cover">Preencher Tela (Cover)</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-zinc-50 font-bold uppercase text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={showCandidateInfo}
              onChange={(e) => setShowCandidateInfo(e.target.checked)}
              className="w-4 h-4 accent-yellow-400 cursor-pointer"
            />
            Exibir Detalhes e Descrição na TV
          </label>
        </div>
      )}

      {/* Main Slide Viewer */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden p-4">
        {slides.length === 0 ? (
          <div className="text-center p-8 bg-zinc-900 border-4 border-zinc-50 shadow-neo max-w-md">
            <Tv className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold uppercase text-zinc-50">Nenhum Anexo Enviado</h2>
            <p className="text-zinc-400 text-xs font-medium uppercase mt-2">
              À medida que os candidatos enviarem fotos, vídeos e artes no cadastro, os slides aparecerão aqui automaticamente.
            </p>
          </div>
        ) : (
          <>
            {/* Media Content */}
            {currentSlide.mimeType?.startsWith('video/') || currentSlide.filePath.endsWith('.mp4') ? (
              <video
                src={getFullUrl(currentSlide.filePath)}
                autoPlay
                loop
                muted
                className={`w-full h-full max-h-[82vh] ${fitMode === 'contain' ? 'object-contain' : 'object-cover'}`}
              />
            ) : (
              <img
                src={getFullUrl(currentSlide.filePath)}
                alt={currentSlide.candidateName}
                className={`w-full h-full max-h-[82vh] ${fitMode === 'contain' ? 'object-contain' : 'object-cover'} transition-opacity duration-500`}
              />
            )}

            {/* Candidate Metadata & 500-Character Description Overlay */}
            {showCandidateInfo && (
              <div className="absolute bottom-6 left-6 bg-zinc-950/95 border-4 border-yellow-400 p-5 shadow-neo max-w-xl backdrop-blur-md z-10 flex flex-col gap-2">
                <span className="bg-yellow-400 text-zinc-950 font-bold uppercase text-[10px] px-2 py-0.5 self-start">
                  {currentSlide.requirementLabel}
                </span>

                <div>
                  <h2 className="text-2xl font-bold uppercase text-zinc-50 tracking-tighter leading-none">
                    {currentSlide.candidateName}
                  </h2>
                  <p className="text-zinc-400 font-mono text-xs mt-1">
                    MATRÍCULA: {currentSlide.candidateRegistration}
                  </p>
                </div>

                {/* 500-Character Description Display on TV */}
                {currentSlide.description && (
                  <div className="mt-1 pt-2 border-t-2 border-zinc-800 bg-zinc-900/90 p-3 border-l-4 border-l-yellow-400 flex gap-2">
                    <Quote className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-zinc-200 text-xs italic font-medium leading-relaxed max-h-32 overflow-y-auto">
                      "{currentSlide.description}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Navigation Bar */}
      {slides.length > 0 && (
        <div className="bg-zinc-950/90 border-t-4 border-zinc-50 p-4 flex justify-center items-center gap-6 z-10 backdrop-blur-md">
          <button
            onClick={() => setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length)}
            className="p-3 bg-zinc-900 border-2 border-zinc-50 text-zinc-50 hover:bg-yellow-400 hover:text-zinc-950 font-bold uppercase transition-all"
            title="Slide Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 bg-yellow-400 border-2 border-zinc-950 text-zinc-950 font-bold uppercase hover:bg-yellow-300 transition-all flex items-center gap-2 px-6"
          >
            {isPlaying ? (
              <>
                <Pause className="w-6 h-6" /> Pausar Slideshow
              </>
            ) : (
              <>
                <Play className="w-6 h-6" /> Iniciar Slideshow
              </>
            )}
          </button>

          <button
            onClick={() => setCurrentIndex(prev => (prev + 1) % slides.length)}
            className="p-3 bg-zinc-900 border-2 border-zinc-50 text-zinc-50 hover:bg-yellow-400 hover:text-zinc-950 font-bold uppercase transition-all"
            title="Próximo Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
