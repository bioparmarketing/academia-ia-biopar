-- ============================================================
-- 003_seed.sql — Dados iniciais
-- Academia de IA BioPar
-- ============================================================

-- ============================================================
-- CURSO: IA aplicada ao PDI
-- ============================================================
INSERT INTO public.courses (id, title, slug, description, active)
VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'IA aplicada ao PDI',
  'ia-aplicada-pdi',
  'Aprenda a usar inteligência artificial de forma eficiente, crítica e responsável para potencializar seu desenvolvimento profissional.',
  TRUE
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- MÓDULOS (10 módulos, conteúdo completo apenas no módulo 1)
-- ============================================================

-- Módulo 1: Entendendo a Inteligência Artificial (COMPLETO)
INSERT INTO public.modules (id, course_id, number, title, description, estimated_minutes, content, active)
VALUES (
  'b1b2c3d4-0001-0000-0000-000000000001',
  'a1b2c3d4-0000-0000-0000-000000000001',
  1,
  'Entendendo a Inteligência Artificial',
  'Compreenda as possibilidades, limitações e riscos básicos do uso de IA.',
  20,
  '{
    "objective": "Compreender possibilidades, limitações e riscos básicos do uso de IA generativa.",
    "steps": [
      {
        "type": "content",
        "title": "O que é IA generativa?",
        "body": "IA generativa trabalha com padrões e pode ajudar a organizar ideias, resumir informações, comparar textos, estruturar pesquisas e melhorar a escrita.",
        "highlight": "Uma resposta bem escrita não significa automaticamente que esteja correta.",
        "cta": "Conhecer as limitações"
      },
      {
        "type": "limitations",
        "title": "Limitações importantes",
        "cards": [
          { "icon": "warning", "text": "A IA pode apresentar informações incorretas." },
          { "icon": "warning", "text": "Pode confundir contexto, datas ou fontes." },
          { "icon": "warning", "text": "Pode extrapolar além do que uma evidência permite." },
          { "icon": "success", "text": "Quanto melhor o contexto fornecido, melhores tendem a be as respostas." }
        ],
        "cta": "Ir para a prática"
      },
      {
        "type": "ai_practice",
        "title": "Hora de praticar",
        "instructions": "Escreva um pedido para a IA realizar uma pesquisa sobre um microrganismo agrícola.",
        "hints": ["objetivo", "contexto", "tipo de fonte", "formato desejado"],
        "placeholder": "Ex: Quero um resumo sobre o uso de Bacillus subtilis em culturas de soja, focando em efeitos sobre produtividade. Priorize artigos científicos dos últimos 5 anos. Apresente em tópicos."
      },
      {
        "type": "quiz",
        "title": "Avaliação rápida",
        "question": "Ao receber uma resposta técnica da IA, você deve:",
        "options": [
          { "id": "A", "text": "Aceitar se estiver bem escrita." },
          { "id": "B", "text": "Verificar pontos críticos, fontes e limites da evidência." },
          { "id": "C", "text": "Pedir uma resposta mais confiante." }
        ],
        "correct": "B",
        "explanation": "Uma resposta bem escrita não significa que seja correta. Sempre verifique fontes, contexto e se as afirmações são razoáveis para o que foi perguntado. A IA pode errar mesmo com linguagem fluente e confiante."
      }
    ]
  }'::jsonb,
  TRUE
)
ON CONFLICT (course_id, number) DO NOTHING;

-- Módulos 2-10 (apenas títulos e descrições — conteúdo será adicionado progressivamente)
INSERT INTO public.modules (course_id, number, title, description, estimated_minutes, active)
VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 2,  'Como conversar com uma IA',             'Aprenda a estruturar pedidos claros e obter melhores resultados.',      20, TRUE),
  ('a1b2c3d4-0000-0000-0000-000000000001', 3,  'Anatomia de um bom prompt',             'Entenda os elementos que compõem um prompt eficaz.',                    20, TRUE),
  ('a1b2c3d4-0000-0000-0000-000000000001', 4,  'IA aplicada à pesquisa',               'Use IA para pesquisar, organizar e sintetizar informações.',             20, TRUE),
  ('a1b2c3d4-0000-0000-0000-000000000001', 5,  'IA aplicada à pesquisa científica',    'Aplique IA para navegar na literatura científica com senso crítico.',    20, TRUE),
  ('a1b2c3d4-0000-0000-0000-000000000001', 6,  'Análise de documentos com IA',         'Extraia insights de documentos técnicos usando IA.',                    20, TRUE),
  ('a1b2c3d4-0000-0000-0000-000000000001', 7,  'Escrita e estruturação de trabalhos',  'Use IA para redigir, revisar e estruturar textos profissionais.',        20, TRUE),
  ('a1b2c3d4-0000-0000-0000-000000000001', 8,  'Como identificar erros da IA',         'Desenvolva senso crítico para detectar erros e alucinações.',           20, TRUE),
  ('a1b2c3d4-0000-0000-0000-000000000001', 9,  'Técnicas intermediárias de uso',       'Domine técnicas avançadas de prompt e fluxos de trabalho com IA.',      20, TRUE),
  ('a1b2c3d4-0000-0000-0000-000000000001', 10, 'Desafio prático PDI',                  'Aplique tudo que aprendeu em um projeto integrador de PDI.',            20, TRUE)
ON CONFLICT (course_id, number) DO NOTHING;

-- ============================================================
-- ATIVIDADES do Módulo 1
-- ============================================================
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
VALUES
  (
    'b1b2c3d4-0001-0000-0000-000000000001',
    'content',
    'O que é IA generativa?',
    NULL,
    '{"step": 0}'::jsonb,
    1
  ),
  (
    'b1b2c3d4-0001-0000-0000-000000000001',
    'content',
    'Limitações importantes',
    NULL,
    '{"step": 1}'::jsonb,
    2
  ),
  (
    'b1b2c3d4-0001-0000-0000-000000000001',
    'ai_practice',
    'Hora de praticar',
    'Escreva um pedido para a IA realizar uma pesquisa sobre um microrganismo agrícola.',
    '{"step": 2}'::jsonb,
    3
  ),
  (
    'b1b2c3d4-0001-0000-0000-000000000001',
    'quiz',
    'Avaliação rápida',
    'Responda a questão abaixo sobre o uso responsável de IA.',
    '{"step": 3}'::jsonb,
    4
  )
ON CONFLICT (module_id, sequence) DO NOTHING;
