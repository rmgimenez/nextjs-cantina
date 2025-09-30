-- =====================================================
-- DADOS DE TESTE - PACOTES DE ALIMENTAÇÃO
-- =====================================================
-- Este arquivo contém dados de exemplo para testar o sistema de pacotes

-- Inserir pacotes de alimentação de exemplo
INSERT INTO cant_pacotes_alimentacao 
  (nome, tipo_refeicao, descricao, quantidade_refeicoes, validade_dias, valor, ativo, criado_por)
VALUES
  ('Lanche Mensal Básico', 'LANCHE_MANHA', 'Pacote de 20 lanches da manhã', 20, 30, 150.00, 1, 1),
  ('Almoço Mensal', 'ALMOCO', 'Pacote de 22 almoços para o mês', 22, 30, 440.00, 1, 1),
  ('Lanche da Tarde Semanal', 'LANCHE_TARDE', 'Pacote de 5 lanches da tarde', 5, 7, 50.00, 1, 1),
  ('Combo Completo', 'PERSONALIZADO', 'Pacote flexível com 30 refeições de qualquer tipo', 30, 30, 600.00, 1, 1),
  ('Jantar Quinzenal', 'JANTAR', 'Pacote de 10 jantares', 10, 15, 250.00, 1, 1);

-- Nota: Para testar a contratação de pacotes para alunos, você precisará:
-- 1. Ter um aluno cadastrado no sistema (use um RA válido da view 'alunos')
-- 2. Usar a interface web em http://localhost:3000/alunos/pacotes
-- 3. Clicar em "Contratar Pacote para Aluno"
-- 4. Buscar o aluno pelo RA
-- 5. Selecionar um dos pacotes acima
-- 6. Definir a data de início

-- Exemplo de contratação manual (substitua 12345 por um RA válido):
-- INSERT INTO cant_pacotes_alunos 
--   (id_pacote, ra_aluno, quantidade_total, quantidade_utilizada, data_inicio, data_fim, ativo, criado_por)
-- VALUES
--   (1, 12345, 20, 0, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 1, 1);

-- Verificar pacotes criados
SELECT 
  id,
  nome,
  tipo_refeicao,
  quantidade_refeicoes,
  validade_dias,
  valor,
  ativo
FROM cant_pacotes_alimentacao
ORDER BY tipo_refeicao, nome;

-- Verificar se há pacotes contratados
SELECT 
  pa.id,
  pa.ra_aluno,
  a.nome as aluno_nome,
  p.nome as pacote_nome,
  p.tipo_refeicao,
  pa.quantidade_total,
  pa.quantidade_utilizada,
  (pa.quantidade_total - pa.quantidade_utilizada) as quantidade_restante,
  pa.data_inicio,
  pa.data_fim,
  pa.ativo,
  CASE 
    WHEN pa.data_fim < CURDATE() THEN 'VENCIDO'
    WHEN pa.data_fim <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'VENCENDO'
    ELSE 'ATIVO'
  END as status_validade
FROM cant_pacotes_alunos pa
INNER JOIN cant_pacotes_alimentacao p ON pa.id_pacote = p.id
INNER JOIN alunos a ON pa.ra_aluno = a.ra
WHERE pa.ativo = 1
ORDER BY pa.data_inicio DESC;

-- Verificar histórico de uso de pacotes
SELECT 
  up.id,
  up.data_utilizacao,
  up.tipo_refeicao,
  a.nome as aluno_nome,
  p.nome as pacote_nome,
  u.nome as usuario_nome,
  up.observacoes
FROM cant_uso_pacotes up
INNER JOIN cant_pacotes_alunos pa ON up.id_pacote_aluno = pa.id
INNER JOIN alunos a ON pa.ra_aluno = a.ra
INNER JOIN cant_pacotes_alimentacao p ON pa.id_pacote = p.id
LEFT JOIN cant_usuarios_cantina u ON up.usuario = u.id
ORDER BY up.data_utilizacao DESC
LIMIT 20;
