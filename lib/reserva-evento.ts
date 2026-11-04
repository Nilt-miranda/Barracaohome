export type ReservaEvento = {
  nome: string;
  pessoas: string;
  tipo: string;
  servico: string; // um dos SERVICOS
  buffet: string; // nome de um dos buffets, quando o serviço tem buffet
  carne: string; // carne do buffet que oferece escolha (ex.: massas)
  bebidas: boolean; // bebidas sem álcool para os convidados
  bolo: string; // sabor do bolo; vazio = sem bolo
  docinhos: string[]; // tipos de docinhos escolhidos
  data: string; // yyyy-mm-dd (input type="date")
  inicio: string; // hh:mm
  termino: string; // hh:mm, opcional
  observacoes: string;
};

export const TIPOS_EVENTO = [
  'Aniversário',
  'Encontro de família',
  'Confraternização',
  'Evento corporativo',
  'Comemoração',
  'Outro evento',
];

// O que a pessoa quer contratar para o evento.
export const SERVICOS = ['Só o salão', 'Salão com buffet'];
export const COM_BUFFET = 'Salão com buffet';

/** Valores em reais; null = ainda não definido pelo restaurante (aparece "a combinar"). */
export type Buffet = { nome: string; precoPorPessoa: number | null; carnes?: string[] };

export type CardapioEventos = {
  salao: number | null; // aluguel do salão, valor fixo; com buffet o aluguel sai de graça
  capacidadeSalao: number;
  buffets: Buffet[];
  bebidasPorPessoa: number | null;
  saboresBolo: string[];
  bolo: number | null;
  docinhos: string[];
  docinhosPorPessoa: number | null;
};

export const reservaVazia: ReservaEvento = {
  nome: '', pessoas: '', tipo: '', servico: '', buffet: '', carne: '', bebidas: false, bolo: '', docinhos: [],
  data: '', inicio: '', termino: '', observacoes: '',
};

const buffetEscolhido = (r: Pick<ReservaEvento, 'servico' | 'buffet'>, cardapio: CardapioEventos) =>
  r.servico === COM_BUFFET ? cardapio.buffets.find((b) => b.nome === r.buffet) : undefined;

