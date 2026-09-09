-- ============================================================
-- 004_complete_course_modules.sql — Conteúdo dos Módulos 2 a 10
-- Academia de IA BioPar
-- ============================================================

-- Módulo 2: Como conversar com uma IA
UPDATE public.modules
SET content = '{
  "objective": "Aprender a estruturar pedidos claros, iterativos e contextualizados para obter respostas assertivas.",
  "steps": [
    {
      "type": "content",
      "title": "Comunicação clara e iterativa com IA",
      "body": "Interagir com uma IA é um diálogo construtivo, não um jogo de adivinhação. Comandos genéricos forçam o modelo a presumir intenções. Os melhores resultados em PDI ocorrem quando você define o cenário, fornece premissas de partida e refina a resposta em etapas sucessivas.",
      "highlight": "A IA não conhece o contexto não dito da sua pesquisa. O que é óbvio para você precisa ser explicitado na mensagem.",
      "cta": "Ver armadilhas na conversação"
    },
    {
      "type": "limitations",
      "title": "Armadilhas comuns na conversação",
      "cards": [
        { "icon": "warning", "text": "Comandos vagos e curtos geram respostas superficiais e genéricas." },
        { "icon": "warning", "text": "Tentar resolver múltiplos problemas complexos em uma única mensagem dilui o foco." },
        { "icon": "success", "text": "Refinar a resposta em camadas (conversa iterativa) gera análises muito mais ricas." },
        { "icon": "success", "text": "Fornecer premissas explícitas (ex: tipo de solo, clima, dosagem) elimina retrabalho." }
      ],
      "cta": "Praticar no diálogo"
    },
    {
      "type": "ai_practice",
      "title": "Hora de praticar: Pedido Estruturado",
      "instructions": "Estruture um pedido para a IA orientar um protocolo inicial de avaliação fitossanitária para milho safrinha, indicando objetivo, contexto da lavoura e formato.",
      "hints": ["objetivo específico", "contexto agronômico", "variáveis de avaliação", "formato da resposta"],
      "placeholder": "Ex: Preciso estruturar um protocolo preliminar para monitoramento de cercosporiose em milho safrinha no Centro-Oeste. Detalhe as variáveis de incidência e severidade que devemos registrar a campo. Apresente em formato de lista numerada com orientações práticas."
    },
    {
      "type": "quiz",
      "title": "Avaliação do Módulo 2",
      "question": "Qual das seguintes estratégias produz os melhores resultados ao interagir com uma IA para tarefas técnicas de PDI?",
      "options": [
        { "id": "A", "text": "Fazer perguntas amplas e abertas sem detalhes para testar a criatividade do modelo." },
        { "id": "B", "text": "Fornecer contexto detalhado, premissas de trabalho e refinar a resposta em etapas iterativas." },
        { "id": "C", "text": "Exigir conclusões definitivas já no primeiro comando sem fornecer informações preliminares." }
      ],
      "correct": "B",
      "explanation": "A IA atinge seu potencial máximo quando alimentada com premissas claras e quando o pesquisador conduz um diálogo iterativo de refinamento."
    }
  ]
}'::jsonb
WHERE course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND number = 2;

-- Atividades Módulo 2
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'content', 'Comunicação clara e iterativa com IA', NULL, '{"step": 0}'::jsonb, 1 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 2
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'content', 'Armadilhas comuns na conversação', NULL, '{"step": 1}'::jsonb, 2 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 2
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'ai_practice', 'Hora de praticar: Pedido Estruturado', 'Estruture um pedido para a IA orientar um protocolo inicial de avaliação fitossanitária para milho safrinha.', '{"step": 2}'::jsonb, 3 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 2
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, instructions = EXCLUDED.instructions, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'quiz', 'Avaliação do Módulo 2', 'Responda a questão para validar seu aprendizado.', '{"step": 3}'::jsonb, 4 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 2
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, instructions = EXCLUDED.instructions, content = EXCLUDED.content;

