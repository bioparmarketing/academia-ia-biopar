# AGENTS.md — Academia de IA BioPar

Este arquivo define as regras arquiteturais, pedagógicas e de segurança do projeto.
Agentes de IA e desenvolvedores devem respeitar estas diretrizes.

---

## Objetivo do Produto

A **Academia de IA BioPar** é uma plataforma de treinamento interno que ensina colaboradores a utilizar Inteligência Artificial de forma eficiente, crítica e responsável. O foco é o aprendizado prático e progressivo, com Tutor IA que ensina — não apenas responde.

**Primeiro curso**: IA aplicada ao PDI  
**Subtítulo**: Aprenda IA usando a própria IA.

---

## Fluxo Principal

```
LOGIN → HOME (10 módulos) → MÓDULO → TUTOR IA → AVALIAÇÃO → CONCLUSÃO → PROGRESSO SALVO → ADMIN
```

---

## Stack Tecnológica

| Tecnologia | Uso |
|---|---|
| Next.js (App Router) | Framework principal |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilo |
| Supabase | Banco de dados, autenticação, RLS |
| PostgreSQL | Banco relacional (via Supabase) |
| OpenAI API | Tutor IA (server-side) |
| Vercel | Deploy e hosting |

> ⚠️ **Regra**: Não substituir tecnologias sem justificativa documentada neste arquivo.

---

## Arquitetura

```
src/
├── app/
│   ├── (auth)/login/          ← Autenticação pública
│   ├── (student)/             ← Área do aluno (requer auth + role=student)
│   ├── admin/                 ← Painel admin (requer auth + role=admin)
│   └── api/
│       ├── tutor/route.ts     ← POST /api/tutor — Server Action OpenAI
│       └── progress/route.ts  ← POST /api/progress
├── components/
├── lib/
│   ├── supabase/              ← Clientes server e client separados
│   └── openai.ts
└── middleware.ts              ← Proteção de rotas por role
```

---

## Estrutura do Banco

### profiles
- id (UUID, FK → auth.users.id), full_name, email, role ('student' | 'admin'), department, created_at

### courses
- id, title, slug, description, active, created_at

### modules
- id, course_id (FK), number, title, description, estimated_minutes, content (jsonb), active

### activities
- id, module_id (FK), activity_type ('content' | 'ai_practice' | 'quiz'), title, instructions, content (jsonb), sequence

### user_progress
- id, user_id (FK), course_id (FK), module_id (FK), status ('not_started' | 'in_progress' | 'completed'), started_at, completed_at, score

### activity_attempts
- id, user_id (FK), activity_id (FK), answer, score, feedback, attempt_number, created_at

> ⚠️ **Regra**: Não adicionar tabelas sem necessidade concreta documentada.

---

## Regras de Segurança

- SUPABASE_SERVICE_ROLE_KEY: nunca exposta ao browser
- OPENAI_API_KEY: nunca exposta ao browser
- Secrets nunca em commits (.env.local no .gitignore)
- Students: leem apenas seu próprio progresso e atividades
- Admins: leem tudo
- /api/tutor: valida sessão antes de chamar OpenAI

---

## Regras Pedagógicas do Tutor IA

O Tutor IA ensina — não simplesmente entrega respostas.

1. Identificar o que o aluno fez corretamente
2. Identificar o que faltou
3. Explicar de maneira curta e didática
4. Incentivar nova tentativa quando houver margem de melhoria
5. Não reescrever o exercício pelo aluno imediatamente
6. Ser claro, objetivo e didático
7. Não inventar referências, números ou evidências
8. Em pesquisa científica: diferenciar espécie, cepa/isolado e produto comercial
9. Não atribuir resultados de espécie automaticamente a cepa específica ou produto
10. Priorizar aprendizagem

> ⚠️ **Regra**: Não alterar o comportamento pedagógico do Tutor IA sem atualizar esta especificação.

---

## Modo MOCK

Quando AI_MOCK_MODE=true, a API /api/tutor retorna resposta simulada sem chamar OpenAI.

---

## Perfis de Usuário

- student: /, /modules/[id], /api/tutor, /api/progress
- admin: tudo acima + /admin, /admin/users/[id]

---

## Regras Gerais

1. Não adicionar dependências sem necessidade concreta
2. Não substituir tecnologias definidas sem justificar
3. Não alterar comportamento pedagógico sem atualizar esta especificação
4. Não expor secrets ao browser
5. Não usar localStorage como fonte oficial de progresso — sempre Supabase
6. Não declarar funcionalidade pronta sem testá-la
7. Preferir Server Components quando apropriado
8. Operações sensíveis sempre server-side
9. Commits pequenos e descritivos
10. npm run build deve terminar sem erros antes de qualquer deploy
