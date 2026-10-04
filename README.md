# Barracão da Praça — site

Página institucional do Barracão da Praça (Next.js + Tailwind), com o formulário
de eventos que abre o WhatsApp com a mensagem pronta.

## Rodar

```bash
npm install
npm run dev
```

Abre em http://localhost:3000. `npm test` roda os testes do formulário e
`npm run build` gera a versão de produção. Na Vercel é só importar o repositório;
não precisa de variável de ambiente.

## Trocar conteúdo

Tudo fica em `lib/site.ts`: WhatsApp de eventos, endereço, horário, Instagram,
fotos (arquivos em `public/site/`) e os textos de "Nossa história" e "Quem faz
acontecer". Campo vazio some da página ou mostra o espaço reservado.