-- Módulo 3: Anatomia de um bom prompt
UPDATE public.modules
SET content = '{
  "objective": "Dominar a fórmula dos 5 elementos de um prompt de alta performance: Papel, Contexto, Tarefa, Regras e Formato.",
  "steps": [
    {
      "type": "content",
      "title": "Os 5 blocos fundamentais de um prompt profissional",
      "body": "Um prompt de engenharia não é uma simples pergunta, mas uma especificação de trabalho. Para o PDI da BioPar, adote a estrutura padrão: 1) Papel/Persona (quem a IA simula), 2) Contexto (o cenário e insumo envolvido), 3) Tarefa principal (a ação a realizar), 4) Regras e Restrições (limites e exclusões) e 5) Formato de Saída (tabela, seções, tópicos).",
      "highlight": "Definir o formato de saída e restrições de escopo economiza até 70% do tempo de pós-processamento da equipe.",
      "cta": "Ver o que enfraquece um prompt"
    },
    {
      "type": "limitations",
      "title": "O que enfraquece um prompt",
      "cards": [
        { "icon": "warning", "text": "Falta de restrições claras permite que a IA extrapole o escopo desejado." },
        { "icon": "warning", "text": "Esquecer de especificar o formato gera textos corridos difíceis de reaproveitar em relatórios." },
        { "icon": "success", "text": "Definir uma persona técnica ajusta a precisão do vocabulário e profundidade metodológica." },
        { "icon": "success", "text": "Explicitar regras negativas (o que NÃO fazer) evita respostas óbvias e jargões vazios." }
      ],
      "cta": "Praticar anatomia de prompt"
    },
    {
      "type": "ai_practice",
      "title": "Hora de praticar: Anatomia Completa",
      "instructions": "Crie um prompt utilizando a anatomia de 5 partes (Papel, Contexto, Tarefa, Restrições e Formato) para comparar dois métodos de formulação de biodefensivos líquidos.",
      "hints": ["papel/persona técnica", "contexto de formulação", "tarefa de comparação", "restrições de escopo", "formato em tabela"],
      "placeholder": "Ex: Atue como especialista em formulação de bioinsumos. Estamos desenvolvendo um biofungicida líquido à base de Trichoderma. Compare o método de suspensão concentrada com emulsão em óleo. Restrições: foque apenas em estabilidade de prateleira e facilidade de aplicação. Apresente em uma tabela comparativa com prós e contras."
    },
    {
      "type": "quiz",
      "title": "Avaliação do Módulo 3",
      "question": "Ao estruturar um prompt para a equipe de PDI, qual elemento é fundamental para evitar respostas prolixas e garantir aplicação imediata?",
      "options": [
        { "id": "A", "text": "Utilizar adjetivos como \"perfeito\" e \"urgente\" para exigir qualidade." },
        { "id": "B", "text": "Definir claramente o formato de saída e as restrições de escopo." },
        { "id": "C", "text": "Repetir a mesma solicitação várias vezes utilizando termos sinônimos." }
      ],
      "correct": "B",
      "explanation": "As restrições de escopo delimitam os limites da resposta e a definição clara do formato assegura que o conteúdo chegue pronto para análise técnica."
    }
  ]
}'::jsonb
WHERE course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND number = 3;

-- Atividades Módulo 3
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'content', 'Os 5 blocos fundamentais de um prompt profissional', NULL, '{"step": 0}'::jsonb, 1 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 3
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'content', 'O que enfraquece um prompt', NULL, '{"step": 1}'::jsonb, 2 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 3
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'ai_practice', 'Hora de praticar: Anatomia Completa', 'Crie um prompt utilizando a anatomia de 5 partes.', '{"step": 2}'::jsonb, 3 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 3
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, instructions = EXCLUDED.instructions, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'quiz', 'Avaliação do Módulo 3', 'Responda a questão para validar seu aprendizado.', '{"step": 3}'::jsonb, 4 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 3
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, instructions = EXCLUDED.instructions, content = EXCLUDED.content;

