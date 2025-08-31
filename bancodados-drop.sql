/* =====================================================================
	DROP SCRIPT - SISTEMA CANTINA
	Objetivo: remover TODOS os objetos criados pelo sistema da cantina
	(prefixo cant_*) sem alterar tabelas legadas.

	Componentes removidos (na ordem):
	1. Event
	2. Triggers
	3. Views
	4. Stored Procedures
	5. Functions
	6. Tables (ordem reversa de dependências)

	Observações:
	- Usa IF EXISTS para ser idempotente.
	- Desabilita verificação de FKs durante a remoção das tabelas.
	- NÃO remove tabelas legadas (cadastro_alunos, funcionarios, familias, etc.).
	- Atualize este script se novos objetos cant_ forem adicionados.
	===================================================================== */

-- Segurança: trabalhar sempre no schema correto antes de executar
-- USE seu_schema_aqui;

/* =====================================================================
	1) EVENT
	===================================================================== */
DROP EVENT IF EXISTS `evt_atualiza_status_contas_atrasadas`;

/* =====================================================================
	2) TRIGGERS
	(Triggers são descartadas automaticamente ao dropar as tabelas, mas
	 fazemos DROP explícito para limpeza antecipada.)
	===================================================================== */
DROP TRIGGER IF EXISTS `trg_cant_venda_bi`;
DROP TRIGGER IF EXISTS `trg_cant_venda_item_ai`;
DROP TRIGGER IF EXISTS `trg_cant_venda_ai_saldo_aluno`;
DROP TRIGGER IF EXISTS `trg_cant_venda_ai_func_conta`;
DROP TRIGGER IF EXISTS `trg_cant_pacote_utilizacao_ai`;
DROP TRIGGER IF EXISTS `trig_conta_pagar_after_pagamento`;
DROP TRIGGER IF EXISTS `trig_conta_receber_after_recebimento`;

/* =====================================================================
	3) VIEWS
	===================================================================== */
DROP VIEW IF EXISTS `cant_view_dashboard_financeiro`;
DROP VIEW IF EXISTS `cant_view_conta_receber_parcela_resumo`;
DROP VIEW IF EXISTS `cant_view_conta_pagar_parcela_resumo`;
DROP VIEW IF EXISTS `cant_view_conta_receber_resumo`;
DROP VIEW IF EXISTS `cant_view_conta_pagar_resumo`;
DROP VIEW IF EXISTS `cant_view_performance_funcionario`;
DROP VIEW IF EXISTS `cant_view_produtos_mais_vendidos`;
DROP VIEW IF EXISTS `cant_view_funcionario_consumo_mes`;
DROP VIEW IF EXISTS `cant_view_aluno_saldo`;
DROP VIEW IF EXISTS `cant_view_estoque_saldo`;
DROP VIEW IF EXISTS `cant_view_aluno_restricao`;

/* =====================================================================
	4) STORED PROCEDURES
	===================================================================== */
DROP PROCEDURE IF EXISTS `cant_sp_realiza_venda`;
DROP PROCEDURE IF EXISTS `cant_sp_registrar_recebimento_conta`;
DROP PROCEDURE IF EXISTS `cant_sp_registrar_pagamento_conta`;
DROP PROCEDURE IF EXISTS `cant_sp_gerar_parcelas_conta_receber`;
DROP PROCEDURE IF EXISTS `cant_sp_gerar_parcelas_conta_pagar`;
DROP PROCEDURE IF EXISTS `cant_sp_registra_venda`;
DROP PROCEDURE IF EXISTS `cant_sp_gera_faturas_funcionarios`;
DROP PROCEDURE IF EXISTS `cant_sp_fecha_caixa`;
DROP PROCEDURE IF EXISTS `cant_sp_compra_pacote`;
DROP PROCEDURE IF EXISTS `cant_sp_credita_saldo_aluno`;

/* =====================================================================
	5) FUNCTIONS
	===================================================================== */
DROP FUNCTION IF EXISTS `cant_fn_pacote_validavel`;
DROP FUNCTION IF EXISTS `cant_fn_estoque_saldo`;
DROP FUNCTION IF EXISTS `cant_fn_aluno_restrito_tipo`;
DROP FUNCTION IF EXISTS `cant_fn_aluno_restrito_produto`;
DROP FUNCTION IF EXISTS `cant_fn_saldo_aluno`;
DROP FUNCTION IF EXISTS `cant_fn_valor_refeicao_cargo`;

/* =====================================================================
	6) TABLES (ordem: filhos antes dos pais)
	===================================================================== */
SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

-- Módulo financeiro (contas a pagar/receber novo)
DROP TABLE IF EXISTS `cant_conta_receber_recebimento`;
DROP TABLE IF EXISTS `cant_conta_pagar_pagamento`;
DROP TABLE IF EXISTS `cant_conta_receber_parcela`;
DROP TABLE IF EXISTS `cant_conta_pagar_parcela`;
DROP TABLE IF EXISTS `cant_conta_receber`;
DROP TABLE IF EXISTS `cant_conta_pagar`;
DROP TABLE IF EXISTS `cant_categoria_financeira`;

-- Módulo financeiro (versão anterior simples)
DROP TABLE IF EXISTS `cant_contas_receber`;
DROP TABLE IF EXISTS `cant_contas_pagar`;

-- Integração funcionários
DROP TABLE IF EXISTS `cant_funcionario_conta_lanc`;
DROP TABLE IF EXISTS `cant_funcionario_fatura`;

-- Pacotes e utilização
DROP TABLE IF EXISTS `cant_pacote_utilizacao`;
DROP TABLE IF EXISTS `cant_venda_item`;
DROP TABLE IF EXISTS `cant_estoque_mov`;
DROP TABLE IF EXISTS `cant_aluno_restricao_produto`;
DROP TABLE IF EXISTS `cant_aluno_restricao_tipo`;
DROP TABLE IF EXISTS `cant_aluno_observacao`;
DROP TABLE IF EXISTS `cant_pacote_aluno`;
DROP TABLE IF EXISTS `cant_pacote_tipo`;
DROP TABLE IF EXISTS `cant_aluno_saldo_mov`;

-- Caixa e vendas
DROP TABLE IF EXISTS `cant_caixa_mov`;
DROP TABLE IF EXISTS `cant_venda`;
DROP TABLE IF EXISTS `cant_caixa`;

-- Produtos / estoque
DROP TABLE IF EXISTS `cant_produtos`;
DROP TABLE IF EXISTS `cant_produto_tipo`;

-- Outras
DROP TABLE IF EXISTS `cant_preco_cargo`;

-- Base de usuários por último (referenciada por várias tabelas)
DROP TABLE IF EXISTS `cant_usuarios`;

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

/* =====================================================================
	FIM DO DROP SCRIPT
	===================================================================== */

