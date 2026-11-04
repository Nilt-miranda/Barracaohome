const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function load(file) {
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  const m = { exports: {} };
  new Function('require', 'module', 'exports', outputText)(require, m, m.exports);
  return m.exports;
}

const { validarReserva, mensagemReserva, linkWhatsApp, mascaraHora, completarHora, estimarEvento, formatarReais } =load('lib/reserva-evento.ts');

const cardapio = {
  salao: 2000, capacidadeSalao: 60,
  buffets: [
    { nome: 'Massas com carne', precoPorPessoa: 75, carnes: ['Maminha', 'Cupim'] },
    { nome: 'Feijoada', precoPorPessoa: 85 },
    { nome: 'Bobó de camarão', precoPorPessoa: 85 },
  ],
  bebidasPorPessoa: 20, saboresBolo: ['Chocolate', 'Prestígio'], bolo: null,
  docinhos: ['Brigadeiro', 'Beijinho', 'Docinhos temáticos'], docinhosPorPessoa: null,
};

const ok = {
  nome: ' Maria Silva ', pessoas: '25', tipo: 'Aniversário', servico: 'Salão com buffet', buffet: 'Feijoada', carne: '',
  bebidas: false, bolo: '', docinhos: [], data: '2026-11-07', inicio: '19:00', termino: '23:00', observacoes: '',
};
const validar = (r, hoje) => validarReserva(r, hoje, cardapio);

test('reserva so e aceita com nome, pessoas, tipo, data futura e horario de inicio', () => {
  const hoje = '2026-10-03';
  assert.equal(validar(ok, hoje), null);
  assert.equal(validar({ ...ok, termino: '' }, hoje), null);
  assert.equal(validar({ ...ok, data: hoje }, hoje), null);
  assert.equal(validar({ ...ok, nome: '   ' }, hoje), 'Informe seu nome');
  for (const pessoas of ['', '0', '-3', '2.5', 'dez']) {
    assert.equal(validar({ ...ok, pessoas }, hoje), 'Informe o número de pessoas');
  }
  assert.equal(validar({ ...ok, tipo: '' }, hoje), 'Selecione o tipo de evento');
  for (const servico of ['', 'Buffet']) {
    assert.equal(validar({ ...ok, servico }, hoje), 'Escolha entre só o salão ou salão com buffet');
  }
  assert.equal(validar({ ...ok, servico: 'Só o salão', buffet: '' }, hoje), null);
  assert.equal(validar({ ...ok, buffet: '' }, hoje), 'Escolha o buffet');
  assert.equal(validar({ ...ok, buffet: 'Churrasco' }, hoje), 'Escolha o buffet');
  assert.equal(validar({ ...ok, buffet: 'Massas com carne' }, hoje), 'Escolha a carne do buffet de massas com carne');
  assert.equal(validar({ ...ok, buffet: 'Massas com carne', carne: 'Cupim' }, hoje), null);
  assert.equal(validar({ ...ok, bolo: 'Chocolate', docinhos: ['Brigadeiro', 'Beijinho'], bebidas: true }, hoje), null);
  assert.equal(validar({ ...ok, bolo: 'Morango' }, hoje), 'Escolha um sabor de bolo da lista');
  assert.equal(validar({ ...ok, docinhos: ['Cajuzinho'] }, hoje), 'Escolha os docinhos da lista');
  assert.equal(validar({ ...ok, data: '' }, hoje), 'Informe a data do evento');
  assert.equal(validar({ ...ok, data: '2026-10-02' }, hoje), 'A data do evento já passou');
  assert.equal(validar({ ...ok, inicio: '' }, hoje), 'Informe o horário de início');
  for (const inicio of ['19', '25:00', '19:60', '7:30']) {
    assert.equal(validar({ ...ok, inicio }, hoje), 'Horário de início inválido (ex.: 19:00)');
  }
  assert.equal(validar({ ...ok, termino: '24:00' }, hoje), 'Horário final inválido (ex.: 23:00)');
});

test('hora digitada vira hh:mm enquanto digita e e completada ao sair do campo', () => {
  assert.deepEqual(['1', '19', '193', '1930', '19305', '19h30', 'abc'].map(mascaraHora), ['1', '19', '19:3', '19:30', '19:30', '19:30', '']);
  assert.deepEqual(['', '9', '19', '930', '19:3', '19:30'].map(completarHora), ['', '09:00', '19:00', '09:30', '01:93', '19:30']);
  // O que sobra invalido depois de completar e barrado na validacao.
  assert.equal(validar({ ...ok, inicio: completarHora('19:3') }, '2026-10-03'), 'Horário de início inválido (ex.: 19:00)');
});

