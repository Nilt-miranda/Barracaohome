'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  SERVICOS, TIPOS_EVENTO, completarHora, estimarEvento, formatarReais, linkWhatsApp, mascaraHora, mensagemReserva,
  reservaVazia, validarReserva,
  type Precos, type ReservaEvento as Reserva,
} from '../../lib/reserva-evento';
import { PRECO_BUFFET_POR_PESSOA, PRECO_SALAO, WHATSAPP_EVENTOS } from '../../lib/site';
import { IconeWhatsApp } from './icones';

const INPUT =
  'w-full rounded-none border-b border-[#F1E9D5]/30 bg-transparent py-2.5 text-base text-[#F1E9D5] placeholder-[#E7E0D2]/40 transition-colors focus:border-[#C98732] focus:outline-none [color-scheme:dark]';

const PRECOS: Precos = { salao: PRECO_SALAO, buffetPorPessoa: PRECO_BUFFET_POR_PESSOA };

// Lista do select: o navegador abre com fundo próprio, então a cor vai em cada opção.
const OPCAO = 'bg-[#1F3125] text-[#F1E9D5]';

function Campo({ rotulo, htmlFor, className = '', children }: {
  rotulo: string; htmlFor: string; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm text-[#E7E0D2]/70">{rotulo}</label>
      {children}
    </div>
  );
}

export default function ReservaEvento() {
  const [f, setF] = useState<Reserva>(reservaVazia);
  const set = (campo: keyof Reserva) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setF((atual) => ({ ...atual, [campo]: e.target.value }));

  const hora = (campo: 'inicio' | 'termino') => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((atual) => ({ ...atual, [campo]: mascaraHora(e.target.value) }));
  const fecharHora = (campo: 'inicio' | 'termino') => () =>
    setF((atual) => ({ ...atual, [campo]: completarHora(atual[campo]) }));

  const estimativa = estimarEvento(f, PRECOS);
  const reais = (valor: number | null) => (valor === null ? 'a definir' : formatarReais(valor));

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const agora = new Date();
    const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    const problema = validarReserva(f, hoje);
    if (problema) {
      toast.error(problema);
      return;
    }
    window.open(linkWhatsApp(WHATSAPP_EVENTOS, mensagemReserva(f, PRECOS)), '_blank', 'noopener,noreferrer');
  };

  return (
    <form onSubmit={enviar} noValidate className="grid grid-cols-6 gap-x-6 gap-y-7">
      <Campo rotulo="Nome" htmlFor="ev-nome" className="col-span-6">
        <input id="ev-nome" value={f.nome} onChange={set('nome')} placeholder="Seu nome" autoComplete="name" className={INPUT} />
      </Campo>

      <Campo rotulo="Número de pessoas" htmlFor="ev-pessoas" className="col-span-6 sm:col-span-2">
        <input id="ev-pessoas" value={f.pessoas} onChange={set('pessoas')} placeholder="Ex: 20" inputMode="numeric" className={INPUT} />
      </Campo>

      <Campo rotulo="Tipo de evento" htmlFor="ev-tipo" className="col-span-6 sm:col-span-4">
        <div className="relative">
          <select id="ev-tipo" value={f.tipo} onChange={set('tipo')} className={`${INPUT} cursor-pointer appearance-none pr-7 ${f.tipo ? '' : 'text-[#E7E0D2]/40'}`}>
            <option value="" className={OPCAO}>Selecione</option>
            {TIPOS_EVENTO.map((t) => <option key={t} value={t} className={OPCAO}>{t}</option>)}
          </select>
          <ChevronDown size={18} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[#E7E0D2]/60" aria-hidden />
        </div>
      </Campo>

      <fieldset className="col-span-6">
        <legend className="text-sm text-[#E7E0D2]/70">O que você precisa</legend>
        <div className="mt-2.5 grid grid-cols-2 gap-3">
          {SERVICOS.map((s) => (
            <label
              key={s}
              className={`cursor-pointer border px-4 py-3 text-center text-base transition-colors has-[:focus-visible]:border-[#C98732] ${
                f.servico === s ? 'border-[#C98732] bg-[#C98732] font-medium text-[#171512]' : 'border-[#F1E9D5]/30 text-[#F1E9D5] hover:border-[#F1E9D5]/60'
              }`}
            >
              <input type="radio" name="ev-servico" value={s} checked={f.servico === s} onChange={set('servico')} className="sr-only" />
              {s}
            </label>
          ))}
        </div>
      </fieldset>

      <Campo rotulo="Data" htmlFor="ev-data" className="col-span-6 sm:col-span-2">
        <input id="ev-data" type="date" value={f.data} onChange={set('data')} className={INPUT} />
      </Campo>

      <Campo rotulo="Horário inicial" htmlFor="ev-inicio" className="col-span-3 sm:col-span-2">
        <input id="ev-inicio" value={f.inicio} onChange={hora('inicio')} onBlur={fecharHora('inicio')} placeholder="19:00" inputMode="numeric" maxLength={5} className={INPUT} />
      </Campo>

      <Campo rotulo="Horário final" htmlFor="ev-termino" className="col-span-3 sm:col-span-2">
        <input id="ev-termino" value={f.termino} onChange={hora('termino')} onBlur={fecharHora('termino')} placeholder="23:00" inputMode="numeric" maxLength={5} className={INPUT} />
      </Campo>

      <Campo rotulo="Observações (opcional)" htmlFor="ev-obs" className="col-span-6">
        <textarea id="ev-obs" value={f.observacoes} onChange={set('observacoes')} rows={2} maxLength={500} placeholder="Conte um pouco sobre o que você está pensando" className={`${INPUT} resize-none`} />
      </Campo>

      <div className="col-span-6 border-t border-[#F1E9D5]/20 pt-6" aria-live="polite">
        <p className="text-sm text-[#E7E0D2]/70">Estimativa</p>
        {estimativa ? (
          <dl className="mt-3 space-y-2">
            {estimativa.itens.map((i) => (
              <div key={i.rotulo} className="flex items-baseline justify-between gap-4">
                <dt>{i.rotulo}</dt>
                <dd className={i.valor === null ? 'text-[#E7E0D2]/50' : ''}>{reais(i.valor)}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-4 pt-2 text-xl text-[#F1E9D5] [font-family:Bitter,Georgia,serif]">
              <dt>Total estimado</dt>
              <dd className={estimativa.total === null ? 'text-[#E7E0D2]/50' : ''}>{reais(estimativa.total)}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-[#E7E0D2]/50">Escolha entre só o salão ou salão com buffet para ver a estimativa.</p>
        )}
        <p className="mt-3 text-sm text-[#E7E0D2]/60">O valor final é combinado com a nossa equipe pelo WhatsApp.</p>
      </div>

      <button
        type="submit"
        className="col-span-6 mt-1 flex items-center justify-center gap-2.5 bg-[#C98732] px-6 py-4 text-base font-medium text-[#171512] transition-colors hover:bg-[#d7953f] sm:justify-self-start"
      >
        <IconeWhatsApp size={20} />
        Falar com a gente pelo WhatsApp
      </button>
    </form>
  );
}