-- Módulo 4: IA aplicada à pesquisa
UPDATE public.modules
SET content = '{
  "objective": "Utilizar IA para mapear tendências, concorrentes e tecnologias no agronegócio com agilidade e senso crítico.",
  "steps": [
    {
      "type": "content",
      "title": "Acelerando a pesquisa e inteligência competitiva",
      "body": "A IA generativa atua como uma aceleradora de pesquisas para estruturar levantamentos de mercado, comparar tecnologias emergentes e mapear concorrentes no setor agrobiológico. Ela é ideal para cruzar características de produtos e desenhar matrizes comparativas em poucos instantes.",
      "highlight": "A IA formula hipóteses e organiza informações públicas, mas jamais substitui a validação de dados comerciais e patentes em fontes primárias.",
      "cta": "Limites na pesquisa"
    },
    {
      "type": "limitations",
      "title": "Limites críticos na pesquisa de dados",
      "cards": [
        { "icon": "warning", "text": "Dados de market share ou números econômicos podem estar defasados pelo corte temporal do modelo." },
        { "icon": "warning", "text": "A IA pode confundir produtos em fase experimental com produtos já registrados comercialmente." },
        { "icon": "success", "text": "Utilize a IA para organizar tabelas comparativas e matrizes SWOT de produtos concorrentes." },
        { "icon": "success", "text": "Instrua a IA a sinalizar expressamente o nível de incerteza de cada informação levantada." }
      ],
      "cta": "Praticar pesquisa com IA"
    },
    {
      "type": "ai_practice",
      "title": "Hora de praticar: Mapeamento Tecnológico",
      "instructions": "Redija um prompt para a IA sintetizar o panorama atual de biofertilizantes à base de microalgas, solicitando categorização por benefícios, desafios tecnológicos e formato estruturado.",
      "hints": ["tema da tecnologia", "contexto de mercado", "desafios e oportunidades", "formato de síntese executiva"],
      "placeholder": "Ex: Realize um levantamento sobre o uso de microalgas como biofertilizantes na agricultura tropical. Identifique os 3 principais mecanismos de ação, as limitações tecnológicas de estabilidade e os principais gargalos de custo. Formate a resposta em uma tabela de síntese executiva para PDI."
    },
    {
      "type": "quiz",
      "title": "Avaliação do Módulo 4",
      "question": "Quando a IA gera uma tabela comparando custos e eficiência de produtos concorrentes, qual a atitude correta do pesquisador de PDI?",
      "options": [
        { "id": "A", "text": "Adotar os valores na íntegra no relatório executivo, pois a IA processa bases de dados globais." },
        { "id": "B", "text": "Usar a estrutura lógica gerada pela IA, mas checar números e registros em fontes oficiais primárias (ex: MAPA)." },
        { "id": "C", "text": "Descartar totalmente a síntese, pois IA generativa não deve ser usada para estruturar inteligência de mercado." }
      ],
      "correct": "B",
      "explanation": "A IA organiza com maestria as categorias de comparação e sintetiza ideias, mas dados quantitativos e registros comerciais demandam validação em fontes oficiais."
    }
  ]
}'::jsonb
WHERE course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND number = 4;

-- Atividades Módulo 4
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'content', 'Acelerando a pesquisa e inteligência competitiva', NULL, '{"step": 0}'::jsonb, 1 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 4
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'content', 'Limites críticos na pesquisa de dados', NULL, '{"step": 1}'::jsonb, 2 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 4
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'ai_practice', 'Hora de praticar: Mapeamento Tecnológico', 'Redija um prompt para a IA sintetizar o panorama atual de biofertilizantes.', '{"step": 2}'::jsonb, 3 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 4
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, instructions = EXCLUDED.instructions, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'quiz', 'Avaliação do Módulo 4', 'Responda a questão para validar seu aprendizado.', '{"step": 3}'::jsonb, 4 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 4
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, instructions = EXCLUDED.instructions, content = EXCLUDED.content;

-- Módulo 5: IA aplicada à pesquisa científica
UPDATE public.modules
SET content = '{
  "objective": "Aplicar IA na leitura e síntese crítica da literatura científica, diferenciando rigorosamente espécies, cepas e evidências.",
  "steps": [
    {
      "type": "content",
      "title": "Rigor científico e literatura acadêmica",
      "body": "A pesquisa científica requer precisão terminológica absoluta. No PDI da BioPar, a IA auxilia na sintetização de abstracts de periódicos (PubMed, Scielo, Scopus), identificação de metodologias e levantamento de variáveis de bioensaios. Contudo, há uma regra de ouro: nunca atribua a uma cepa específica o que a literatura relata apenas para a espécie.",
      "highlight": "Regra BioPar: Diferencie sempre espécie, cepa/isolado e produto comercial. Resultados com Bacillus subtilis genérico NÃO comprovam eficácia de um isolado comercial exclusivo.",
      "cta": "Riscos na literatura científica"
    },
    {
      "type": "limitations",
      "title": "Riscos na literatura científica com IA",
      "cards": [
        { "icon": "warning", "text": "A IA pode inventar referências, autores e DOIs que parecem reais mas não existem (alucinação bibliográfica)." },
        { "icon": "warning", "text": "Generalizações indevidas: transpor resultados de placas de laboratório (in vitro) como garantia de campo (in vivo)." },
        { "icon": "success", "text": "Forneça o texto do artigo ou abstract para a IA analisar, em vez de pedir para ela recordar da literatura de memória." },
        { "icon": "success", "text": "Exija que a IA especifique a cepa testada e o delineamento experimental utilizado nos estudos." }
      ],
      "cta": "Praticar análise científica"
    },
    {
      "type": "ai_practice",
      "title": "Hora de praticar: Síntese de Evidências Científicas",
      "instructions": "Escreva um pedido para a IA analisar o controle de fungos de solo por Trichoderma, exigindo distinção de isolados, condições de ensaio (in vitro vs campo) e formato em tópicos.",
      "hints": ["tema científico delimitado", "distinção de espécie e cepa", "condições de teste experimental", "formato de síntese com ressalvas"],
      "placeholder": "Ex: Quero uma revisão técnica sobre a eficácia de Trichoderma harzianum no controle de Sclerotinia sclerotiorum em soja. Destaque quais cepas foram testadas na literatura, diferencie resultados in vitro de ensaios a campo e liste variáveis climáticas de impacto. Apresente em tópicos com ressalvas metodológicas."
    },
    {
      "type": "quiz",
      "title": "Avaliação do Módulo 5",
      "question": "Por que um pesquisador da BioPar nunca deve extrapolar os benefícios descritos em um artigo de uma espécie bacteriana diretamente para o produto comercial da empresa?",
      "options": [
        { "id": "A", "text": "Porque produtos comerciais não possuem microrganismos vivos após a formulação." },
        { "id": "B", "text": "Porque a eficácia biológica varia substancialmente entre diferentes cepas/isolados e condições de formulação." },
        { "id": "C", "text": "Porque a IA só consegue compreender pesquisas na área de defensivos químicos sintéticos." }
      ],
      "correct": "B",
      "explanation": "Biotecnologia agrícola lida com cepas e isolados específicos. O desempenho de uma espécie em ensaios acadêmicos gerais não garante eficácia equivalente de outro isolado em condições reais de lavoura."
    }
  ]
}'::jsonb
WHERE course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND number = 5;

