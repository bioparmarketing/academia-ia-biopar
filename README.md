# Academia de IA BioPar

> Plataforma de treinamento interno que ensina colaboradores a utilizar Inteligência Artificial de forma eficiente, crítica e responsável.

**Aprenda IA usando a própria IA.**

---

## Arquitetura

- **Framework**: Next.js 15+ (App Router, TypeScript)
- **Estilo**: Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Auth + RLS)
- **IA**: OpenAI API (server-side only)
- **Deploy**: Vercel

```
src/
├── app/
│   ├── (auth)/login/          ← Tela de login
│   ├── (student)/             ← Área do aluno (protegida)
│   │   ├── page.tsx           ← Home com lista de módulos
│   │   └── modules/[id]/      ← Módulo com steps
│   ├── admin/                 ← Painel administrativo
│   └── api/
│       ├── tutor/             ← POST /api/tutor (OpenAI server-side)
│       └── progress/          ← POST /api/progress
├── components/
│   ├── ui/                    ← Componentes base
│   ├── module/                ← Steps do módulo
│   └── admin/                 ← Componentes admin
└── lib/
    ├── supabase/              ← Clientes server/client
    └── openai.ts              ← Integração OpenAI

supabase/migrations/
├── 001_schema.sql             ← Tabelas
├── 002_rls.sql                ← Row Level Security
└── 003_seed.sql               ← Dados iniciais
```

---

## Como Instalar

```bash
git clone https://github.com/seu-usuario/academia-ia-biopar.git
cd academia-ia-biopar
npm install
cp .env.example .env.local
```

---

## Como Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Acesse **Settings → API** e copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public key` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`
3. Preencha o `.env.local` com esses valores

---

## Como Configurar OpenAI

1. Acesse [platform.openai.com](https://platform.openai.com/api-keys)
2. Crie uma API key
3. Adicione no `.env.local`:
   ```
   OPENAI_API_KEY=sk-...
   AI_MOCK_MODE=false
   ```

> **Desenvolvimento sem OpenAI**: defina `AI_MOCK_MODE=true` para usar respostas simuladas.

---

## Como Executar Localmente

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## Como Rodar as Migrations

As migrations estão em `supabase/migrations/`. Execute via Supabase CLI ou cole manualmente no **SQL Editor** do dashboard:

```bash
# Com Supabase CLI
supabase db push

# Ou manualmente: cole cada arquivo SQL no dashboard
# https://supabase.com/dashboard/project/SEU_PROJECT_REF/sql
```

Ordem de execução:
1. `001_schema.sql`
2. `002_rls.sql`
3. `003_seed.sql`

---

## Como Criar o Primeiro Administrador

Após aplicar as migrations:

1. Crie o usuário no **Supabase Dashboard → Authentication → Users**
2. Anote o UUID do usuário criado
3. Execute no SQL Editor:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = 'UUID_DO_USUARIO';
   ```

---

## Como Fazer Deploy na Vercel

1. Push para o GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `AI_MOCK_MODE=false`
4. Deploy automático ao fazer push em `main`

---

## Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave anon pública do Supabase | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role (apenas server-side) | ✅ |
| `OPENAI_API_KEY` | Chave da API OpenAI | Não em modo MOCK |
| `AI_MOCK_MODE` | `true` = respostas simuladas, `false` = OpenAI real | ✅ |

---

## Estrutura do Curso

**Curso**: IA aplicada ao PDI

| # | Módulo | Status |
|---|---|---|
| 1 | Entendendo a Inteligência Artificial | ✅ Implementado |
| 2 | Como conversar com uma IA | ✅ Implementado |
| 3 | Anatomia de um bom prompt | ✅ Implementado |
| 4 | IA aplicada à pesquisa | ✅ Implementado |
| 5 | IA aplicada à pesquisa científica | ✅ Implementado |
| 6 | Análise de documentos com IA | ✅ Implementado |
| 7 | Escrita e estruturação de trabalhos | ✅ Implementado |
| 8 | Como identificar erros da IA | ✅ Implementado |
| 9 | Técnicas intermediárias de uso | ✅ Implementado |
| 10 | Desafio prático PDI | ✅ Implementado |
