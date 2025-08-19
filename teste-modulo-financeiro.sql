-- Script de teste para o módulo financeiro
-- Execute este script no MySQL para testar as funcionalidades

-- Inserir categorias de teste (se não existirem)
INSERT IGNORE INTO cant_categoria_financeira (nome, tipo, descricao) VALUES
('Fornecedores de Alimentos', 'DESPESA', 'Pagamentos para fornecedores de produtos alimentícios'),
('Energia Elétrica', 'DESPESA', 'Conta de luz da cantina'),
('Água e Esgoto', 'DESPESA', 'Conta de água da cantina'),
('Aluguel', 'DESPESA', 'Aluguel do espaço da cantina'),
('Vendas à Vista', 'RECEITA', 'Vendas pagas em dinheiro ou cartão'),
('Mensalidades Pacotes', 'RECEITA', 'Receitas de pacotes de alimentação'),
('Outras Receitas', 'RECEITA', 'Receitas diversas');

-- Inserir contas a pagar de teste
INSERT INTO cant_conta_pagar (categoria_id, descricao, fornecedor, numero_documento, valor_original, data_emissao, data_vencimento, observacoes, usuario_cadastro_id)
VALUES 
(1, 'Compra de salgados e doces', 'Fornecedor ABC Ltda', 'NF-001234', 1500.00, '2024-08-01', '2024-08-30', 'Produtos para o mês de agosto', 1),
(2, 'Conta de energia elétrica - Agosto/2024', 'Companhia de Energia', 'CONTA-08-2024', 450.00, '2024-08-05', '2024-08-25', NULL, 1),
(3, 'Conta de água - Agosto/2024', 'Companhia de Saneamento', 'AGUA-08-2024', 120.00, '2024-08-03', '2024-08-22', NULL, 1),
(4, 'Aluguel do espaço da cantina - Setembro/2024', 'Administração Predial', 'ALG-09-2024', 2000.00, '2024-08-15', '2024-09-05', 'Aluguel referente ao mês de setembro', 1);

-- Inserir contas a receber de teste
INSERT INTO cant_conta_receber (categoria_id, descricao, cliente, numero_documento, valor_original, data_emissao, data_vencimento, observacoes, usuario_cadastro_id)
VALUES 
(5, 'Vendas do mês de agosto - Turno manhã', 'Vendas Avulsas', 'VDA-08-2024-M', 3500.00, '2024-08-01', '2024-08-31', 'Consolidação das vendas à vista do turno da manhã', 1),
(6, 'Pacotes de alimentação - Setembro/2024', 'Responsáveis Alunos', 'PAC-09-2024', 8000.00, '2024-08-20', '2024-09-10', 'Venda de pacotes para o mês de setembro', 1),
(7, 'Evento especial - Festa Junina', 'Comissão de Festas', 'EVT-JUNINA-2024', 1200.00, '2024-06-15', '2024-08-30', 'Fornecimento de lanches para festa junina', 1);

-- Inserir alguns pagamentos de teste
INSERT INTO cant_conta_pagar_pagamento (conta_pagar_id, valor_pago, data_pagamento, forma_pagamento, observacoes, usuario_id)
VALUES 
(2, 450.00, '2024-08-24', 'TRANSFERENCIA', 'Pagamento da conta de energia via transferência bancária', 1),
(3, 120.00, '2024-08-20', 'PIX', 'Pagamento da conta de água via PIX', 1);

-- Inserir alguns recebimentos de teste
INSERT INTO cant_conta_receber_recebimento (conta_receber_id, valor_recebido, data_recebimento, forma_recebimento, observacoes, usuario_id)
VALUES 
(1, 3500.00, '2024-08-31', 'DINHEIRO', 'Recebimento integral das vendas à vista', 1),
(3, 600.00, '2024-08-25', 'PIX', 'Pagamento parcial do evento - 50%', 1);

-- Verificar se as views estão funcionando
SELECT 'Contas a Pagar - Resumo' as consulta;
SELECT id, descricao, fornecedor, valor_original, valor_pendente, status, situacao FROM cant_view_conta_pagar_resumo ORDER BY data_vencimento;

SELECT 'Contas a Receber - Resumo' as consulta;
SELECT id, descricao, cliente, valor_original, valor_pendente, status, situacao FROM cant_view_conta_receber_resumo ORDER BY data_vencimento;

SELECT 'Dashboard Financeiro' as consulta;
SELECT * FROM cant_view_dashboard_financeiro;

-- Testar procedure de geração de parcelas
-- Criar uma conta com 3 parcelas
INSERT INTO cant_conta_pagar (categoria_id, descricao, fornecedor, numero_documento, valor_original, data_emissao, data_vencimento, observacoes, usuario_cadastro_id)
VALUES (1, 'Compra parcelada - 3x', 'Fornecedor XYZ', 'NF-567890', 900.00, '2024-08-19', '2024-09-19', 'Compra parcelada em 3 vezes', 1);

-- Gerar as parcelas (substitua o ID pela conta criada acima)
SET @conta_id = LAST_INSERT_ID();
CALL cant_sp_gerar_parcelas_conta_pagar(@conta_id, 3, '2024-09-19');

-- Verificar as parcelas criadas
SELECT 'Parcelas Geradas' as consulta;
SELECT * FROM cant_view_conta_pagar_parcela_resumo WHERE conta_pagar_id = @conta_id;

-- Registrar um pagamento de parcela
SELECT 'Registrando pagamento de parcela' as consulta;
SET @parcela_id = (SELECT id FROM cant_conta_pagar_parcela WHERE conta_pagar_id = @conta_id AND numero_parcela = 1);
CALL cant_sp_registrar_pagamento_conta(@conta_id, @parcela_id, 300.00, 0, 0, '2024-09-19', 'DINHEIRO', 'Pagamento da primeira parcela', 1);

-- Verificar o status após o pagamento
SELECT 'Status após pagamento da primeira parcela' as consulta;
SELECT * FROM cant_view_conta_pagar_parcela_resumo WHERE conta_pagar_id = @conta_id;
SELECT id, descricao, valor_original, valor_pago, valor_pendente, status FROM cant_view_conta_pagar_resumo WHERE id = @conta_id;