-- Atividades Módulo 5
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'content', 'Rigor científico e literatura acadêmica', NULL, '{"step": 0}'::jsonb, 1 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 5
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'content', 'Riscos na literatura científica com IA', NULL, '{"step": 1}'::jsonb, 2 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 5
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'ai_practice', 'Hora de praticar: Síntese de Evidências Científicas', 'Escreva um pedido para a IA analisar o controle de fungos de solo.', '{"step": 2}'::jsonb, 3 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 5
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, instructions = EXCLUDED.instructions, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'quiz', 'Avaliação do Módulo 5', 'Responda a questão para validar seu aprendizado.', '{"step": 3}'::jsonb, 4 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 5
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, instructions = EXCLUDED.instructions, content = EXCLUDED.content;

-- Módulo 6: Análise de documentos com IA
UPDATE public.modules
SET content = '{
  "objective": "Extrair parâmetros críticos e dados estruturados de laudos agronômicos, fichas técnicas e relatórios de ensaios sem distorção.",
  "steps": [
    {
      "type": "content",
      "title": "Extração precisa de laudos e ensaios agronômicos",
      "body": "A análise de laudos experimentais exige fidelidade estrita aos dados: doses aplicadas, repetições, coeficiente de variação (CV%), tratamento testemunha e testes de médias (Tukey/Scott-Knott). A IA é uma aliada valiosa para converter tabelas desestruturadas em dados limpos e auditar se as conclusões refletem os números.",
      "highlight": "Ao solicitar análise de relatórios, adote a regra da ancoragem estrita: \"Responda exclusivamente com base nas informações contidas no documento fornecido\".",
      "cta": "Cuidados com números e laudos"
    },
    {
      "type": "limitations",
      "title": "Cuidados ao analisar laudos com IA",
      "cards": [
        { "icon": "warning", "text": "A IA pode preencher células em branco de tabelas com estimativas sem alertar o usuário." },
        { "icon": "warning", "text": "Conversões incorretas de unidades (ex: mL/ha vs L/ha ou g/ha vs kg/ha) podem causar falhas críticas." },
        { "icon": "success", "text": "Peça para a IA transcrever tabelas de dados brutos antes de solicitar conclusões ou interpretações." },
        { "icon": "success", "text": "Instrua a IA a listar explicitamente dados faltantes como repetições, blocos ou testes de significância." }
      ],
      "cta": "Praticar análise de laudo"
    },
    {
      "type": "ai_practice",
      "title": "Hora de praticar: Extração de Laudo Agronômico",
      "instructions": "Escreva um prompt para instruir a IA a auditar um resumo de laudo de eficácia agronômica, extraindo doses, testemunha, % de controle e checando consistência de unidades.",
      "hints": ["objetivo de extração de dados", "parâmetros obrigatórios", "instrução contra inferência externa", "formato de tabela com alertas"],
      "placeholder": "Ex: Analise o laudo de eficácia agronômica a seguir. Extraia em formato de tabela: Tratamentos, Doses (mantendo a unidade original exata), Incidência de praga e % de Eficácia Abbott. Se algum dado estiver ausente ou duvidoso, liste na seção \"Alertas e Inconsistências\". Não infira dados que não estejam explícitos."
    },
    {
      "type": "quiz",
      "title": "Avaliação do Módulo 6",
      "question": "Qual diretriz de controle é indispensável ao solicitar à IA a extração de dados numéricos de um laudo técnico confidencial de PDI?",
      "options": [
        { "id": "A", "text": "Pedir para a IA completar dados numéricos faltantes utilizando médias de mercado." },
        { "id": "B", "text": "Instruir a IA a se limitar estritamente ao texto fornecido e sinalizar expressamente informações omitidas." },
        { "id": "C", "text": "Converter automaticamente todas as dosagens em percentuais volumétricos para facilitar a leitura." }
      ],
      "correct": "B",
      "explanation": "Em análises técnicas de P&D, a acurácia dos dados é soberana. Instruir a IA a restringir-se ao texto e apontar omissões protege contra alucinações e distorções numéricas."
    }
  ]
}'::jsonb
WHERE course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND number = 6;

