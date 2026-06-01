import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ScanLine, CheckCircle2, XCircle, Camera, Keyboard } from 'lucide-react';
import { api } from '../services/api';
import { Scanner as QrScanner } from '@yudiel/react-qr-scanner';

export function Scanner() {
  const navigate = useNavigate();
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [qrCodeHash, setQrCodeHash] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Keep focus on input for fast scanning in manual mode
    if (status === 'idle' && scanMode === 'manual') {
      inputRef.current?.focus();
    }
  }, [status, scanMode]);

  const submitHash = async (hash: string) => {
    if (!hash.trim()) return;

    setStatus('loading');

    try {
      await api.post(`/tickets/scan/${hash.trim()}`);
      setStatus('success');
      
      setTimeout(() => {
        setQrCodeHash('');
        setStatus('idle');
      }, 2000);
      
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'BARRADO: Ingresso Falso ou Já Utilizado';
      setErrorMessage(msg);
      setStatus('error');
      
      setTimeout(() => {
        setQrCodeHash('');
        setStatus('idle');
      }, 2000);
    }
  };

  const handleManualScan = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitHash(qrCodeHash);
  };

  const handleCameraScan = (detectedCodes: { rawValue: string }[]) => {
    if (detectedCodes.length > 0 && status === 'idle') {
      const hash = detectedCodes[0].rawValue;
      setQrCodeHash(hash);
      submitHash(hash);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative">
      <header className="flex justify-between items-center p-6 bg-zinc-900 border-b-4 border-zinc-50 shadow-neo z-10">
        <div className="flex items-center gap-3">
          <ScanLine className="w-8 h-8 text-zinc-50" />
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-zinc-50">Catraca VIP</h1>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 bg-zinc-50 text-zinc-950 border-4 border-zinc-950 font-bold uppercase py-2 px-4 hover:shadow-neo transition-all active:translate-y-1 active:translate-x-1 active:shadow-none"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center p-6 gap-6 relative overflow-hidden">
        
        {/* Toggle Mode Button */}
        <button
          onClick={() => setScanMode(scanMode === 'camera' ? 'manual' : 'camera')}
          className="bg-zinc-800 text-zinc-50 border-4 border-zinc-50 font-bold uppercase py-3 px-6 hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 z-10 shadow-neo active:translate-y-1 active:translate-x-1 active:shadow-none w-full max-w-3xl"
        >
          {scanMode === 'camera' ? (
            <>
              <Keyboard className="w-5 h-5" />
              Alternar para Digitação Manual
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              Alternar para Câmera
            </>
          )}
        </button>
        {/* Feedback Massivo Ocupando a Área Central */}
        {status === 'success' && (
          <div className="absolute inset-0 z-20 bg-green-500 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200">
            <CheckCircle2 className="w-48 h-48 text-zinc-950 mb-8" />
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-zinc-950 text-center px-4 leading-none border-y-8 border-zinc-950 py-4 shadow-[16px_16px_0px_0px_rgba(0,0,0,0.5)] bg-green-400">
              Acesso<br/>Liberado
            </h2>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 z-20 bg-red-500 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200">
            <XCircle className="w-48 h-48 text-zinc-950 mb-8" />
            <div className="bg-red-600 border-y-8 border-zinc-950 py-8 px-4 w-full shadow-[16px_16px_0px_0px_rgba(0,0,0,0.5)]">
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-zinc-950 text-center leading-none mb-4">
                Barrado
              </h2>
              <p className="text-2xl font-bold uppercase text-zinc-950 text-center max-w-2xl mx-auto">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* Scanner Área */}
        <div className="w-full max-w-3xl flex-1 flex flex-col justify-center items-center gap-6 z-10">
          {scanMode === 'manual' ? (
            <form onSubmit={handleManualScan} className="w-full flex flex-col gap-6">
              <label className="text-zinc-50 font-bold uppercase tracking-widest text-xl text-center">
                Aguardando Leitura...
              </label>
              <input
                ref={inputRef}
                type="text"
                value={qrCodeHash}
                onChange={(e) => setQrCodeHash(e.target.value)}
                disabled={status !== 'idle'}
                placeholder="COLE OU ESCANEIE O HASH AQUI"
                className="w-full bg-zinc-900 border-8 border-zinc-50 text-zinc-50 p-8 md:p-12 text-3xl md:text-5xl font-mono font-black text-center outline-none focus:shadow-[16px_16px_0px_0px_rgba(255,255,255,0.9)] transition-all placeholder:text-zinc-700 disabled:opacity-50"
                autoFocus
              />
              <button
                type="submit"
                disabled={status !== 'idle' || !qrCodeHash.trim()}
                className="w-full bg-zinc-50 text-zinc-950 border-8 border-zinc-950 font-black uppercase py-8 md:py-10 text-3xl md:text-5xl hover:bg-yellow-400 transition-colors shadow-[12px_12px_0px_0px_rgba(255,255,255,0.9)] active:translate-y-2 active:translate-x-2 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Verificando...' : 'Validar Ingresso'}
              </button>
            </form>
          ) : (
            <div className="w-full max-w-2xl border-8 border-zinc-50 shadow-[16px_16px_0px_0px_rgba(255,255,255,0.9)] bg-zinc-900 aspect-square flex flex-col justify-center items-center p-2 relative overflow-hidden">
              <label className="text-zinc-50 font-bold uppercase tracking-widest text-lg text-center absolute top-4 z-20 bg-zinc-950/80 px-4 py-2 border-2 border-zinc-50">
                Aponte o Ingresso para a Câmera
              </label>
              <div className="w-full h-full relative">
                <QrScanner
                  onScan={handleCameraScan}
                  paused={status !== 'idle'}
                  onError={(error) => {
                    console.log('Erro de câmera', error);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
