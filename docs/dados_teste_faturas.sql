-- =====================================================
-- DADOS DE TESTE - RELATÓRIO DE FATURAS
-- =====================================================
-- Este script cria dados de exemplo para testar o 
-- sistema de relatórios de faturas
-- =====================================================

-- IMPORTANTE: Execute apenas em ambiente de desenvolvimento/teste

-- =====================================================
-- INSERIR CONTAS DE FUNCIONÁRIOS DE TESTE
-- =====================================================

-- Inserir contas para funcionários existentes
INSERT INTO cant_contas_funcionarios (codigo_funcionario, limite_credito, alerta_credito, ativo, criado_por)
SELECT 
    codigo,
    500.00 as limite_credito,
    400.00 as alerta_credito,
    1 as ativo,
    1 as criado_por
FROM funcionarios 
WHERE inativo = 0 
AND NOT EXISTS (
    SELECT 1 FROM cant_contas_funcionarios 
    WHERE codigo_funcionario = funcionarios.codigo
)
LIMIT 10;

-- =====================================================
-- INSERIR FATURAS DE TESTE
-- =====================================================

-- Faturas para Janeiro/2025
INSERT INTO cant_faturas_funcionarios 
    (codigo_funcionario, mes_referencia, valor_total, quantidade_itens, status, dt_vencimento, dt_criacao, id_usuario_geracao)
SELECT 
    codigo_funcionario,
    '2025-01' as mes_referencia,
    ROUND(50 + (RAND() * 200), 2) as valor_total,
    FLOOR(3 + (RAND() * 12)) as quantidade_itens,
    CASE 
        WHEN RAND() < 0.3 THEN 'GERADA'
        WHEN RAND() < 0.6 THEN 'ENVIADA'
        WHEN RAND() < 0.8 THEN 'PAGA'
        ELSE 'VENCIDA'
    END as status,
    '2025-02-05' as dt_vencimento,
    '2025-02-01' as dt_criacao,
    1 as id_usuario_geracao
FROM cant_contas_funcionarios
WHERE ativo = 1
LIMIT 10;

-- Faturas para Fevereiro/2025
INSERT INTO cant_faturas_funcionarios 
    (codigo_funcionario, mes_referencia, valor_total, quantidade_itens, status, dt_vencimento, dt_criacao, id_usuario_geracao)
SELECT 
    codigo_funcionario,
    '2025-02' as mes_referencia,
    ROUND(50 + (RAND() * 200), 2) as valor_total,
    FLOOR(3 + (RAND() * 12)) as quantidade_itens,
    CASE 
        WHEN RAND() < 0.5 THEN 'GERADA'
        WHEN RAND() < 0.8 THEN 'ENVIADA'
        ELSE 'PAGA'
    END as status,
    '2025-03-05' as dt_vencimento,
    '2025-03-01' as dt_criacao,
    1 as id_usuario_geracao
FROM cant_contas_funcionarios
WHERE ativo = 1
LIMIT 10;

-- Faturas para Março/2025
INSERT INTO cant_faturas_funcionarios 
    (codigo_funcionario, mes_referencia, valor_total, quantidade_itens, status, dt_vencimento, dt_criacao, id_usuario_geracao)
SELECT 
    codigo_funcionario,
    '2025-03' as mes_referencia,
    ROUND(50 + (RAND() * 200), 2) as valor_total,
    FLOOR(3 + (RAND() * 12)) as quantidade_itens,
    'GERADA' as status,
    '2025-04-05' as dt_vencimento,
    NOW() as dt_criacao,
    1 as id_usuario_geracao
FROM cant_contas_funcionarios
WHERE ativo = 1
LIMIT 10;

-- =====================================================
-- CONSULTAS PARA VERIFICAÇÃO
-- =====================================================

-- Verificar faturas criadas
SELECT 
    f.id,
    func.nome AS funcionario_nome,
    func.cargo,
    f.mes_referencia,
    f.valor_total,
    f.quantidade_itens,
    f.status,
    f.dt_vencimento
FROM cant_faturas_funcionarios f
LEFT JOIN funcionarios func ON f.codigo_funcionario = func.codigo
ORDER BY f.mes_referencia DESC, func.nome ASC;

-- Total por mês
SELECT 
    mes_referencia,
    COUNT(*) as total_faturas,
    SUM(valor_total) as valor_total,
    COUNT(DISTINCT codigo_funcionario) as total_funcionarios
FROM cant_faturas_funcionarios
GROUP BY mes_referencia
ORDER BY mes_referencia DESC;

-- Total por status
SELECT 
    status,
    COUNT(*) as total_faturas,
    SUM(valor_total) as valor_total
FROM cant_faturas_funcionarios
GROUP BY status
ORDER BY status;

-- =====================================================
-- LIMPEZA DE DADOS DE TESTE (OPCIONAL)
-- =====================================================

-- Descomentar para remover os dados de teste
-- DELETE FROM cant_faturas_funcionarios WHERE id_usuario_geracao = 1;
