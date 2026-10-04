export type ReservaEvento = {
  nome: string;
  pessoas: string;
  tipo: string;
  servico: string; // um dos SERVICOS
  data: string; // yyyy-mm-dd (input type="date")
  inicio: string; // hh:mm
  termino: string; // hh:mm, opcional
  observacoes: string;
};

export const TIPOS_EVENTO = [
  'Aniversário',
  'Confraternização',
  'Evento corporativo',
  'Comemoração',
  'Outro evento',
];

// O que a pessoa quer contratar para o evento.
export const SERVICOS = ['Só o salão', 'Salão com buffet'];

export const reservaVazia: ReservaEvento = {
  nome: '', pessoas: '', tipo: '', servico: '', data: '', inicio: '', termino: '', observacoes: '',
};

/** Devolve a mensagem do primeiro problema, ou null se dá pra enviar. `hoje` em yyyy-mm-dd. */
export function validarReserva(r: ReservaEvento, hoje: string): string | null {
  if (!r.nome.trim()) return 'Informe seu nome';
  if (!/^\d+$/.test(r.pessoas.trim()) || Number(r.pessoas) < 1) return 'Informe o número de pessoas';
  if (!r.tipo) return 'Selecione o tipo de evento';
  if (!SERVICOS.includes(r.servico)) return 'Escolha entre só o salão ou salão com buffet';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.data)) return 'Informe a data do evento';
  if (r.data < hoje) return 'A data do evento já passou';
  if (!r.inicio) return 'Informe o horário de início';
  if (!HORA.test(r.inicio)) return 'Horário de início inválido (ex.: 19:00)';
  if (r.termino && !HORA.test(r.termino)) return 'Horário final inválido (ex.: 23:00)';
  return null;
}

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Máscara do campo de hora enquanto a pessoa digita: só dígitos, vira hh:mm. */
export function mascaraHora(texto: string): string {
  const d = texto.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d;
}

/** Ao sair do campo, completa o que foi digitado pela metade: '19' -> '19:00', '9' -> '09:00'. */
export function completarHora(texto: string): string {
  const d = texto.replace(/\D/g, '');
  if (!d) return '';
  if (d.length <= 2) return `${d.padStart(2, '0')}:00`;
  if (d.length === 3) return `0${d[0]}:${d.slice(1)}`;
  return `${d.slice(0, 2)}:${d.slice(2, 4)}`;
}

/** Valores em reais; null = ainda não definido pelo restaurante. */
export type Precos = { salao: number | null; buffetPorPessoa: number | null };

export type Estimativa = { itens: { rotulo: string; valor: number | null }[]; total: number | null };

/**
 * Calculadora do evento: aluguel do salão (valor fixo) e, com buffet, valor por pessoa.
 * Item sem valor definido ou sem número de pessoas fica null, e o total também.
 * Devolve null enquanto o serviço não foi escolhido.
 */
export function estimarEvento(r: Pick<ReservaEvento, 'servico' | 'pessoas'>, precos: Precos): Estimativa | null {
  if (!SERVICOS.includes(r.servico)) return null;
  const itens = [{ rotulo: 'Aluguel do salão', valor: precos.salao }];
  if (r.servico === 'Salão com buffet') {
    const pessoas = /^\d+$/.test(r.pessoas.trim()) ? Number(r.pessoas) : 0;
    itens.push({
      rotulo: pessoas > 0 ? `Buffet (${pessoas} ${pessoas === 1 ? 'pessoa' : 'pessoas'})` : 'Buffet',
      valor: pessoas > 0 && precos.buffetPorPessoa !== null ? pessoas * precos.buffetPorPessoa : null,
    });
  }
  const total = itens.every((i) => i.valor !== null) ? itens.reduce((soma, i) => soma + (i.valor ?? 0), 0) : null;
  return { itens, total };
}

export function formatarReais(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\s/g, ' ');
}

const formatData = (d: string) => d.split('-').reverse().join('/');

/** `precos` entra só para levar a estimativa na mensagem, quando ela fecha um total. */
export function mensagemReserva(r: ReservaEvento, precos?: Precos): string {
  const linhas = [
    'Olá! Gostaria de reservar um evento no Barracão da Praça.',
    '',
    `*Nome:* ${r.nome.trim()}`,
    `*Pessoas:* ${Number(r.pessoas)}`,
    `*Tipo de evento:* ${r.tipo}`,
    `*Serviço:* ${r.servico}`,
    `*Data:* ${formatData(r.data)}`,
    `*Horário:* ${r.termino ? `${r.inicio} às ${r.termino}` : `a partir das ${r.inicio}`}`,
  ];
  const total = precos ? estimarEvento(r, precos)?.total : null;
  if (typeof total === 'number') linhas.push(`*Estimativa pelo site:* ${formatarReais(total)}`);
  if (r.observacoes.trim()) linhas.push(`*Observações:* ${r.observacoes.trim()}`);
  return linhas.join('\n');
}

export function linkWhatsApp(numero: string, mensagem: string): string {
  return `https://wa.me/${numero.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`;
}
