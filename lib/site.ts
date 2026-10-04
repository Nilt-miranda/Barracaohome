// Dados da página inicial pública. Tudo que muda sem mexer em layout fica aqui.

// WhatsApp que recebe os pedidos de evento: só dígitos, com DDI + DDD
// (ex.: '5511999998888'). Vazio = o WhatsApp abre pedindo pra escolher o contato.
export const WHATSAPP_EVENTOS: string = '5511988379211';

// Ex.: 'Rua Tal, 123 - Bairro - Cidade/UF'. Vazio = some do contato e do rodapé.
export const ENDERECO: string = 'Rua Conselheiro Ribas, 283 - Vila Anastácio, São Paulo/SP';

// Uma linha por faixa (ex.: 'Terça a sexta, das 11h às 23h'). Vazio = some do contato.
export const HORARIOS: string[] = [];

// Link do perfil (ex.: 'https://www.instagram.com/...'). Vazio = some.
export const INSTAGRAM_URL: string = '';

// Fotos em frontend/public (ex.: '/site/salao.jpg'). Vazio = fica o espaço reservado.
export const FOTO_HERO: string = '/site/salao.jpg';
export const FOTO_HISTORIA: string = '/site/historia.jpg';
export const FOTO_CHEF: string = '/site/chef.png';

// Galeria "O ambiente": cinco fotos, nesta ordem de destaque.
export const FOTOS_AMBIENTE = [
  { src: '', alt: 'Salão do Barracão da Praça' },
  { src: '', alt: 'Mesas' },
  { src: '', alt: 'Pratos da casa' },
  { src: '', alt: 'Bebidas' },
  { src: '', alt: 'Detalhes do restaurante' },
];

// Textos reais, um parágrafo por item. Vazio = fica o aviso de texto pendente.
export const TEXTO_HISTORIA: string[] = [];
export const TEXTO_CHEF: string[] = [];
