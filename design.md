# PromptVault TikTok Shop — Design System

> Documento de direção visual, componentes, cores, layout, responsividade e experiência de uso da galeria premium de prompts.

**Versão:** 1.0
**Produto:** PromptVault TikTok Shop — acervo visual de prompts
**Stack:** Next.js 16 · TypeScript · Tailwind CSS 4 · shadcn/ui · Zustand
**Última atualização:** 2025

---

## Índice

1. [Visão Geral do Design](#1-visão-geral-do-design)
2. [Estilo Visual](#2-estilo-visual)
3. [Paleta de Cores](#3-paleta-de-cores)
4. [Tipografia](#4-tipografia)
5. [Layout Geral](#5-layout-geral)
6. [Tela de Login](#6-tela-de-login)
7. [Sidebar](#7-sidebar)
8. [Hero da Galeria](#8-hero-da-galeria)
9. [Busca e Filtros](#9-busca-e-filtros)
10. [Cards de Prompts](#10-cards-de-prompts)
11. [Modal de Detalhes](#11-modal-de-detalhes)
12. [Botões](#12-botões)
13. [Carrossel / Ver Mais](#13-carrossel--ver-mais)
14. [Microinterações](#14-microinterações)
15. [Toasts](#15-toasts)
16. [Responsividade](#16-responsividade)
17. [Acessibilidade](#17-acessibilidade)
18. [Performance](#18-performance)
19. [Personalidade da Interface](#19-personalidade-da-interface)

---

## 1. Visão Geral do Design

O **PromptVault TikTok Shop** é um app/acervo visual de prompts para criação de vídeos, imagens e cenas UGC para TikTok Shop e Shopee.

### Princípios de design

O design deve transmitir:

- **Organização** — cada prompt tem lugar claro, contadores visíveis, categorias consistentes.
- **Praticidade** — copiar em um toque, favoritar com um gesto, filtrar sem fricção.
- **Tecnologia** — visual de dashboard de IA, não de site institucional.
- **Premium** — glassmorphism, glow sutil, espaçamento generoso.
- **Velocidade** — carregamento progressivo, sem animações pesadas.
- **Clareza** — hierarquia tipográfica forte, contraste alto, foco na ação principal.
- **Estética IA + TikTok + produto digital** — identidade de creator tool moderna.

### O que evitar

O app **não** deve parecer:

- blog;
- planilha;
- página de vendas;
- curso antigo;
- biblioteca confusa;
- plataforma escolar desatualizada.

---

## 2. Estilo Visual

### Estilo principal

- **Dark mode premium** como base permanente (sem toggle de tema claro).
- **Glassmorphism** em cards, hero, modal e overlays (blur + superfície translúcida + borda sutil).
- **UI moderna** com cantos arredondados generosos (radius `0.875rem` base).
- **Visual de dashboard** — sidebar fixa, contadores, estado ativo claro.
- **Neon elegante** — brilho contido, nunca piscante ou agressivo.
- **App responsivo** — mobile-first, adaptando densidade por breakpoint.

### Inspirações

- galerias de prompts (tipo Lexica, Midjourney Explore);
- SaaS moderno (Linear, Vercel, Raycast);
- dashboards de IA;
- bibliotecas visuais;
- TikTok / UGC / creator tools.

### Tratamento de superfícies

As superfícies são camadas translúcidas sobre um fundo com glows radiais (roxo/rosa/ciano). Isso cria profundidade sem recorrer a sombras pesadas. As camadas, do fundo para o topo:

1. **Background base** (`#0B0B12`) com 3 glows radiais fixos (roxo, rosa, ciano).
2. **Sidebar** (`#090912`, 70% opacidade) — `backdrop-blur-xl`.
3. **Cards / Hero / Modal** — `.glass` / `.glass-strong` (blur 16–22px, saturação 140–150%).

---

## 3. Paleta de Cores

### Base (dark)

| Token              | Hex / RGBA                  | Uso                                  |
| ------------------ | --------------------------- | ------------------------------------ |
| Preto profundo     | `#07070B`                   | Regiões de máximo contraste          |
| Fundo principal    | `#0B0B12`                   | Background do app                    |
| Sidebar            | `#090912`                   | Painel lateral                       |
| Card               | `rgba(255,255,255,0.06)`    | Superfície padrão de cards           |
| Card hover         | `rgba(255,255,255,0.10)`    | Estado hover de cards                |

### Destaques (neon)

| Token            | Hex       | Uso                                  |
| ---------------- | --------- | ------------------------------------ |
| Rosa neon        | `#FF2E88` | Gradientes, badges de vídeo, CTAs    |
| Roxo neon        | `#A855F7` | Primária, item ativo, foco           |
| Ciano elétrico   | `#22D3EE` | Badges de imagem, destaques secund.  |
| Lilás suave      | `#C084FC` | Tags, acentos suaves                 |

> O gradiente de marca combina roxo → rosa → ciano, usado em títulos de destaque, botões principais e chips ativos.

### Texto

| Token            | Hex       | Uso                                  |
| ---------------- | --------- | ------------------------------------ |
| Branco           | `#FFFFFF` | Títulos e ações principais           |
| Texto principal  | `#F5F5F7` | Corpo e headings                     |
| Texto secundário | `#A1A1AA` | Labels, descrições, microcopy        |
| Texto apagado    | `#71717A` | Placeholders, metadados              |

### Bordas

| Token            | Valor                        | Uso                          |
| ---------------- | ---------------------------- | ---------------------------- |
| Borda glass      | `rgba(255,255,255,0.10)`     | Bordas padrão                |
| Borda destaque   | `rgba(168,85,247,0.45)`      | Foco / item ativo / hover    |

### Estados

| Estado    | Hex       | Uso                                  |
| --------- | --------- | ------------------------------------ |
| Sucesso   | `#22C55E` | Toasts de copiar / favoritar         |
| Alerta    | `#FACC15` | Avisos                               |
| Erro      | `#EF4444` | Falhas de login / cópia              |

### Mapeamento para CSS

As cores são expostas como variáveis CSS em `:root` / `.dark` (ex.: `--brand-purple`, `--brand-pink`, `--brand-cyan`) e como tokens Tailwind (`bg-brand-gradient`, `text-gradient-brand`, `text-brand-pink`, etc.).

---

## 4. Tipografia

### Família tipográfica

Usar fonte moderna e limpa — **Inter**, **Sora** ou **Manrope** (ou equivalente disponível). O projeto utiliza Geist Sans como base, com Geist Mono para caixas de código/prompt.

### Escala e pesos

| Uso        | Peso     | Tracking              | Contraste |
| ---------- | -------- | --------------------- | --------- |
| Títulos    | 700/800  | levemente negativo    | alto      |
| Corpo      | 400/500  | neutro                | médio     |
| Botões     | 600/700  | neutro                | alto      |
| Microcopy  | 400      | neutro                | baixo     |

### Hierarquia prática

- **Hero / H1:** `text-3xl` → `text-4xl`, peso 600, tracking tight.
- **Título de card / H3:** `text-base`, peso 600, `line-clamp-1`.
- **Descrição de card:** `text-sm`, peso 400, `line-clamp-2`, cor secundária.
- **Tags:** `text-[11px]`, peso 500, fundo translúcido.
- **Badges:** `text-[11px]`, peso 600, uppercase, tracking wider.
- **Prompt (modal):** `text-[13px]`, monoespaçada, `leading-relaxed`.

### Legibilidade

- Espaçamento de linha confortável (`leading-relaxed` em corpo e descrições).
- Contraste mínimo AA em todo texto de interface.
- Parágrafos curtos no corpo — a interface é orientada a cards, não a leitura longa.

---

## 5. Layout Geral

### Estrutura

```
┌─────────────────────────────────────────────┐
│ Sidebar │  Hero                             │
│ fixa    │  Busca + Filtros (chips)          │
│ 240-    │  Contador de resultados           │
│ 280px   │  Grid de cards (4 col desktop)    │
│         │  Ver mais prompts                 │
│         │  CTA interno                      │
├─────────┴───────────────────────────────────┤
│ Footer sticky                                │
└─────────────────────────────────────────────┘
```

### Desktop

- **Sidebar fixa** à esquerda, largura **240px–280px** (o app usa `288px` / `w-72`).
- Área principal centralizada com `max-width` confortável e padding `lg:px-8`.
- **Grid com 4 colunas** de cards em telas grandes (`xl:grid-cols-4`).
- Hero no topo, busca e filtros logo abaixo.

### Tablet

- Sidebar menor ou colapsável (via drawer).
- Grid com **2 ou 3 colunas** (`sm:grid-cols-2 lg:grid-cols-3`).

### Mobile

- Sidebar vira **menu hambúrguer** (drawer lateral) — há também barra de topo com logo + atalho de favoritos.
- Grid **1 coluna** em telas pequenas, **2 colunas** em telas maiores.
- Filtros em **scroll horizontal** (chips não quebram linha).
- Hero mais compacto (padding e fonte reduzidos).

### Espaçamento

- Gap entre cards: `gap-4` (mobile) → `gap-5` (desktop).
- Padding interno de seções: `py-6 lg:py-8`.
- Cards: `p-4` no corpo.

---

## 6. Tela de Login

Tela de login elegante, primeira porta de entrada do acervo.

### Layout

- Fundo escuro com **gradiente roxo/rosa/ciano** (imagem de fundo `login-bg.jpg` + veil gradiente).
- **Card central** em glassmorphism.
- Logo do PromptVault no topo-esquerda da tela.
- Campos de **e-mail** e **código de acesso**.
- Botão principal "Acessar galeria".

### Card

- `max-width: 420px`
- `border-radius: 24px`
- Padding confortável (`p-7 sm:p-9`)
- `backdrop-filter: blur(22px)` (`.glass-strong`)
- Borda sutil `rgba(255,255,255,0.12)`
- Glow suave (`glow-soft`)

### Conteúdo

- **Badge de acesso protegido** no topo do card.
- **Título:** "Entre no seu acervo de prompts"
- **Subtexto:** "Use o e-mail da compra e o código recebido para acessar."
- **Campo 1:** "Seu e-mail" (com ícone de envelope)
- **Campo 2:** "Código de acesso" (com ícone de cadeado, tracking widowed)
- **Microcopy:** "O código é enviado após a compra. Caso não encontre, verifique seu e-mail ou suporte."

### Campos

- Fundo escuro (`bg-white/5`).
- Borda sutil (`border-white/10`).
- **Foco com glow roxo/ciano** (ring primário).
- Altura `h-11` para toque confortável.

### Botão principal

- Gradiente rosa/roxo (`.bg-brand-gradient`).
- Hover com brilho (`glow-purple`).
- Texto branco, peso 600.
- Estado loading: "Entrando..."

### Validação

- Campos vazios ou e-mail sem `@` → toast de erro "Preencha seu e-mail e código de acesso."
- Sucesso → toast "Acesso liberado. Bem-vindo ao seu acervo." + acesso salvo em `localStorage`.

---

## 7. Sidebar

A sidebar deve parecer premium e funcional.

### Elementos

- **Logo/nome** no topo (PromptVault + subtítulo "TikTok Shop").
- **Menu principal** com seção "Navegação".
- **Categorias:** Todos os prompts, Imagem, Vídeo, UGC, POV, Selfie, Roupas, Produto na mão, Look no corpo, Favoritos, Atualizações.
- **Contadores** por item (ex.: `POV (12)`, `Selfie (8)`, `UGC (15)`).
- **Seção inferior:** Minha conta, Suporte, Sair.

### Estilo

- Fundo `#090912` com `backdrop-blur-xl`.
- Borda direita sutil (`border-white/5`).
- Ícones pequenos em container quadrado arredondado (`h-8 w-8`).
- **Item ativo:** fundo roxo translúcido (`bg-white/10`) + ícone com gradiente de marca + texto branco.
- **Item inativo:** texto secundário, hover suave (`bg-white/5`).
- Contadores em pill `text-[11px]` com fundo translúcido.

### Interações

- Clique no item → filtra a galeria e (no mobile) fecha o drawer.
- Minha conta → toast com e-mail conectado.
- Suporte → toast com instruções de contato.
- Sair → limpa `localStorage` de auth e retorna ao login.

### Mobile

- Sidebar some (`display: none` em `lg:`).
- Aberta via **Sheet** (drawer lateral direito), mesma estrutura visual.

---

## 8. Hero da Galeria

Hero visual no topo da galeria — cabeçalho de app, **não** página de vendas.

### Fundo

- Gradiente radial roxo/rosa/ciano (glows nos cantos).
- Glow suave (`blur-3xl`, opacidade 50–60%).
- Textura digital discreta (via gradient veil).
- **Glassmorphism** (`.glass-strong`).

### Conteúdo

- **Badge pequeno:** "ACERVO EXCLUSIVO DE PROMPTS".
- **Título grande:** "Galeria de Prompts" — com "Prompts" em gradiente de marca.
- **Subheadline curta:** "Escolha uma referência, copie o prompt e use como base para criar seus vídeos de TikTok Shop e Shopee com IA."
- **Botão "Ver favoritos"** (secundário, pill) com contador quando há favoritos.

### Altura

O hero **não** deve ocupar altura exagerada. Deve parecer cabeçalho de app — padding `py-8 sm:py-10`, conteúdo limitado a `max-w-2xl`.

---

## 9. Busca e Filtros

### Campo de busca

- Largura total (flex-1).
- Fundo glass (`bg-white/5`).
- Borda sutil (`border-white/10`).
- Ícone de lupa à esquerda.
- Placeholder: "Buscar prompt por título, categoria ou objetivo…"
- Botão de limpar (X) quando há texto.
- No mobile, precedido pelo botão hambúrguer.

### Filtros (chips)

- Chips horizontais em linha, **scroll horizontal** no mobile (`overflow-x-auto`).
- **Chip ativo:** gradiente roxo/rosa (`.bg-brand-gradient`), texto branco, glow sutil.
- **Chip inativo:** fundo translúcido (`bg-white/5`), texto secundário, hover `bg-white/10`.
- Cada chip mostra **contador** (ex.: `Vídeo 6`).
- Chips disponíveis: Todos, Imagem, Vídeo, UGC, POV, Selfie, Roupas, Produto, TikTok Shop, Shopee, Favoritos.

### Comportamento

- Busca filtra por título, categoria, tipo, descrição e tags.
- Trocar filtro ou busca reseta a paginação ("Ver mais").

---

## 10. Cards de Prompts

### Dimensões e proporção

- Proporção visual **vertical**.
- Imagem no topo, conteúdo abaixo, botão copiar no rodapé.
- Imagem: `aspect-[4/3]` por padrão (adaptável a 4:5 ou 9:16 conforme o arquivo).
- `object-fit: cover`, **lazy loading**, cantos superiores arredondados (overflow hidden no card).

### Estilo

- Fundo glass (`.glass`).
- `border-radius: 18px–22px` (`rounded-2xl`).
- Borda `rgba(255,255,255,0.08)`.
- `overflow: hidden`.
- **Hover:** leve elevação (`-translate-y-1`), borda mais visível, sombra suave, imagem com `scale-105` lento.

### Imagem

- `aspect-[4/3]` container.
- `object-cover`.
- `loading="lazy"` + `decoding="async"`.
- Gradiente veil no rodapé da imagem para legibilidade dos overlay.

### Badge de tipo

- No **canto superior esquerdo** da imagem.
- Cor baseada no tipo:

| Tipo    | Cor de fundo          | Cor de texto |
| ------- | ---------------------- | ------------ |
| Imagem  | ciano translúcido      | ciano        |
| Vídeo   | rosa translúcido       | rosa         |
| POV     | roxo translúcido       | roxo         |
| Selfie  | lilás translúcido      | lilás        |
| UGC     | verde/azul suave       | ciano        |

- Ícone pequeno (filme para vídeo, imagem para os demais).
- `backdrop-blur-md` para legibilidade sobre a imagem.

### Favorito

- No **canto superior direito** da imagem.
- Ícone coração.
- Fundo preto translúcido (`bg-black/30`), borda sutil.
- Estado ativo: rosa preenchido (`fill-current`), escala 110%.
- Animação curta na transição.

### Conteúdo textual

- **Título:** `14px–16px`, peso 700 (`font-semibold`), branco, `line-clamp-1`.
- **Descrição:** `12px–13px` (`text-sm`), cinza (`text-muted-foreground`), `line-clamp-2`.
- **Tags:** pequenas (`text-[11px]`), fundo translúcido (`bg-white/5`), texto ciano/lilás. Máximo 4 visíveis.

### Botão copiar

- Largura total (`flex-1`).
- Gradiente roxo/rosa (`.bg-brand-gradient`).
- `border-radius: 12px` (`rounded-md`/`rounded-lg`).
- Texto "Copiar prompt".
- Ícone de copiar → vira check "Copiado" por 1.6s.
- Estado secundário "Detalhes" ao lado (outline glass).

---

## 11. Modal de Detalhes

Modal premium em glassmorphism.

### Desktop

- Largura máxima **900px** (`max-w-4xl`).
- **Imagem à esquerda**, prompt e detalhes à direita (grid 2 colunas).
- Altura limitada a `92vh` com scroll interno na coluna de detalhes.

### Mobile

- Modal em **coluna** (single column).
- Imagem no topo (altura fixa `h-56 sm:h-72`).
- Prompt e ações abaixo.

### Elementos

- **Título** (peso 600, `text-xl sm:text-2xl`).
- **Badge** de tipo (mesma paleta dos cards).
- **Tags** e categoria em pills.
- **Descrição** completa.
- **Prompt completo** em caixa de código.
- **Botão copiar** (primário, largura total).
- **Botão favoritar** (secundário, alterna label Favoritar/Favoritado).
- **Botão fechar** (X no canto superior direito).

### Caixa de prompt

- Fundo `#050509` (`bg-black/40`).
- Borda sutil (`border-white/10`).
- Fonte **monoespaçada** (`font-mono`).
- `whitespace-pre-wrap break-words`.
- **Scroll interno** se o prompt for longo (`max-h-64 overflow-auto`).
- Boa legibilidade (`text-[13px] leading-relaxed`).
- Botão flutuante "Copiar" no canto superior direito da caixa.

### Fechamento

- Clicar no X, clicar fora ou pressionar **ESC**.

---

## 12. Botões

### Botão principal

- Gradiente rosa/roxo (`.bg-brand-gradient`).
- Texto branco, peso 600–700.
- `border-radius: 12px–999px` (retangular para CTAs, pill para filtros).
- Hover: **glow** (`glow-purple`) + leve redução de opacidade.
- Active: `scale(0.98)`.

### Botão secundário

- Fundo glass (`bg-white/5`).
- Borda sutil (`border-white/10`).
- Texto claro (`text-foreground`).
- Hover: `bg-white/10`.

### Botão copiar

- **Sempre muito visível** — nunca esconder a ação principal.
- Largura total nos cards e no modal.
- Cor de marca para atrair o toque.

### Estados

- `disabled` com opacidade reduzida e cursor não-permitido.
- Loading com spinner/texto "Entrando...".

---

## 13. Carrossel / Ver Mais

### Carregamento progressivo

- Mostrar **9 prompts** inicialmente (`PAGE_SIZE = 9`).
- Botão **"Ver mais prompts"** centralizado ao final do grid.
- Ao clicar, carrega +9 cards.
- Botão some quando não há mais prompts.

### Estilo do botão

- Centralizado (`flex justify-center`).
- Pill (`rounded-full`), outline glass, `h-11`.
- Ícone de chevron-down.

### Animação

- Transição suave ao carregar novos cards (fade-in via `animate-fade-in`).
- Sem skeletons pesados — os novos cards simplesmente entram com fade.

### Reset de paginação

- Trocar filtro, busca ou categoria reseta a paginação para 9.

---

## 14. Microinterações

### Usar

- **Hover suave** nos cards (elevação + borda + scale da imagem).
- **Brilho leve** nos botões principais (glow-purple).
- **Toast** ao copiar / favoritar / remover.
- **Transição no modal** (fade + zoom via Radix Dialog).
- **Filtros com estado ativo claro** (gradiente vs. translúcido).
- **Favorito com animação curta** (scale do ícone + fill).
- **Fade-in** na entrada de novos cards e telas.

### Evitar

- Animações pesadas (parallax, morphing complexo).
- Excesso de movimento.
- Efeitos que prejudiquem performance ou distraiam da ação principal.
- Carregamentos automáticos de vídeo dentro dos cards.

---

## 15. Toasts

### Posicionamento

- **Desktop:** canto superior direito.
- **Mobile:** embaixo.
- Implementado via **Sonner**, tema dark, com `richColors` e closeButton.

### Estilo

- Fundo escuro (`oklch(0.16 0.014 285 / 0.95)`).
- Borda roxa/ciano sutil.
- Texto branco.
- Ícone de check para sucesso.
- `backdrop-filter: blur(16px)`.

### Mensagens padrão

| Evento              | Mensagem                              | Tipo    |
| ------------------- | ------------------------------------- | ------- |
| Copiar prompt       | "Prompt copiado com sucesso."         | sucesso |
| Adicionar favorito  | "Adicionado aos favoritos."           | sucesso |
| Remover favorito    | "Removido dos favoritos."             | neutro  |
| Login falho         | "Preencha seu e-mail e código de acesso." | erro |
| Login sucesso       | "Acesso liberado. Bem-vindo ao seu acervo." | sucesso |
| Logout              | "Você saiu do acervo. Até logo!"      | sucesso |

---

## 16. Responsividade

### Abordagem

**Mobile-first.** Todos os componentes são desenhados primeiro para telas pequenas e potencializados em breakpoints maiores.

### Breakpoints

| Breakpoint | Largura  | Comportamento                                       |
| ---------- | -------- | --------------------------------------------------- |
| mobile     | `360px+` | 1 coluna, drawer, hero compacto                     |
| `sm`       | `640px+` | 2 colunas de cards                                  |
| `lg`       | `1024px+`| sidebar fixa visível, 3 colunas                     |
| `xl`       | `1280px+`| 4 colunas                                           |
| wide       | `1440px+`| área principal com max-width confortável            |

### Mobile

- Hero compacto (padding e fonte reduzidos).
- Busca próxima ao topo (com hambúrguer à esquerda).
- Filtros com **scroll horizontal**.
- Cards: **1 coluna** em telas pequenas, **2 colunas** em telas maiores.
- Modal em **tela cheia** (coluna única, imagem no topo).
- Barra de topo fixa com logo + atalho de favoritos (com badge de contagem).

### Desktop

- Sidebar fixa visível.
- Grid de **4 colunas** em `xl`.
- Modal dividido (imagem | detalhes).
- Área principal com `max-width` confortável e padding generoso.

---

## 17. Acessibilidade

### Garantir

- **Contraste bom** em todo texto (mínimo AA).
- **Textos legíveis** — tamanho mínimo 11px para metadados, 13px+ para conteúdo.
- **Botões com labels claros** — texto visível, não só ícone (ícones têm `aria-label`).
- **Navegação por teclado** — todos os interativos alcançáveis via Tab.
- **Foco visível** — `focus-visible:ring` com cor de marca.
- **Imagens com alt text** descritivo (título do prompt).
- **Modais fecháveis com ESC** (Radix Dialog nativo).
- **Atributos ARIA** apropriados (`role="dialog"`, `aria-label`, `sr-only` onde necessário).
- **Targets de toque** mínimos de 44px em mobile.

### Estrutura semântica

- `header`, `main`, `nav`, `section`, `article`, `footer`.
- Hierarquia de headings correta (H1 no hero, H3 nos cards).
- `lang="pt-BR"` no `<html>`.

---

## 18. Performance

### Priorizar

- **Imagens otimizadas** — formato JPEG/WebP, tamanho 1024x1024.
- **Lazy loading** em todas as imagens de cards (`loading="lazy"`).
- **Decoding assíncrono** (`decoding="async"`).
- **Evitar vídeos automáticos** dentro dos cards.
- **Carregar só os prompts visíveis primeiro** — paginação de 9 em 9.
- **Código limpo** — componentes pequenos, memoização onde relevante.
- **Filtros rápidos** — filtering em memória via `useMemo`.
- **Persistência leve** — Zustand com `persist` middleware (localStorage).
- **Sem dependências pesadas** de animação — apenas Framer Motion quando necessário.

### Otimizações implementadas

- Background com glows radiais fixos (uma única camada, `background-attachment: fixed`).
- Scrollbar customizada leve (`scrollbar-premium`).
- Transições via CSS/Tailwind, não JS.
- Store seletiva (assinaturas por seletor evitam re-renders desnecessários).

---

## 19. Personalidade da Interface

### Sensação desejada

A interface deve parecer:

> **"Um cofre visual de prompts prontos."**

- **Organizado** — cada coisa em seu lugar, contadores visíveis, filtros claros.
- **Exclusivo** — acervo protegido por login, identidade de marca forte.
- **Moderno** — dark premium, glassmorphism, neon elegante.
- **Fácil de usar** — copiar em um toque, favoritar com um gesto.
- **Premium** — espaçamento generoso, tipografia cuidada, brilho contido.
- **Rápido** — carregamento progressivo, feedback imediato.

### Evitar sensação

- genérica;
- fria demais;
- confusa;
- cheia de texto;
- plataforma escolar antiga.

### Tom de microcopy

- Direto e acolhedor.
- Sem jargão técnico desnecessário.
- Foco na ação do usuário ("Copiar prompt", "Ver detalhes", "Ver favoritos").
- Sem promessas de faturamento nem linguagem de vendas.

---

## Apêndice — Tokens de implementação

### Classes utilitárias customizadas (`globals.css`)

| Classe                | Descrição                                              |
| --------------------- | ------------------------------------------------------ |
| `.glass`              | Superfície translúcida com blur 16px                   |
| `.glass-strong`       | Superfície translúcida com blur 22px (cards, modal)    |
| `.bg-brand-gradient`  | Gradiente roxo → rosa → ciano                          |
| `.text-gradient-brand`| Texto com gradiente de marca (clip)                    |
| `.glow-purple`        | Box-shadow com glow roxo                               |
| `.glow-soft`          | Sombra suave de profundidade                           |
| `.scrollbar-premium`  | Scrollbar fina translúcida                             |
| `.animate-fade-in`    | Fade-in + translateY suave                             |

### Variáveis CSS de marca

```css
--brand-purple: oklch(0.62 0.24 300);  /* ~#A855F7 */
--brand-pink:   oklch(0.72 0.24 350);  /* ~#FF2E88 */
--brand-cyan:   oklch(0.78 0.16 195);  /* ~#22D3EE */
```

### Estrutura de dados do prompt

```ts
interface Prompt {
  id: string;
  title: string;
  type: "Imagem" | "Vídeo" | "POV" | "Selfie" | "UGC";
  category: string;
  description: string;
  tags: string[];
  image: string;
  prompt: string;
  recommended?: boolean;
}
```

---

_Documento vivo — atualize conforme a interface evoluir. O PromptVault é um acervo; este design system é o cofre que o organiza._
