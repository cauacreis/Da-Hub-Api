import { X, FileText, Download } from 'lucide-react';

export interface AttachmentItem {
  id: string;
  requirementLabel: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize?: number;
}

interface CandidateAttachmentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  attachments: AttachmentItem[];
}

export function CandidateAttachmentViewer({ isOpen, onClose, candidateName, attachments }: CandidateAttachmentViewerProps) {
  if (!isOpen) return null;

  const getFullUrl = (filePath: string) => {
    if (filePath.startsWith('http')) return filePath;
    return `http://${window.location.hostname}:8080${filePath}`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-zinc-950 border-4 border-zinc-50 p-6 w-full max-w-3xl shadow-neo relative max-h-[90vh] overflow-y-auto flex flex-col gap-4">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-50 hover:text-red-500 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        <h2 className="text-xl font-bold uppercase text-zinc-50 tracking-tighter border-b-4 border-zinc-50 pb-2">
          Anexos Enviados por: <span className="text-yellow-400">{candidateName}</span>
        </h2>

        {attachments.length === 0 ? (
          <p className="text-zinc-400 font-bold uppercase text-sm p-4">Nenhum anexo encontrado para este candidato.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attachments.map((att) => {
              const fullUrl = getFullUrl(att.filePath);
              const isImage = att.mimeType?.startsWith('image/') || att.filePath.match(/\.(jpg|jpeg|png|webp)$/i);
              const isVideo = att.mimeType?.startsWith('video/') || att.filePath.endsWith('.mp4');
              const isAudio = att.mimeType?.startsWith('audio/') || att.filePath.match(/\.(mp3|wav)$/i);

              return (
                <div key={att.id} className="bg-zinc-900 border-2 border-zinc-50 p-4 flex flex-col gap-2 shadow-neo">
                  <div className="flex justify-between items-center border-b-2 border-zinc-800 pb-2">
                    <span className="text-xs font-bold uppercase text-yellow-400 line-clamp-1">{att.requirementLabel}</span>
                    <a
                      href={fullUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-50 hover:text-yellow-400 transition-colors flex items-center gap-1 text-xs font-bold"
                      title="Baixar Arquivo"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="flex-1 flex items-center justify-center min-h-[160px] bg-zinc-950 border-2 border-zinc-800 p-2">
                    {isImage ? (
                      <img src={fullUrl} alt={att.fileName} className="max-h-48 object-contain" />
                    ) : isVideo ? (
                      <video src={fullUrl} controls className="max-h-48 w-full object-contain" />
                    ) : isAudio ? (
                      <audio src={fullUrl} controls className="w-full" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-zinc-400">
                        <FileText className="w-12 h-12 text-yellow-400" />
                        <span className="text-xs font-bold uppercase">{att.fileName}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono truncate">{att.fileName}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