-- Atividades Módulo 6
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'content', 'Extração precisa de laudos e ensaios agronômicos', NULL, '{"step": 0}'::jsonb, 1 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 6
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'content', 'Cuidados ao analisar laudos com IA', NULL, '{"step": 1}'::jsonb, 2 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 6
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'ai_practice', 'Hora de praticar: Extração de Laudo Agronômico', 'Escreva um prompt para instruir a IA a auditar um laudo.', '{"step": 2}'::jsonb, 3 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 6
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, instructions = EXCLUDED.instructions, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'quiz', 'Avaliação do Módulo 6', 'Responda a questão para validar seu aprendizado.', '{"step": 3}'::jsonb, 4 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 6
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, instructions = EXCLUDED.instructions, content = EXCLUDED.content;

-- Módulo 7: Escrita e estruturação de trabalhos
UPDATE public.modules
SET content = '{
  "objective": "Utilizar a IA como copiloto na redação, revisão de estilo e organização de relatórios de PDI e propostas técnicas.",
  "steps": [
    {
      "type": "content",
      "title": "A IA como copiloto de redação técnica",
      "body": "A redação de documentos de PDI — relatórios de ensaios, justificativas de investimento, pareceres e POPs — exige precisão e clareza. A IA acelera esse processo criando estruturas lógicas, sugerindo conexões entre parágrafos, eliminando redundâncias e alinhando o tom de voz técnico.",
      "highlight": "A IA é uma aceleradora de rascunhos e lapidação, mas a autoria técnica e a veracidade de cada conclusão pertencem 100% ao pesquisador.",
      "cta": "Cuidados na redação técnica"
    },
    {
      "type": "limitations",
      "title": "Armadilhas na redação assistida por IA",
      "cards": [
        { "icon": "warning", "text": "Textos de IA tendem ao excesso de adjetivos genéricos (\"inovador\", \"revolucionário\") que enfraquecem o tom científico." },
        { "icon": "warning", "text": "O modelo pode amenizar fragilidades metodológicas que deveriam ser destacadas para a segurança do projeto." },
        { "icon": "success", "text": "Solicite primeiro o sumário ou esqueleto de tópicos antes de pedir a redação de parágrafos completos." },
        { "icon": "success", "text": "Forneça exemplos de parágrafos no tom padrão da BioPar para manter a identidade corporativa." }
      ],
      "cta": "Praticar escrita técnica"
    },
    {
      "type": "ai_practice",
      "title": "Hora de praticar: Estruturação de Relatório de PDI",
      "instructions": "Crie um prompt para a IA elaborar a estrutura completa e o rascunho da Justificativa Técnica para um projeto de PDI focado no desenvolvimento de um novo bionematicida.",
      "hints": ["contexto do produto/praga", "seções estruturadas", "tom técnico objetivo", "orientação contra linguagem comercial"],
      "placeholder": "Ex: Atue como pesquisador sênior em biodefensivos da BioPar. Estruture a seção de Justificativa Técnica para um projeto de desenvolvimento de bionematicida para soja. Inclua: relevância econômica do nematoide das galhas, limitação dos químicos tradicionais e vantagem biológica. Use tom técnico, direto, sem floreios publicitários. Formate em 3 seções claras."
    },
    {
      "type": "quiz",
      "title": "Avaliação do Módulo 7",
      "question": "Ao utilizar a IA para redigir o relatório final de um ensaio de PDI, qual é a postura e responsabilidade do pesquisador?",
      "options": [
        { "id": "A", "text": "Revisar criticamente todo o conteúdo, checar a precisão dos dados e assinar como autor técnico responsável." },
        { "id": "B", "text": "Creditar a IA como autora principal e enviar o relatório diretamente para os diretores sem revisão." },
        { "id": "C", "text": "Aprovar o texto sem checagem de dados, contanto que a gramática e pontuação estejam perfeitas." }
      ],
      "correct": "A",
      "explanation": "A IA funciona como instrumento de apoio à redação e revisão. A responsabilidade técnica, ética e científica sobre o documento final é integralmente do pesquisador humano."
    }
  ]
}'::jsonb
WHERE course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND number = 7;