/** Devolve a mensagem do primeiro problema, ou null se dá pra enviar. `hoje` em yyyy-mm-dd. */
export function validarReserva(r: ReservaEvento, hoje: string, cardapio: CardapioEventos): string | null {
  if (!r.nome.trim()) return 'Informe seu nome';
  if (!/^\d+$/.test(r.pessoas.trim()) || Number(r.pessoas) < 1) return 'Informe o número de pessoas';
  if (!r.tipo) return 'Selecione o tipo de evento';
  if (!SERVICOS.includes(r.servico)) return 'Escolha entre só o salão ou salão com buffet';
  if (r.servico === COM_BUFFET) {
    const buffet = buffetEscolhido(r, cardapio);
    if (!buffet) return 'Escolha o buffet';
    if (buffet.carnes?.length && !buffet.carnes.includes(r.carne)) return `Escolha a carne do buffet de ${buffet.nome.toLowerCase()}`;
  }
  if (r.bolo && !cardapio.saboresBolo.includes(r.bolo)) return 'Escolha um sabor de bolo da lista';
  if (r.docinhos.some((d) => !cardapio.docinhos.includes(d))) return 'Escolha os docinhos da lista';
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

/**
 * `valor` null = ainda sem preço (a combinar) ou sem número de pessoas; `incluso` = sai de graça no pacote.
 * `total` soma só o que tem valor; `completo` diz se todos os itens entraram na soma.
 */
export type Estimativa = {
  itens: { rotulo: string; valor: number | null; incluso?: boolean }[];
  total: number;
  completo: boolean;
  avisos: string[];
};

const quantas = (pessoas: number) => `${pessoas} ${pessoas === 1 ? 'pessoa' : 'pessoas'}`;

/**
 * Calculadora do evento. Só o salão: aluguel fixo. Com buffet: valor por pessoa e o salão incluso.
 * Adicionais (bebidas, bolo, docinhos) entram como itens próprios. Devolve null enquanto o
 * serviço não foi escolhido.
 */
export function estimarEvento(
  r: Pick<ReservaEvento, 'servico' | 'pessoas' | 'buffet' | 'carne' | 'bebidas' | 'bolo' | 'docinhos'>,
  cardapio: CardapioEventos,
): Estimativa | null {
  if (!SERVICOS.includes(r.servico)) return null;
  const pessoas = /^\d+$/.test(r.pessoas.trim()) ? Number(r.pessoas) : 0;
  const porPessoa = (preco: number | null) => (pessoas > 0 && preco !== null ? pessoas * preco : null);
  const comPessoas = (rotulo: string) => (pessoas > 0 ? `${rotulo} (${quantas(pessoas)})` : rotulo);
  const itens: Estimativa['itens'] = [];

  if (r.servico === COM_BUFFET) {
    const buffet = buffetEscolhido(r, cardapio);
    const nome = buffet ? `Buffet ${buffet.nome.toLowerCase()}${buffet.carnes?.includes(r.carne) ? ` – ${r.carne.toLowerCase()}` : ''}` : 'Buffet';
    itens.push({ rotulo: comPessoas(nome), valor: buffet ? porPessoa(buffet.precoPorPessoa) : null });
    itens.push({ rotulo: 'Aluguel do salão', valor: 0, incluso: true });
  } else {
    itens.push({ rotulo: 'Aluguel do salão', valor: cardapio.salao });
  }
  if (r.bebidas) itens.push({ rotulo: comPessoas('Bebidas sem álcool'), valor: porPessoa(cardapio.bebidasPorPessoa) });
  if (r.bolo) itens.push({ rotulo: `Bolo (${r.bolo.toLowerCase()})`, valor: cardapio.bolo });
  if (r.docinhos.length) itens.push({ rotulo: `Docinhos (${r.docinhos.join(', ').toLowerCase()})`, valor: porPessoa(cardapio.docinhosPorPessoa) });

  const avisos = pessoas > cardapio.capacidadeSalao
    ? [`Acima de ${cardapio.capacidadeSalao} pessoas: confirme a capacidade e o valor com a nossa equipe.`]
    : [];
  return {
    itens,
    total: itens.reduce((soma, i) => soma + (i.valor ?? 0), 0),
    completo: itens.every((i) => i.valor !== null),
    avisos,
  };
}

export function formatarReais(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\s/g, ' ');
}

const formatData = (d: string) => d.split('-').reverse().join('/');

/** `cardapio` entra só para levar a estimativa na mensagem. */
export function mensagemReserva(r: ReservaEvento, cardapio?: CardapioEventos): string {
  const linhas = [
    'Olá! Gostaria de reservar um evento no Barracão da Praça.',
    '',
    `*Nome:* ${r.nome.trim()}`,
    `*Pessoas:* ${Number(r.pessoas)}`,
    `*Tipo de evento:* ${r.tipo}`,
    `*Serviço:* ${r.servico}`,
  ];
  if (r.servico === COM_BUFFET && r.buffet) linhas.push(`*Buffet:* ${r.buffet}${r.carne ? ` (${r.carne.toLowerCase()})` : ''}`);
  if (r.bebidas) linhas.push('*Bebidas sem álcool:* sim');
  if (r.bolo) linhas.push(`*Bolo:* ${r.bolo}`);
  if (r.docinhos.length) linhas.push(`*Docinhos:* ${r.docinhos.join(', ')}`);
  linhas.push(
    `*Data:* ${formatData(r.data)}`,
    `*Horário:* ${r.termino ? `${r.inicio} às ${r.termino}` : `a partir das ${r.inicio}`}`,
  );
  const estimativa = cardapio ? estimarEvento(r, cardapio) : null;
  if (estimativa && estimativa.total > 0) {
    const pendentes = estimativa.itens.filter((i) => i.valor === null).map((i) => i.rotulo.replace(/ \(.*$/, '').toLowerCase());
    linhas.push(estimativa.completo
      ? `*Estimativa pelo site:* ${formatarReais(estimativa.total)}`
      : `*Estimativa parcial pelo site:* ${formatarReais(estimativa.total)} (a combinar: ${pendentes.join(', ')})`);
  }
  if (r.observacoes.trim()) linhas.push(`*Observações:* ${r.observacoes.trim()}`);
  return linhas.join('\n');
}

export function linkWhatsApp(numero: string, mensagem: string): string {
  return `https://wa.me/${numero.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`;
}
