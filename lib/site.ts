// Dados da página inicial pública. Tudo que muda sem mexer em layout fica aqui.
import type { CardapioEventos } from './reserva-evento';

// WhatsApp que recebe os pedidos de evento: só dígitos, com DDI + DDD
// (ex.: '5511999998888'). Vazio = o WhatsApp abre pedindo pra escolher o contato.
export const WHATSAPP_EVENTOS: string = '5511988379211';

export const SLOGAN = 'Comida boa, feita com amor.';

// Eventos, em reais. null = valor ainda não definido (aparece "a combinar" na calculadora).
export const CARDAPIO_EVENTOS: CardapioEventos = {
  salao: 2000, // locação do espaço; com buffet o aluguel sai de graça
  capacidadeSalao: 60,
  buffets: [
    { nome: 'Massas com carne', precoPorPessoa: 75, carnes: ['Maminha', 'Cupim'] },
    { nome: 'Feijoada', precoPorPessoa: 85 },
    { nome: 'Bobó de camarão', precoPorPessoa: 85 },
  ],
  bebidasPorPessoa: 20, // bebidas sem álcool, por convidado
  // Sabores sugeridos: confirmar com a cozinha. Preço do bolo ainda a definir.
  saboresBolo: ['Chocolate', 'Ninho com morango', 'Prestígio', 'Doce de leite', 'Outro sabor (a combinar)'],
  bolo: null,
  docinhos: ['Brigadeiro', 'Beijinho', 'Docinhos temáticos'],
  docinhosPorPessoa: null,
};

// O que vem na locação do espaço (sem buffet).
export const INCLUSO_SALAO = [
  '6 horas de evento',
  'Mesas e cadeiras inclusas',
  'Cozinha completa com equipamentos',
  '1 funcionário para auxiliar no uso dos equipamentos',
];

export const NOTA_BUFFETS = 'Todas as opções contam com franguinho crocante como alternativa de proteína.';

// Ex.: 'Rua Tal, 123 - Bairro - Cidade/UF'. Vazio = some do contato e do rodapé.
export const ENDERECO: string = 'Rua Conselheiro Ribas, 283 - Vila Anastácio, São Paulo/SP';

// Uma linha por faixa (ex.: 'Terça a sexta, das 11h às 23h'). Vazio = some do contato.
export const HORARIOS: string[] = [];

// Link do perfil (ex.: 'https://www.instagram.com/...'). Vazio = some.
export const INSTAGRAM_URL: string = '';

// Fotos em public (ex.: '/site/salao.jpg'). Vazio = fica o espaço reservado.
export const FOTO_HERO: string = '/site/salao.jpg';
export const FOTO_HISTORIA: string = '/site/historia.jpg';
export const FOTO_CHEF: string = '/site/chef.webp';

// Galeria "O ambiente": cinco fotos, nesta ordem de destaque.
export const FOTOS_AMBIENTE = [
  { src: '/site/salao-bandeirinhas.webp', alt: 'Salão do Barracão da Praça com bandeirinhas' },
  { src: '/site/entrada.webp', alt: 'Entrada do Barracão, com azulejos e plantas' },
  { src: '/site/pratos-quentes.webp', alt: 'Pratos quentes servidos em travessas de barro' },
  { src: '/site/saladas.webp', alt: 'Mesa de saladas' },
  { src: '/site/batata-na-manteiga.webp', alt: 'Batata na manteiga com alecrim' },
];

// Fotos da faixa de eventos.
export const FOTOS_EVENTOS = [
  { src: '/site/mesa-do-bolo.webp', alt: 'Mesa de bolo e doces montada no salão' },
  { src: '/site/docinhos.webp', alt: 'Brigadeiros e beijinhos na mesa de doces' },
  { src: '/site/mesa-decorada.webp', alt: 'Mesa decorada com flores secas e guirlanda' },
];

// Textos reais, um parágrafo por item. Vazio = fica o aviso de texto pendente.
export const TEXTO_HISTORIA: string[] = [
  'O Barracão da Praça é muito mais do que um restaurante. É um lugar construído com as mãos, os sonhos e a dedicação de pai e filho. São 15 anos de história, de trabalho, de encontros e de muito amor pela boa gastronomia.',
  'Nosso espaço tem uma atmosfera intimista, rústica e acolhedora. É aquele tipo de lugar que não precisa de muita produção para ficar bonito. Sua personalidade já está nos detalhes, na madeira, na decoração e no aconchego de cada cantinho.',
  'No Barracão, a gente acredita que os melhores momentos acontecem ao redor de uma mesa, com comida bem-feita, pessoas queridas e boas histórias para contar.',
];
export const TEXTO_CHEF: string[] = [
  'Nossa cozinha é conduzida por um chef formado em Gastronomia, que acredita que comida boa precisa ter sabor, cuidado, qualidade e fartura.',
  'Aqui, cada detalhe importa e cada prato carrega um pouco da nossa história.',
];
export const TEXTO_EVENTOS: string[] = [
  'É perfeito para pequenas celebrações, aniversários, encontros de família, confraternizações e momentos especiais que merecem ser vividos de perto, sem pressa e com muito carinho.',
  'O ambiente é fácil de personalizar e decorar, para que cada evento tenha a identidade de quem está celebrando.',
];