-- Atividades Módulo 7
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'content', 'A IA como copiloto de redação técnica', NULL, '{"step": 0}'::jsonb, 1 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 7
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'content', 'Armadilhas na redação assistida por IA', NULL, '{"step": 1}'::jsonb, 2 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 7
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'ai_practice', 'Hora de praticar: Estruturação de Relatório de PDI', 'Crie um prompt para elaborar a justificativa técnica.', '{"step": 2}'::jsonb, 3 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 7
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, instructions = EXCLUDED.instructions, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'quiz', 'Avaliação do Módulo 7', 'Responda a questão para validar seu aprendizado.', '{"step": 3}'::jsonb, 4 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 7
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, instructions = EXCLUDED.instructions, content = EXCLUDED.content;

-- Módulo 8: Como identificar erros da IA
UPDATE public.modules
SET content = '{
  "objective": "Desenvolver senso crítico para detectar alucinações, inconsistências lógicas e conclusões enviesadas em saídas de IA.",
  "steps": [
    {
      "type": "content",
      "title": "Detecção de alucinações e senso crítico",
      "body": "Modelos de linguagem generativa não compreendem conceitos físicos: calculam a probabilidade estatística de palavras em uma sequência. Por essa razão, a IA pode produzir afirmações totalmente falsas com um tom altamente professoral e convincente. O discernimento para auditar essas falhas é a principal competência do profissional de PDI.",
      "highlight": "Elegância linguística não é garantia de veracidade. Quanto mais segura soa uma resposta sem suporte empírico, mais rigorosa deve ser sua checagem.",
      "cta": "Aprender sinais de alucinação"
    },
    {
      "type": "limitations",
      "title": "Sinais típicos de alucinação e falhas",
      "cards": [
        { "icon": "warning", "text": "Citação de artigos científicos com nomes de pesquisadores conhecidos, mas títulos e conclusões fabricadas." },
        { "icon": "warning", "text": "Dados perfeitamente redondos ou correlações determinísticas sem citação de desvio padrão." },
        { "icon": "warning", "text": "Contradição interna: conclusões no final do texto que conflitam com premissas do início." },
        { "icon": "success", "text": "Técnica do Advogado do Diabo: ordene à IA apontar falhas, contraprovas e fragilidades na própria resposta." }
      ],
      "cta": "Praticar auditoria de erros"
    },
    {
      "type": "ai_practice",
      "title": "Hora de praticar: Auditoria e Checagem Reversa",
      "instructions": "Escreva um prompt instruindo a IA a realizar uma auditoria crítica e verificação de inconsistências sobre uma afirmação técnica agronômica hipotética.",
      "hints": ["afirmação a ser auditada", "comando de identificação de falhas", "exigência de evidências contrárias", "formato de parecer crítico"],
      "placeholder": "Ex: Analise criticamente a seguinte afirmação: \"O bioestimulante X aumenta a produtividade em 40% em qualquer tipo de solo sem necessidade de adubação complementar\". Identifique 3 falhas agronômicas, premissas inverossímeis e riscos biológicos dessa afirmação. Apresente em formato de parecer técnico de auditoria."
    },
    {
      "type": "quiz",
      "title": "Avaliação do Módulo 8",
      "question": "Qual das alternativas abaixo representa o sintoma mais nítido de uma alucinação gerada pela IA em um trabalho técnico?",
      "options": [
        { "id": "A", "text": "A resposta utiliza estrutura de tópicos para facilitar a leitura." },
        { "id": "B", "text": "A resposta cita artigos em periódicos renomados, mas com códigos DOI inexistentes e dados não encontrados nas bases científicas." },
        { "id": "C", "text": "A resposta adverte que os resultados precisam de validação em condições de campo com repetições." }
      ],
      "correct": "B",
      "explanation": "A fabricação de citações, volumes e identificadores de DOI verossímeis é o caso mais comum e perigoso de alucinação científica em modelos de IA generativa."
    }
  ]
}'::jsonb
WHERE course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND number = 8;

-- Atividades Módulo 8
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'content', 'Detecção de alucinações e senso crítico', NULL, '{"step": 0}'::jsonb, 1 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 8
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'content', 'Sinais típicos de alucinação e falhas', NULL, '{"step": 1}'::jsonb, 2 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 8
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'ai_practice', 'Hora de praticar: Auditoria e Checagem Reversa', 'Escreva um prompt instruindo a IA a auditar uma afirmação técnica.', '{"step": 2}'::jsonb, 3 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 8
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, instructions = EXCLUDED.instructions, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'quiz', 'Avaliação do Módulo 8', 'Responda a questão para validar seu aprendizado.', '{"step": 3}'::jsonb, 4 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 8
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, instructions = EXCLUDED.instructions, content = EXCLUDED.content;

