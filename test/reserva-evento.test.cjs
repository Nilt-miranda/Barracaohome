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

const { validarReserva, mensagemReserva, linkWhatsApp, mascaraHora, completarHora } =load('lib/reserva-evento.ts');

const ok = {
  nome: ' Maria Silva ', pessoas: '25', tipo: 'Aniversário', data: '2026-11-07',
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
      '*Data:* 07/11/2026',
      '*Horário:* 19:00 às 23:00',
      '*Observações:* Bolo por nossa conta',
    ].join('\n'),
  );
  const semTermino = mensagemReserva({ ...ok, termino: '' });
  assert.match(semTermino, /\*Horário:\* a partir das 19:00$/);
  assert.doesNotMatch(semTermino, /Observações/);
});

test('link do WhatsApp usa so os digitos do numero e codifica a mensagem', () => {
  assert.equal(
    linkWhatsApp('+55 (11) 99999-8888', 'Olá!\n*Nome:* Zé & Cia'),
    'https://wa.me/5511999998888?text=Ol%C3%A1!%0A*Nome%3A*%20Z%C3%A9%20%26%20Cia',
  );
  assert.equal(linkWhatsApp('', 'oi'), 'https://wa.me/?text=oi');
});
