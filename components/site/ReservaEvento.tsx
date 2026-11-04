'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  COM_BUFFET, SERVICOS, TIPOS_EVENTO, completarHora, estimarEvento, formatarReais, linkWhatsApp, mascaraHora,
  mensagemReserva, reservaVazia, validarReserva,
  type ReservaEvento as Reserva,
} from '../../lib/reserva-evento';
import { CARDAPIO_EVENTOS as CARDAPIO, NOTA_BUFFETS, WHATSAPP_EVENTOS } from '../../lib/site';
import { IconeWhatsApp } from './icones';

const INPUT =
  'w-full rounded-none border-b border-[#F1E9D5]/30 bg-transparent py-2.5 text-base text-[#F1E9D5] placeholder-[#E7E0D2]/40 transition-colors focus:border-[#C98732] focus:outline-none [color-scheme:dark]';

// Lista do select: o navegador abre com fundo próprio, então a cor vai em cada opção.
const OPCAO = 'bg-[#2B4433] text-[#F1E9D5]';

// Cartão de escolha (radio/checkbox escondido): dourado quando marcado.
const cartao = (marcado: boolean) =>
  `cursor-pointer border px-4 py-3 text-base transition-colors has-[:focus-visible]:border-[#C98732] ${
    marcado ? 'border-[#C98732] bg-[#C98732] font-medium text-[#171512]' : 'border-[#F1E9D5]/30 text-[#F1E9D5] hover:border-[#F1E9D5]/60'
  }`;