-- Módulo 9: Técnicas intermediárias de uso
UPDATE public.modules
SET content = '{
  "objective": "Dominar técnicas avançadas de prompt: Few-Shot Prompting, Cadeia de Pensamento (Chain-of-Thought) e Restrições Negativas.",
  "steps": [
    {
      "type": "content",
      "title": "Técnicas avançadas de engenharia de prompt",
      "body": "Em desafios analíticos complexos de PDI, solicitações simples são insuficientes. Aplicamos técnicas avançadas: 1) Few-Shot Prompting (fornecer exemplos de entrada e saída esperados dentro do prompt), 2) Chain-of-Thought (orientar a IA a resolver o problema passo a passo antes da conclusão) e 3) Restrições Negativas explícitas (regras estritas sobre o que não deve ser feito).",
      "highlight": "Ao incluir \"Pense passo a passo e justifique cada etapa antes de apresentar a conclusão\", os erros de lógica e cálculo caem drasticamente.",
      "cta": "Ver boas práticas avançadas"
    },
    {
      "type": "limitations",
      "title": "Boas práticas nas técnicas avançadas",
      "cards": [
        { "icon": "warning", "text": "Exemplos mal formatados no Few-Shot podem induzir a IA a replicar vícios de estilo ou erros de dados." },
        { "icon": "warning", "text": "Excesso de instruções conflitantes em um prompt saturado faz o modelo desconsiderar regras secundárias." },
        { "icon": "success", "text": "Chain-of-Thought é indispensável para cálculos de diluição, planejamento experimental e diagnósticos fitossanitários." },
        { "icon": "success", "text": "Restrições negativas claras (\"NÃO use termos vagos\", \"NÃO extrapole os limites de dose\") garantem saídas de alta precisão." }
      ],
      "cta": "Praticar técnicas avançadas"
    },
    {
      "type": "ai_practice",
      "title": "Hora de praticar: Few-Shot com Raciocínio Guiado",
      "instructions": "Construa um prompt utilizando a técnica Few-Shot (fornecendo 1 ou 2 exemplos) para classificar o nível de severidade fitossanitária de sintomas e indicar a ação recomendada.",
      "hints": ["definição do papel e tarefa", "exemplos claros de entrada e saída (Few-Shot)", "caso novo a classificar", "formato padronizado"],
      "placeholder": "Ex: Atue como classificador fitossanitário. Siga o padrão dos exemplos abaixo:\nExemplo 1:\nEntrada: Manchas necróticas circulares em 5% da área foliar.\nSaída: Severidade: Baixa | Ação: Monitoramento semanal.\nExemplo 2:\nEntrada: Lesões coalescentes com desfolha em 45% do terço médio.\nSaída: Severidade: Alta | Ação: Intervenção com biofungicida.\nAgora classifique:\nEntrada: Pústulas ferruginosas esparsas em folhas baixeiras com 15% de incidência.\nSaída:"
    },
    {
      "type": "quiz",
      "title": "Avaliação do Módulo 9",
      "question": "Em que situação a técnica de Chain-of-Thought (\"raciocine passo a passo\") é mais indicada no trabalho de PDI?",
      "options": [
        { "id": "A", "text": "Para pedir à IA que invente uma mensagem descontraída de final de ano." },
        { "id": "B", "text": "Em problemas analíticos complexos, cálculos de calibração ou formulação de hipóteses com múltiplas variáveis." },
        { "id": "C", "text": "Apenas quando for necessário traduzir palavras isoladas de outros idiomas." }
      ],
      "correct": "B",
      "explanation": "O raciocínio passo a passo orienta a IA a decompor etapas intermediárias, reduzindo falhas lógicas e viabilizando análises complexas de variáveis experimentais."
    }
  ]
}'::jsonb
WHERE course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND number = 9;

-- Atividades Módulo 9
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'content', 'Técnicas avançadas de engenharia de prompt', NULL, '{"step": 0}'::jsonb, 1 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 9
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'content', 'Boas práticas nas técnicas avançadas', NULL, '{"step": 1}'::jsonb, 2 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 9
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'ai_practice', 'Hora de praticar: Few-Shot com Raciocínio Guiado', 'Construa um prompt utilizando a técnica Few-Shot.', '{"step": 2}'::jsonb, 3 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 9
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, instructions = EXCLUDED.instructions, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'quiz', 'Avaliação do Módulo 9', 'Responda a questão para validar seu aprendizado.', '{"step": 3}'::jsonb, 4 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 9
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, instructions = EXCLUDED.instructions, content = EXCLUDED.content;

