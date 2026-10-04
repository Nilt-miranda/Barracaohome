'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import BotaoQrCode from './BotaoQrCode';
import Marca from './Marca';

const NAV = [
  { href: '#inicio', rotulo: 'Início' },
  { href: '#historia', rotulo: 'Nossa História' },
  { href: '#eventos', rotulo: 'Eventos' },
  { href: '#contato', rotulo: 'Contato' },
];

export default function Cabecalho() {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#18251D]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-7 px-5 sm:px-8">
        <a href="#inicio" aria-label="Barracão da Praça — início" className="mr-auto"><Marca /></a>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-sm text-[#E7E0D2]/80 transition-colors hover:text-[#F1E9D5]">
              {n.rotulo}
            </a>
          ))}
        </nav>

        <BotaoQrCode
          rotulo="QR da mesa"
          className="hidden items-center gap-1.5 text-sm text-[#E7E0D2]/60 transition-colors hover:text-[#F1E9D5] lg:inline-flex"
        />

        <a
          href="#eventos"
          className="hidden bg-[#C98732] px-4 py-2 text-sm font-medium text-[#171512] transition-colors hover:bg-[#d7953f] sm:inline-block"
        >
          Organize seu evento
        </a>

        <button
          type="button"
          onClick={() => setAberto((a) => !a)}
          aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={aberto}
          className="-mr-2 p-2 text-[#F1E9D5] lg:hidden"
        >
          {aberto ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {aberto && (
        <nav className="border-t border-[#F1E9D5]/10 px-5 pb-6 pt-2 sm:px-8 lg:hidden">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setAberto(false)}
              className="block border-b border-[#F1E9D5]/10 py-3.5 text-base text-[#F1E9D5]"
            >
              {n.rotulo}
            </a>
          ))}
          <BotaoQrCode
            rotulo="Ler o QR Code da mesa"
            className="mt-5 flex items-center gap-2 text-base text-[#E7E0D2]/80"
          />
        </nav>
      )}
    </header>
  );
}
