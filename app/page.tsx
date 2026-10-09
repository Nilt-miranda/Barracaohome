import Cabecalho from '../components/site/Cabecalho';
import Foto from '../components/site/Foto';
import Marca from '../components/site/Marca';
import ReservaEvento from '../components/site/ReservaEvento';
import { IconeInstagram, IconeWhatsApp } from '../components/site/icones';
import { TIPOS_EVENTO, linkWhatsApp } from '../lib/reserva-evento';
import {
  ENDERECO, FOTO_CHEF, FOTO_HERO, FOTO_HISTORIA, FOTOS_AMBIENTE, HORARIOS,
  INSTAGRAM_URL, TEXTO_CHEF, TEXTO_HISTORIA, WHATSAPP_EVENTOS,
} from '../lib/site';

const TITULO = 'font-medium leading-tight text-[#F1E9D5] [font-family:Bitter,Georgia,serif]';
const LINK = 'transition-colors hover:text-[#F1E9D5]';

// Faixas da página alternam entre o verde escuro (fundo do <main>) e o verde claro.
const CLARO = 'bg-[#263D2D]';
const FAIXA = 'mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24';

const whatsapp = linkWhatsApp(WHATSAPP_EVENTOS, 'Olá! Vim pelo site do Barracão da Praça.');
// '5511988379211' -> '(11) 98837-9211'
const whatsappNumero = WHATSAPP_EVENTOS.replace(/^55(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3');
const instagramPerfil = INSTAGRAM_URL ? `@${INSTAGRAM_URL.replace(/\/+$/, '').split('/').pop()}` : '';
const mapa = ENDERECO
  ? `https://www.google.com/maps?q=${encodeURIComponent(`Barracão da Praça, ${ENDERECO}`)}&output=embed`
  : '';

const rota = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Barracão da Praça, ${ENDERECO}`)}`;

// Texto real vem de lib/site.ts; enquanto não chega, fica o aviso em vez de história inventada.
function Texto({ paragrafos, pendente }: { paragrafos: string[]; pendente: string }) {
  if (!paragrafos.length) return <p className="mt-5 text-[#E7E0D2]/50">[{pendente}]</p>;
  return (
    <div className="mt-5 space-y-4 text-lg leading-relaxed">
      {paragrafos.map((p) => <p key={p}>{p}</p>)}
    </div>
  );
}

export default function Home() {
  const [ambiente, mesas, pratos, bebidas, detalhes] = FOTOS_AMBIENTE;

  return (
    <main className="min-h-screen bg-[#1F3125] text-[#E7E0D2] [font-family:DM_Sans,Arial,sans-serif]">
      <Cabecalho />

      {/* ---- Início ---- */}
      <section id="inicio" className="mx-auto grid max-w-6xl scroll-mt-16 gap-8 px-5 pb-16 pt-4 sm:px-8 lg:grid-cols-12 lg:items-end lg:gap-10 lg:pb-24 lg:pt-8">
        <Foto src={FOTO_HERO} alt="Salão do Barracão da Praça" prioridade className="aspect-[4/3] lg:order-2 lg:col-span-8 lg:aspect-[3/2]" />
        <div className="lg:order-1 lg:col-span-4 lg:pb-4">
          <h1 className={`text-4xl sm:text-5xl ${TITULO}`}>Barracão da Praça</h1>
          <p className="mt-4 text-lg leading-relaxed">Comida brasileira, cerveja gelada e bons momentos.</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
            <a href="#eventos" className="bg-[#C98732] px-5 py-3 font-medium text-[#171512] transition-colors hover:bg-[#d7953f]">
              Organize seu evento
            </a>
            <a href="#historia" className={LINK}>Conheça o Barracão</a>
          </div>
        </div>
      </section>

      {/* ---- Nossa história ---- */}
      <section id="historia" className={`scroll-mt-16 ${CLARO}`}>
       <div className={`grid gap-10 lg:grid-cols-12 lg:items-center ${FAIXA}`}>
        <Foto src={FOTO_HISTORIA} alt="O Barracão no começo" className="aspect-[3/2] lg:col-span-7" />
        <div className="lg:col-span-4 lg:col-start-9">
          <h2 className={`text-3xl sm:text-4xl ${TITULO}`}>Nossa história</h2>
          <Texto paragrafos={TEXTO_HISTORIA} pendente="História do Barracão — texto a receber" />
        </div>
       </div>
      </section>

      {/* ---- Cozinha ---- */}
      <section id="cozinha" className="scroll-mt-16">
       <div className={`grid gap-10 lg:grid-cols-12 lg:items-end ${FAIXA}`}>
        <div className="lg:col-span-5 lg:pb-8">
          <h2 className={`text-3xl sm:text-4xl ${TITULO}`}>Quem faz acontecer</h2>
          <Texto paragrafos={TEXTO_CHEF} pendente="Quem comanda a cozinha — texto a receber" />
        </div>
        <Foto src={FOTO_CHEF} alt="Cozinheiro do Barracão da Praça" className="order-first aspect-[2/3] w-full max-w-sm lg:order-none lg:col-span-5 lg:col-start-8 lg:max-w-none" />
       </div>
      </section>

      {/* ---- Eventos ---- */}
      <section id="eventos" className={`scroll-mt-16 ${CLARO}`}>
        <div className={`grid gap-12 lg:grid-cols-12 ${FAIXA}`}>
          <div className="lg:col-span-5">
            <h2 className={`text-4xl sm:text-5xl ${TITULO}`}>Vai comemorar?</h2>
            <p className="mt-5 text-lg leading-relaxed">
              Aniversários, confraternizações, encontros de empresas ou simplesmente uma boa desculpa para reunir a
              turma.
            </p>
            <ul className="mt-8 space-y-2 text-lg text-[#F1E9D5] [font-family:Bitter,Georgia,serif]">
              {TIPOS_EVENTO.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="mb-8 leading-relaxed">
              Conta pra gente o que você está planejando. A conversa continua pelo WhatsApp.
            </p>
            <ReservaEvento />
          </div>
        </div>
      </section>

      {/* ---- Ambiente ---- */}
      <section id="ambiente" className={`scroll-mt-16 ${FAIXA}`}>
        <h2 className={`text-3xl sm:text-4xl ${TITULO}`}>O ambiente</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12">
          <Foto {...ambiente} className="col-span-2 aspect-[3/2] lg:col-span-7" />
          <Foto {...mesas} className="aspect-[4/5] lg:col-span-5 lg:aspect-auto" />
          <Foto {...pratos} className="aspect-[4/5] lg:col-span-4 lg:aspect-square" />
          <Foto {...bebidas} className="aspect-square lg:col-span-3 lg:aspect-auto" />
          <Foto {...detalhes} className="aspect-square lg:col-span-5 lg:aspect-auto" />
        </div>
      </section>

      {/* ---- Contato ---- */}
      <section id="contato" className={`scroll-mt-16 ${CLARO}`}>
       <div className={`grid gap-10 lg:grid-cols-12 ${FAIXA}`}>
        <div className="lg:col-span-5">
          <h2 className={`text-3xl sm:text-4xl ${TITULO}`}>Contato</h2>
          <dl className="mt-6 space-y-5 text-lg">
            {ENDERECO && (
              <div>
                <dt className="text-sm text-[#E7E0D2]/60">Endereço</dt>
                <dd>{ENDERECO}</dd>
                <dd className="mt-1 text-base"><a href={rota} target="_blank" rel="noopener noreferrer" className={LINK}>Como chegar</a></dd>
              </div>
            )}
            {HORARIOS.length > 0 && (
              <div>
                <dt className="text-sm text-[#E7E0D2]/60">Horário de funcionamento</dt>
                {HORARIOS.map((h) => <dd key={h}>{h}</dd>)}
              </div>
            )}
            {INSTAGRAM_URL && (
              <div>
                <dt className="text-sm text-[#E7E0D2]/60">Instagram</dt>
                <dd><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={LINK}>{instagramPerfil}</a></dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-[#E7E0D2]/60">WhatsApp</dt>
              <dd><a href={whatsapp} target="_blank" rel="noopener noreferrer" className={LINK}>Chamar no WhatsApp</a></dd>
            </div>
          </dl>
        </div>
        <div className="relative aspect-[3/2] bg-[#1F3125] lg:col-span-6 lg:col-start-7">
          {mapa ? (
            <iframe src={mapa} title="Mapa: Barracão da Praça" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 h-full w-full border-0" />
          ) : (
            <span className="absolute bottom-3 left-4 text-xs text-[#E7E0D2]/50">Mapa</span>
          )}
        </div>
       </div>
      </section>

      {/* ---- Rodapé ---- */}
      <footer>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-5"><Marca tamanho={44} /></div>

          {ENDERECO && (
            <div className="lg:col-span-4">
              <p className="text-sm text-[#E7E0D2]/60">Endereço</p>
              <p className="mt-1.5">{ENDERECO}</p>
              <a href={rota} target="_blank" rel="noopener noreferrer" className={`mt-1.5 inline-block text-sm ${LINK}`}>Como chegar</a>
            </div>
          )}

          <div className="lg:col-span-3">
            <p className="text-sm text-[#E7E0D2]/60">Fale com a gente</p>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-1.5 flex items-center gap-2 transition-colors hover:text-[#F1E9D5]">
              <IconeWhatsApp size={18} />
              {whatsappNumero || 'WhatsApp'}
            </a>
            {INSTAGRAM_URL && (
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-2 transition-colors hover:text-[#F1E9D5]">
                <IconeInstagram size={18} />
                {instagramPerfil}
              </a>
            )}
          </div>
        </div>

        <div className="border-t border-[#F1E9D5]/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-5 text-sm text-[#E7E0D2]/60 sm:px-8">
            <span>© {new Date().getFullYear()} Barracão da Praça</span>
            <span>
              Desenvolvido por{' '}
              <a href="https://digitalnexusgroup.vercel.app" target="_blank" rel="noopener noreferrer" className={LINK}>DNG</a>
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
