<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Financasa — Contexto do Projeto

Projeto Next.js 16 + React 19 + Tailwind v4. App de controle financeiro familiar.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + React Compiler
- Tailwind CSS v4 (`@theme inline`, CSS-first config)
- shadcn/ui adaptado (tw-animate-css)
- Supabase (auth + db)
- Vitest para testes

## Regras absolutas

- **Apenas CSS, classes Tailwind e JSX estrutural. NADA de lógica.**
- `@variant dark` no `globals.css` é intocável
- Após cada passo: `npm run lint && npm run build && npm run test`
- NÃO commitar sem solicitação explícita
- Após cada prompt, fornecer título + descrição para commit

## Paleta monocromática (globals.css)

- **Light mode:** fundo `#FFFFFF`, primary `#0F1115` (preto), cards brancos
- **Dark mode:** fundo `#0F1115`, primary `#F9FAFB` (branco), cards `#2D2F36`
- **Ring/foco:** `#3B82F6` (azul acessibilidade)
- **Cores semânticas (NÃO ALTERAR):** `--income` (verde), `--expense` (vermelho), `--paid`, `--pending`, `--overdue`, `--progress-*`
- **Zero `brand-*`** em todo o código
- Botões primários: `bg-primary text-primary-foreground hover:bg-[#2D2F36] dark:hover:bg-[#3D3F47]`
- Sidebar item ativo: `menu-item-active` (borda esquerda `border-primary`, fundo `bg-primary/8`)
- MonthlyBudgetCard: gradiente `#0F1115 → #2D2F36`, dark mode inverte

## Componentes principais

| Componente | Arquivo |
|---|---|
| Logo (SVG casa geométrica) | `components/shared/logo.tsx` |
| Sidebar | `components/layout/sidebar.tsx` |
| Header | `components/layout/header.tsx` |
| BottomNav (mobile) | `components/layout/bottom-nav.tsx` |
| MonthlyBudgetCard | `components/dashboard/monthly-budget-card.tsx` |
| Auth layout (login/cadastro) | `app/(auth)/layout.tsx` |

## Ícones e favicon

- Ícones em `public/financasa-icons/` (13 arquivos: favicon, apple-touch-icon, PWA 72-512px + maskable)
- Metadata configurado em `app/layout.tsx:13-44`
- Caminhos: `/financasa-icons/favicon.ico`, `/financasa-icons/icon-192x192.png`, etc.

## Erros existentes (pré-existentes — não corrigir nesta task)

**8 erros** em `app/(dashboard)/page.tsx` (lines 94-120):
- `Avoid constructing JSX within try/catch` (react-hooks/error-boundaries)
- Causa: O JSX de retorno do dashboard está dentro de um bloco `try {}` (line 40-121). React não renderiza componentes imediatamente, então erros de renderização não são capturados pelo try/catch.
- Solução: Extrair o JSX para fora do try/catch, ou usar um Error Boundary (`error.tsx` na mesma rota).

**8 warnings** (pré-existentes):
| Arquivo | Warning |
|---|---|
| `components/contas/bills-history.tsx:8,52` | `cn`, `currentMonth`, `currentYear` não usados |
| `components/contas/new-bill-modal.tsx:95` | React Hook Form `watch()` não memoizável |
| `components/dashboard/upcoming-bills.tsx:20` | `month` não usado |
| `components/metas/metas-client.tsx:369` | React Hook Form `watch()` não memoizável |
| `components/shared/person-avatar.tsx:44` | `<img>` ao invés de `<Image />` |
| `components/transacoes/new-transaction-modal.tsx:69` | React Hook Form `watch()` não memoizável |

## Comandos

```bash
npm run lint     # ESLint
npm run build    # Next.js build (Turbopack)
npm run test     # Vitest (142 testes, 13 suites)
```
