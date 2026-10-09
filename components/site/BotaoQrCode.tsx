'use client';

import { useEffect, useRef, useState } from 'react';
import { QrCode, X } from 'lucide-react';
import type { BrowserQRCodeReader } from '@zxing/library';

export default function BotaoQrCode({ className, rotulo = 'Escanear QR Code' }: { className?: string; rotulo?: string }) {
  const [scannerAtivo, setScannerAtivo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!scannerAtivo) return;

    let reader: BrowserQRCodeReader | undefined;

    (async () => {
      try {
        const { BrowserQRCodeReader } = await import('@zxing/library');
        reader = new BrowserQRCodeReader();
        setErro(null);

        await reader.decodeFromVideoDevice(null, videoRef.current!, (result) => {
          if (result) window.location.href = result.getText();
        });
      } catch {
        setErro('Não foi possível acessar a câmera. Verifique as permissões.');
      }
    })();

    return () => {
      reader?.reset();
    };
  }, [scannerAtivo]);

  const fechar = () => {
    setScannerAtivo(false);
    setErro(null);
  };

  return (
    <>
      <button type="button" onClick={() => setScannerAtivo(true)} className={className}>
        <QrCode size={17} aria-hidden />
        <span className="whitespace-nowrap">{rotulo}</span>
      </button>

      {scannerAtivo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Escanear QR Code da mesa"
          onClick={fechar}
        >
          <div className="w-full max-w-sm bg-[#1F3125] p-5 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-medium text-[#F1E9D5]">Escaneie o QR Code da mesa</h2>
              <button type="button" onClick={fechar} aria-label="Fechar" className="p-1 text-[#E7E0D2]/70 hover:text-[#F1E9D5]">
                <X size={20} />
              </button>
            </div>

            {erro ? (
              <p className="bg-red-500/10 px-4 py-3 text-sm text-red-200">{erro}</p>
            ) : (
              <>
                <div className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: '1 / 1' }}>
                  <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="relative h-48 w-48">
                      <div className="absolute left-0 top-0 h-8 w-8 border-l-4 border-t-4 border-[#C98732]" />
                      <div className="absolute right-0 top-0 h-8 w-8 border-r-4 border-t-4 border-[#C98732]" />
                      <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-[#C98732]" />
                      <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-[#C98732]" />
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-[#E7E0D2]/70">Aponte a câmera para o QR Code da mesa para fazer seu pedido</p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