-- Módulo 10: Desafio prático PDI
UPDATE public.modules
SET content = '{
  "objective": "Consolidar todas as competências do curso em um projeto integrador completo de PDI, do escopo à governança e rigor científico.",
  "steps": [
    {
      "type": "content",
      "title": "Projeto Integrador: A IA na esteira de PDI",
      "body": "Parabéns por chegar ao módulo final! Aqui você mobiliza todo o conhecimento adquirido: premissas claras, anatomia de prompt, análise crítica da literatura científica, extração de laudos, auditoria de alucinações e governança da informação. No PDI da BioPar, a IA não substitui o pesquisador — ela atua como uma aceleradora de alta potência sob liderança humana.",
      "highlight": "A excelência no uso de IA em PDI resulta da união entre velocidade computacional e discernimento crítico, ética e validação experimental humana.",
      "cta": "Diretrizes de Governança e Ética"
    },
    {
      "type": "limitations",
      "title": "Governança, Ética e Proteção Industrial",
      "cards": [
        { "icon": "warning", "text": "Segredos industriais: nunca insira dados sigilosos não patenteados ou genomas exclusivos em ferramentas de IA públicas." },
        { "icon": "warning", "text": "A IA sugere diretrizes de ensaio, mas aprovações regulatórias exigem conformidade estrita com normas do MAPA e órgãos oficiais." },
        { "icon": "success", "text": "Documente de forma transparente nos projetos internos quais etapas contaram com apoio de IA." },
        { "icon": "success", "text": "A validação experimental em campo (in vivo) permanece soberana sobre qualquer predição ou sugestão de IA." }
      ],
      "cta": "Desafio Final Integrador"
    },
    {
      "type": "ai_practice",
      "title": "Desafio Prático: O Prompt Mestre de PDI",
      "instructions": "Monte um prompt mestre integrador para estruturar uma proposta completa de projeto de PDI: concepção de um bioestimulante foliar, cobrindo objetivo, hipótese, desenho experimental preliminar, restrições e formato executivo.",
      "hints": ["persona técnica de PDI", "contexto e cultura-alvo", "desenho experimental com controles", "restrições de governança", "formato executivo"],
      "placeholder": "Ex: Atue como líder de PDI da BioPar. Precisamos estruturar uma proposta de pesquisa para um novo bioestimulante foliar à base de extratos bacterianos para tolerância a estresse hídrico na cultura da soja. O documento deve conter: 1) Hipótese científica, 2) Delineamento experimental proposto (incluindo testemunha e doses), 3) Variáveis agronômicas de resposta e 4) Fatores de risco biológico e regulatório. Restrições: mantenha tom técnico estrito e aponte os limites de literatura. Formate como sumário executivo de PDI."
    },
    {
      "type": "quiz",
      "title": "Avaliação Final do Curso",
      "question": "Qual é o princípio orientador fundamental de governança e rigor científico ao aplicar Inteligência Artificial no PDI da BioPar?",
      "options": [
        { "id": "A", "text": "Substituir a experimentação agronômica a campo por conclusões da IA para encurtar prazos de entrega." },
        { "id": "B", "text": "A IA atua como aceleradora analítica e de redação, mas o rigor metodológico, a auditoria crítica e a validação experimental permanecem sob responsabilidade humana." },
        { "id": "C", "text": "Permitir que a IA defina autonomamente os limites de dosagem comercial e assine os relatórios oficiais do MAPA." }
      ],
      "correct": "B",
      "explanation": "Parabéns pela conclusão do curso! A IA é um poderoso acelerador para a equipe da BioPar, mas o rigor científico, a verificação experimental prática e a governança ética continuam sendo o coração da inovação humana no PDI."
    }
  ]
}'::jsonb
WHERE course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND number = 10;

-- Atividades Módulo 10
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'content', 'Projeto Integrador: A IA na esteira de PDI', NULL, '{"step": 0}'::jsonb, 1 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 10
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'content', 'Governança, Ética e Proteção Industrial', NULL, '{"step": 1}'::jsonb, 2 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 10
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'ai_practice', 'Desafio Prático: O Prompt Mestre de PDI', 'Monte um prompt mestre integrador para uma proposta de PDI.', '{"step": 2}'::jsonb, 3 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 10
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, instructions = EXCLUDED.instructions, content = EXCLUDED.content;
INSERT INTO public.activities (module_id, activity_type, title, instructions, content, sequence)
SELECT m.id, 'quiz', 'Avaliação Final do Curso', 'Responda a questão para validar seu aprendizado e concluir o curso.', '{"step": 3}'::jsonb, 4 FROM public.modules m WHERE m.course_id = 'a1b2c3d4-0000-0000-0000-000000000001' AND m.number = 10
ON CONFLICT (module_id, sequence) DO UPDATE SET title = EXCLUDED.title, instructions = EXCLUDED.instructions, content = EXCLUDED.content;