const precoPorPessoa = (valor: number | null) => (valor === null ? 'a combinar' : `${formatarReais(valor)} por pessoa`);

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
  const set = (campo: 'nome' | 'pessoas' | 'tipo' | 'servico' | 'carne' | 'bolo' | 'data' | 'observacoes') =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setF((atual) => ({ ...atual, [campo]: e.target.value }));

  const hora = (campo: 'inicio' | 'termino') => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((atual) => ({ ...atual, [campo]: mascaraHora(e.target.value) }));
  const fecharHora = (campo: 'inicio' | 'termino') => () =>
    setF((atual) => ({ ...atual, [campo]: completarHora(atual[campo]) }));

  // Trocar de buffet zera a carne: cada buffet tem as suas opções (ou nenhuma).
  const escolherBuffet = (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((atual) => ({ ...atual, buffet: e.target.value, carne: '' }));
  const alternarDocinho = (d: string) => () =>
    setF((atual) => ({
      ...atual,
      docinhos: atual.docinhos.includes(d) ? atual.docinhos.filter((x) => x !== d) : [...atual.docinhos, d],
    }));

  const comBuffet = f.servico === COM_BUFFET;
  const buffet = comBuffet ? CARDAPIO.buffets.find((b) => b.nome === f.buffet) : undefined;
  const estimativa = estimarEvento(f, CARDAPIO);
  const reais = (i: { valor: number | null; incluso?: boolean }) =>
    i.incluso ? 'Incluso' : i.valor === null ? 'a combinar' : formatarReais(i.valor);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const agora = new Date();
    const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    const problema = validarReserva(f, hoje, CARDAPIO);
    if (problema) {
      toast.error(problema);
      return;
    }
    window.open(linkWhatsApp(WHATSAPP_EVENTOS, mensagemReserva(f, CARDAPIO)), '_blank', 'noopener,noreferrer');
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
            <label key={s} className={`${cartao(f.servico === s)} text-center`}>
              <input type="radio" name="ev-servico" value={s} checked={f.servico === s} onChange={set('servico')} className="sr-only" />
              {s}
            </label>
          ))}
        </div>
        {comBuffet && <p className="mt-2.5 text-sm text-[#E7E0D2]/60">Com buffet, o aluguel do salão sai de graça.</p>}
      </fieldset>

      {comBuffet && (
        <fieldset className="col-span-6">
          <legend className="text-sm text-[#E7E0D2]/70">Buffet</legend>
          <div className="mt-2.5 grid gap-3 sm:grid-cols-3">
            {CARDAPIO.buffets.map((b) => (
              <label key={b.nome} className={cartao(f.buffet === b.nome)}>
                <input type="radio" name="ev-buffet" value={b.nome} checked={f.buffet === b.nome} onChange={escolherBuffet} className="sr-only" />
                <span className="block">{b.nome}</span>
                <span className={`block text-sm ${f.buffet === b.nome ? 'text-[#171512]/80' : 'text-[#E7E0D2]/60'}`}>{precoPorPessoa(b.precoPorPessoa)}</span>
              </label>
            ))}
          </div>
          <p className="mt-2.5 text-sm text-[#E7E0D2]/60">{NOTA_BUFFETS}</p>
          {buffet?.carnes?.length ? (
            <Campo rotulo="Carne" htmlFor="ev-carne" className="mt-5 sm:w-1/2">
              <div className="relative">
                <select id="ev-carne" value={f.carne} onChange={set('carne')} className={`${INPUT} cursor-pointer appearance-none pr-7 ${f.carne ? '' : 'text-[#E7E0D2]/40'}`}>
                  <option value="" className={OPCAO}>Selecione</option>
                  {buffet.carnes.map((c) => <option key={c} value={c} className={OPCAO}>{c}</option>)}
                </select>
                <ChevronDown size={18} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[#E7E0D2]/60" aria-hidden />
              </div>
            </Campo>
          ) : null}
        </fieldset>
      )}

      <fieldset className="col-span-6">
        <legend className="text-sm text-[#E7E0D2]/70">Adicionais (opcional)</legend>
        <label className={`mt-2.5 flex items-center justify-between gap-4 ${cartao(f.bebidas)}`}>
          <input type="checkbox" checked={f.bebidas} onChange={(e) => setF((atual) => ({ ...atual, bebidas: e.target.checked }))} className="sr-only" />
          <span>Bebidas sem álcool</span>
          <span className={`text-sm ${f.bebidas ? 'text-[#171512]/80' : 'text-[#E7E0D2]/60'}`}>
            {CARDAPIO.bebidasPorPessoa === null ? 'a combinar' : `+ ${formatarReais(CARDAPIO.bebidasPorPessoa)} por convidado`}
          </span>
        </label>

        <Campo rotulo="Bolo" htmlFor="ev-bolo" className="mt-6">
          <div className="relative">
            <select id="ev-bolo" value={f.bolo} onChange={set('bolo')} className={`${INPUT} cursor-pointer appearance-none pr-7 ${f.bolo ? '' : 'text-[#E7E0D2]/40'}`}>
              <option value="" className={OPCAO}>Sem bolo</option>
              {CARDAPIO.saboresBolo.map((s) => <option key={s} value={s} className={OPCAO}>{s}</option>)}
            </select>
            <ChevronDown size={18} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[#E7E0D2]/60" aria-hidden />
          </div>
        </Campo>

        <p className="mt-6 text-sm text-[#E7E0D2]/70">Docinhos</p>
        <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {CARDAPIO.docinhos.map((d) => (
            <label key={d} className={`${cartao(f.docinhos.includes(d))} text-center`}>
              <input type="checkbox" checked={f.docinhos.includes(d)} onChange={alternarDocinho(d)} className="sr-only" />
              {d}
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
          <>
          <dl className="mt-3 space-y-2">
            {estimativa.itens.map((i) => (
              <div key={i.rotulo} className="flex items-baseline justify-between gap-4">
                <dt>{i.rotulo}</dt>
                <dd className={`shrink-0 ${i.valor === null || i.incluso ? 'text-[#E7E0D2]/50' : ''}`}>{reais(i)}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-4 pt-2 text-xl text-[#F1E9D5] [font-family:Bitter,Georgia,serif]">
              <dt>{estimativa.completo ? 'Total estimado' : 'Total parcial'}</dt>
              <dd>{formatarReais(estimativa.total)}</dd>
            </div>
          </dl>
          {!estimativa.completo && (
            <p className="mt-2 text-sm text-[#E7E0D2]/60">Os itens &quot;a combinar&quot; entram no valor final.</p>
          )}
          {estimativa.avisos.map((a) => <p key={a} className="mt-2 text-sm text-[#E5B66F]">{a}</p>)}
          </>
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