test('mensagem leva todos os dados da reserva e omite o que ficou em branco', () => {
  assert.equal(
    mensagemReserva({ ...ok, observacoes: ' Bolo por nossa conta ' }),
    [
      'Olá! Gostaria de reservar um evento no Barracão da Praça.',
      '',
      '*Nome:* Maria Silva',
      '*Pessoas:* 25',
      '*Tipo de evento:* Aniversário',
      '*Serviço:* Salão com buffet',
      '*Buffet:* Feijoada',
      '*Data:* 07/11/2026',
      '*Horário:* 19:00 às 23:00',
      '*Observações:* Bolo por nossa conta',
    ].join('\n'),
  );
  const semTermino = mensagemReserva({ ...ok, termino: '' });
  assert.match(semTermino, /\*Horário:\* a partir das 19:00$/);
  assert.doesNotMatch(semTermino, /Observações/);
});

test('so o salao cobra o aluguel; com buffet o salao sai incluso e o buffet e por pessoa', () => {
  assert.equal(estimarEvento({ ...ok, servico: '' }, cardapio), null);
  assert.deepEqual(estimarEvento({ ...ok, servico: 'Só o salão' }, cardapio), {
    itens: [{ rotulo: 'Aluguel do salão', valor: 2000 }], total: 2000, completo: true, avisos: [],
  });
  assert.deepEqual(estimarEvento(ok, cardapio), {
    itens: [{ rotulo: 'Buffet feijoada (25 pessoas)', valor: 2125 }, { rotulo: 'Aluguel do salão', valor: 0, incluso: true }],
    total: 2125, completo: true, avisos: [],
  });
  assert.equal(estimarEvento({ ...ok, buffet: 'Massas com carne', carne: 'Maminha' }, cardapio).itens[0].rotulo,
    'Buffet massas com carne – maminha (25 pessoas)');
  // Sem buffet escolhido ou sem numero de pessoas o buffet fica sem valor.
  assert.deepEqual(estimarEvento({ ...ok, buffet: '' }, cardapio).itens[0], { rotulo: 'Buffet (25 pessoas)', valor: null });
  const semPessoas = estimarEvento({ ...ok, pessoas: '' }, cardapio);
  assert.deepEqual(semPessoas.itens[0], { rotulo: 'Buffet feijoada', valor: null });
  assert.equal(semPessoas.completo, false);
});

test('adicionais: bebidas por convidado; bolo e docinhos ficam a combinar enquanto sem preco', () => {
  const r = { ...ok, bebidas: true, bolo: 'Chocolate', docinhos: ['Brigadeiro', 'Docinhos temáticos'] };
  const e = estimarEvento(r, cardapio);
  assert.deepEqual(e.itens.slice(2), [
    { rotulo: 'Bebidas sem álcool (25 pessoas)', valor: 500 },
    { rotulo: 'Bolo (chocolate)', valor: null },
    { rotulo: 'Docinhos (brigadeiro, docinhos temáticos)', valor: null },
  ]);
  assert.equal(e.total, 2625);
  assert.equal(e.completo, false);
  // Com precos definidos tudo entra no total.
  const fechado = estimarEvento(r, { ...cardapio, bolo: 300, docinhosPorPessoa: 10 });
  assert.equal(fechado.total, 2125 + 500 + 300 + 250);
  assert.equal(fechado.completo, true);
  // Acima da capacidade do salao aparece aviso.
  assert.deepEqual(estimarEvento({ ...ok, pessoas: '61' }, cardapio).avisos,
    ['Acima de 60 pessoas: confirme a capacidade e o valor com a nossa equipe.']);
});

test('mensagem leva buffet, adicionais e a estimativa (parcial quando ha itens a combinar)', () => {
  const r = { ...ok, buffet: 'Massas com carne', carne: 'Cupim', bebidas: true, bolo: 'Prestígio', docinhos: ['Brigadeiro', 'Beijinho'] };
  const m = mensagemReserva(r, cardapio);
  assert.match(m, /\n\*Buffet:\* Massas com carne \(cupim\)\n\*Bebidas sem álcool:\* sim\n\*Bolo:\* Prestígio\n\*Docinhos:\* Brigadeiro, Beijinho\n\*Data:\*/);
  assert.match(m, /\n\*Estimativa parcial pelo site:\* R\$ 2\.375,00 \(a combinar: bolo, docinhos\)$/);
  assert.match(mensagemReserva(ok, cardapio), /\n\*Estimativa pelo site:\* R\$ 2\.125,00$/);
  assert.doesNotMatch(mensagemReserva(ok), /Estimativa/);
  assert.equal(formatarReais(3500), 'R$ 3.500,00');
});

test('link do WhatsApp usa so os digitos do numero e codifica a mensagem', () => {
  assert.equal(
    linkWhatsApp('+55 (11) 99999-8888', 'Olá!\n*Nome:* Zé & Cia'),
    'https://wa.me/5511999998888?text=Ol%C3%A1!%0A*Nome%3A*%20Z%C3%A9%20%26%20Cia',
  );
  assert.equal(linkWhatsApp('', 'oi'), 'https://wa.me/?text=oi');
});
