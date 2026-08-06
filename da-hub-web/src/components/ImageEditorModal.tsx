import React, { useState, useEffect, useRef } from 'react';
import { X, RotateCw, ZoomIn, ZoomOut, FlipHorizontal, Sliders, Crop, Sparkles, Check, RefreshCw } from 'lucide-react';

interface ImageEditorModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onSave: (editedBlob: Blob) => void;
}

type AspectRatio = '16:9' | '21:9' | '4:3' | '1:1' | 'FREE';

interface FilterPreset {
  name: string;
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  sepia: number;
  invert: number;
}

const PRESETS: FilterPreset[] = [
  { name: 'Original', brightness: 100, contrast: 100, saturation: 100, hue: 0, sepia: 0, invert: 0 },
  { name: 'Preto & Branco', brightness: 100, contrast: 130, saturation: 0, hue: 0, sepia: 0, invert: 0 },
  { name: 'Neo Vibrante', brightness: 110, contrast: 120, saturation: 170, hue: 0, sepia: 0, invert: 0 },
  { name: 'Cyberpunk', brightness: 105, contrast: 140, saturation: 180, hue: 290, sepia: 0, invert: 0 },
  { name: 'Vintage', brightness: 95, contrast: 90, saturation: 80, hue: 0, sepia: 50, invert: 0 },
  { name: 'Alto Contraste', brightness: 110, contrast: 170, saturation: 120, hue: 0, sepia: 0, invert: 0 },
  { name: 'Invertido', brightness: 100, contrast: 100, saturation: 100, hue: 0, sepia: 0, invert: 100 },
];

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'CROP' | 'FILTERS'>('CROP');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  
  // Transformações
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);

  // Filtros
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [hue, setHue] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);
  const [invert, setInvert] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);

  // Carrega a imagem original
  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setLoadedImage(img);
        resetAll();
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  // Reseta transformações e filtros
  const resetAll = () => {
    setZoom(100);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setPanX(0);
    setPanY(0);
    applyPreset(PRESETS[0]);
  };

  const applyPreset = (preset: FilterPreset) => {
    setBrightness(preset.brightness);
    setContrast(preset.contrast);
    setSaturation(preset.saturation);
    setHue(preset.hue);
    setSepia(preset.sepia);
    setInvert(preset.invert);
  };

  // Renderiza no canvas quando qualquer parâmetro muda
  useEffect(() => {
    if (!loadedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calcula dimensões do Canvas baseadas na proporção escolhida
    let targetWidth = 1280;
    let targetHeight = 720; // Padrão 16:9

    if (aspectRatio === '21:9') {
      targetWidth = 1260;
      targetHeight = 540;
    } else if (aspectRatio === '4:3') {
      targetWidth = 960;
      targetHeight = 720;
    } else if (aspectRatio === '1:1') {
      targetWidth = 800;
      targetHeight = 800;
    } else if (aspectRatio === 'FREE') {
      targetWidth = loadedImage.width;
      targetHeight = loadedImage.height;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Limpa canvas
    ctx.clearRect(0, 0, targetWidth, targetHeight);

    // Salva estado do contexto para transformações
    ctx.save();

    // Aplica Filtros via CSS filter no Canvas 2D
    const filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) sepia(${sepia}%) invert(${invert}%)`;
    ctx.filter = filterString;

    // Move origem para o centro do canvas para rotação e zoom
    ctx.translate(targetWidth / 2 + panX, targetHeight / 2 + panY);

    // Aplica Rotação
    ctx.rotate((rotation * Math.PI) / 180);

    // Aplica Flips
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Aplica Zoom
    const scaleFactor = zoom / 100;
    
    // Desenha imagem centralizada com escala
    const imgAspect = loadedImage.width / loadedImage.height;
    const targetAspect = targetWidth / targetHeight;

    let drawW = targetWidth;
    let drawH = targetHeight;

    if (imgAspect > targetAspect) {
      drawH = targetHeight;
      drawW = targetHeight * imgAspect;
    } else {
      drawW = targetWidth;
      drawH = targetWidth / imgAspect;
    }

    drawW *= scaleFactor;
    drawH *= scaleFactor;

    ctx.drawImage(loadedImage, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();
  }, [
    loadedImage,
    aspectRatio,
    zoom,
    rotation,
    flipH,
    flipV,
    panX,
    panY,
    brightness,
    contrast,
    saturation,
    hue,
    sepia,
    invert,
  ]);

  const handleSave = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          onSave(blob);
          onClose();
        }
      },
      'image/webp',
      0.85
    );
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[60] backdrop-blur-md">
      <div className="bg-zinc-950 border-4 border-zinc-50 p-6 w-full max-w-4xl shadow-neo relative max-h-[95vh] overflow-y-auto flex flex-col gap-4">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b-4 border-zinc-50 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-yellow-400" />
            <h2 className="text-2xl font-bold uppercase text-zinc-50 tracking-tighter">
              Editor de Imagem & Banner
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 p-1 border-2 border-transparent hover:border-zinc-50 transition-all"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Área Central: Preview Canvas + Controles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lado Esquerdo: Canvas em Tempo Real */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center bg-zinc-900 border-4 border-zinc-800 p-4 rounded-none min-h-[320px] relative overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[420px] object-contain border-2 border-yellow-400 shadow-neo"
            />
            <div className="absolute bottom-2 left-2 bg-zinc-950/90 text-yellow-400 px-3 py-1 text-xs font-mono font-bold border border-yellow-400 uppercase">
              Proporção: {aspectRatio} | Zoom: {zoom}% | Rotação: {rotation}°
            </div>
          </div>

          {/* Lado Direito: Abas e Painel de Ajustes */}
          <div className="flex flex-col gap-4">
            {/* Navegação entre Abas */}
            <div className="flex border-2 border-zinc-50 bg-zinc-900">
              <button
                onClick={() => setActiveTab('CROP')}
                className={`flex-1 py-2 font-bold uppercase text-sm flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'CROP'
                    ? 'bg-yellow-400 text-zinc-950 font-black'
                    : 'text-zinc-400 hover:text-zinc-50'
                }`}
              >
                <Crop className="w-4 h-4" /> Corte & Zoom
              </button>
              <button
                onClick={() => setActiveTab('FILTERS')}
                className={`flex-1 py-2 font-bold uppercase text-sm flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'FILTERS'
                    ? 'bg-yellow-400 text-zinc-950 font-black'
                    : 'text-zinc-400 hover:text-zinc-50'
                }`}
              >
                <Sliders className="w-4 h-4" /> Filtros Visuais
              </button>
            </div>

            {/* ABA 1: CORTE, PROPORÇÃO E FERRAMENTAS */}
            {activeTab === 'CROP' && (
              <div className="flex flex-col gap-4 bg-zinc-900 border-2 border-zinc-800 p-4 text-zinc-50 text-sm">
                {/* Proporções */}
                <div>
                  <label className="font-bold uppercase text-xs text-yellow-400 block mb-2">
                    1. Formato / Proporção (Aspect Ratio):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['16:9', '21:9', '4:3', '1:1', 'FREE'] as AspectRatio[]).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`py-1.5 px-2 text-xs font-bold border-2 transition-all ${
                          aspectRatio === ratio
                            ? 'bg-yellow-400 text-zinc-950 border-zinc-950 shadow-neo font-black'
                            : 'bg-zinc-950 text-zinc-300 border-zinc-700 hover:border-zinc-400'
                        }`}
                      >
                        {ratio === 'FREE' ? 'Original' : ratio}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zoom */}
                <div>
                  <div className="flex justify-between items-center mb-1 font-bold text-xs">
                    <span className="text-yellow-400 uppercase">2. Zoom / Escala:</span>
                    <span>{zoom}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoom(Math.max(50, zoom - 10))}
                      className="p-1.5 bg-zinc-950 border border-zinc-700 hover:border-yellow-400"
                    >
                      <ZoomOut className="w-4 h-4 text-zinc-300" />
                    </button>
                    <input
                      type="range"
                      min="50"
                      max="250"
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full accent-yellow-400 cursor-pointer"
                    />
                    <button
                      onClick={() => setZoom(Math.min(250, zoom + 10))}
                      className="p-1.5 bg-zinc-950 border border-zinc-700 hover:border-yellow-400"
                    >
                      <ZoomIn className="w-4 h-4 text-zinc-300" />
                    </button>
                  </div>
                </div>

                {/* Rotação e Flips */}
                <div>
                  <label className="font-bold uppercase text-xs text-yellow-400 block mb-2">
                    3. Rotação & Espelhar:
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="py-1.5 px-2 bg-zinc-950 border border-zinc-700 hover:border-yellow-400 text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <RotateCw className="w-3.5 h-3.5" /> Girar +90°
                    </button>
                    <button
                      onClick={() => setFlipH(!flipH)}
                      className={`py-1.5 px-2 border text-xs font-bold flex items-center justify-center gap-1 ${
                        flipH
                          ? 'bg-yellow-400 text-zinc-950 border-zinc-950'
                          : 'bg-zinc-950 border-zinc-700 hover:border-yellow-400'
                      }`}
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" /> Espelhar H
                    </button>
                  </div>
                </div>

                {/* Posição Pan X e Y */}
                <div>
                  <div className="flex justify-between items-center mb-1 font-bold text-xs">
                    <span className="text-yellow-400 uppercase">4. Posição (Pan X / Y):</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Horizontal (X): {panX}px</span>
                      <input
                        type="range"
                        min="-300"
                        max="300"
                        value={panX}
                        onChange={(e) => setPanX(Number(e.target.value))}
                        className="w-full accent-yellow-400 cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Vertical (Y): {panY}px</span>
                      <input
                        type="range"
                        min="-300"
                        max="300"
                        value={panY}
                        onChange={(e) => setPanY(Number(e.target.value))}
                        className="w-full accent-yellow-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 2: FILTROS VISUAIS & EFEITOS */}
            {activeTab === 'FILTERS' && (
              <div className="flex flex-col gap-4 bg-zinc-900 border-2 border-zinc-800 p-4 text-zinc-50 text-sm max-h-[350px] overflow-y-auto">
                {/* Presets Prontos */}
                <div>
                  <label className="font-bold uppercase text-xs text-yellow-400 block mb-2">
                    Estilos Prontos (Presets):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => applyPreset(p)}
                        className="py-1.5 px-2 bg-zinc-950 border border-zinc-700 hover:border-yellow-400 text-xs font-bold text-left transition-all hover:bg-zinc-800"
                      >
                        ⚡ {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ajustes Manuais */}
                <div className="flex flex-col gap-3 pt-2 border-t border-zinc-800">
                  <label className="font-bold uppercase text-xs text-yellow-400">
                    Ajustes Manuais Finos:
                  </label>

                  {/* Brilho */}
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-bold">
                      <span>Brilho:</span>
                      <span>{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="180"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-yellow-400 cursor-pointer"
                    />
                  </div>

                  {/* Contraste */}
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-bold">
                      <span>Contraste:</span>
                      <span>{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-yellow-400 cursor-pointer"
                    />
                  </div>

                  {/* Saturação */}
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-bold">
                      <span>Saturação (Cores):</span>
                      <span>{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="250"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full accent-yellow-400 cursor-pointer"
                    />
                  </div>

                  {/* Hue Rotate */}
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-bold">
                      <span>Matiz / Tonalidade (Hue):</span>
                      <span>{hue}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={hue}
                      onChange={(e) => setHue(Number(e.target.value))}
                      className="w-full accent-yellow-400 cursor-pointer"
                    />
                  </div>

                  {/* Sépia */}
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-bold">
                      <span>Sépia / Envelhecido:</span>
                      <span>{sepia}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sepia}
                      onChange={(e) => setSepia(Number(e.target.value))}
                      className="w-full accent-yellow-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="flex items-center justify-between border-t-4 border-zinc-50 pt-4 mt-2">
          <button
            onClick={resetAll}
            className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-2 border-zinc-700 hover:border-zinc-50 font-bold uppercase text-sm flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Resetar Tudo
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-50 border-2 border-zinc-50 font-bold uppercase text-sm transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="py-2.5 px-6 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 border-4 border-zinc-950 font-black uppercase text-sm shadow-neo flex items-center gap-2 transition-all transform active:translate-x-1 active:translate-y-1"
            >
              <Check className="w-5 h-5 stroke-[3]" /> Aplicar e Salvar Capa (.WebP)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
