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

const ok = {
  nome: ' Maria Silva ', pessoas: '25', tipo: 'Aniversário', servico: 'Salão com buffet', data: '2026-11-07',
  inicio: '19:00', termino: '23:00', observacoes: '',
};

test('reserva so e aceita com nome, pessoas, tipo, data futura e horario de inicio', () => {
  const hoje = '2026-10-03';
  assert.equal(validarReserva(ok, hoje), null);
  assert.equal(validarReserva({ ...ok, termino: '' }, hoje), null);
  assert.equal(validarReserva({ ...ok, data: hoje }, hoje), null);
  assert.equal(validarReserva({ ...ok, nome: '   ' }, hoje), 'Informe seu nome');
  for (const pessoas of ['', '0', '-3', '2.5', 'dez']) {
    assert.equal(validarReserva({ ...ok, pessoas }, hoje), 'Informe o número de pessoas');
  }
  assert.equal(validarReserva({ ...ok, tipo: '' }, hoje), 'Selecione o tipo de evento');
  for (const servico of ['', 'Buffet']) {
    assert.equal(validarReserva({ ...ok, servico }, hoje), 'Escolha entre só o salão ou salão com buffet');
  }
  assert.equal(validarReserva({ ...ok, servico: 'Só o salão' }, hoje), null);
  assert.equal(validarReserva({ ...ok, data: '' }, hoje), 'Informe a data do evento');
  assert.equal(validarReserva({ ...ok, data: '2026-10-02' }, hoje), 'A data do evento já passou');
  assert.equal(validarReserva({ ...ok, inicio: '' }, hoje), 'Informe o horário de início');
  for (const inicio of ['19', '25:00', '19:60', '7:30']) {
    assert.equal(validarReserva({ ...ok, inicio }, hoje), 'Horário de início inválido (ex.: 19:00)');
  }
  assert.equal(validarReserva({ ...ok, termino: '24:00' }, hoje), 'Horário final inválido (ex.: 23:00)');
});

test('hora digitada vira hh:mm enquanto digita e e completada ao sair do campo', () => {
  assert.deepEqual(['1', '19', '193', '1930', '19305', '19h30', 'abc'].map(mascaraHora), ['1', '19', '19:3', '19:30', '19:30', '19:30', '']);
  assert.deepEqual(['', '9', '19', '930', '19:3', '19:30'].map(completarHora), ['', '09:00', '19:00', '09:30', '01:93', '19:30']);
  // O que sobra invalido depois de completar e barrado na validacao.
  assert.equal(validarReserva({ ...ok, inicio: completarHora('19:3') }, '2026-10-03'), 'Horário de início inválido (ex.: 19:00)');
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
      '*Data:* 07/11/2026',
      '*Horário:* 19:00 às 23:00',
      '*Observações:* Bolo por nossa conta',
    ].join('\n'),
  );
  const semTermino = mensagemReserva({ ...ok, termino: '' });
  assert.match(semTermino, /\*Horário:\* a partir das 19:00$/);
  assert.doesNotMatch(semTermino, /Observações/);
});

test('calculadora soma salao e buffet por pessoa, e nao fecha total sem todos os valores', () => {
  const precos = { salao: 1500, buffetPorPessoa: 80 };
  assert.equal(estimarEvento({ servico: '', pessoas: '25' }, precos), null);
  assert.deepEqual(estimarEvento({ servico: 'Só o salão', pessoas: '' }, precos), {
    itens: [{ rotulo: 'Aluguel do salão', valor: 1500 }], total: 1500,
  });
  assert.deepEqual(estimarEvento({ servico: 'Salão com buffet', pessoas: '25' }, precos), {
    itens: [{ rotulo: 'Aluguel do salão', valor: 1500 }, { rotulo: 'Buffet (25 pessoas)', valor: 2000 }], total: 3500,
  });
  // Sem numero de pessoas o buffet nao tem valor, entao nao ha total.
  assert.deepEqual(estimarEvento({ servico: 'Salão com buffet', pessoas: '' }, precos), {
    itens: [{ rotulo: 'Aluguel do salão', valor: 1500 }, { rotulo: 'Buffet', valor: null }], total: null,
  });
  // Valores ainda nao definidos pelo restaurante.
  const semValores = { salao: null, buffetPorPessoa: null };
  assert.equal(estimarEvento({ servico: 'Só o salão', pessoas: '25' }, semValores).total, null);
  assert.equal(estimarEvento({ servico: 'Salão com buffet', pessoas: '25' }, { salao: 1500, buffetPorPessoa: null }).total, null);

  assert.equal(formatarReais(3500), 'R$ 3.500,00');
  assert.match(mensagemReserva(ok, precos), /\n\*Estimativa pelo site:\* R\$ 3\.500,00$/);
  assert.doesNotMatch(mensagemReserva(ok, semValores), /Estimativa/);
  assert.doesNotMatch(mensagemReserva(ok), /Estimativa/);
});

test('link do WhatsApp usa so os digitos do numero e codifica a mensagem', () => {
  assert.equal(
    linkWhatsApp('+55 (11) 99999-8888', 'Olá!\n*Nome:* Zé & Cia'),
    'https://wa.me/5511999998888?text=Ol%C3%A1!%0A*Nome%3A*%20Z%C3%A9%20%26%20Cia',
  );
  assert.equal(linkWhatsApp('', 'oi'), 'https://wa.me/?text=oi');
});
