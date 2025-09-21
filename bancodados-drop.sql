-- =====================================================
-- SISTEMA DE CONTROLE DE CANTINA ESCOLAR
-- Script para DROP de todas as tabelas, views e triggers
-- Data de criação: 21/09/2025
-- Autor: Sistema de IA
-- =====================================================

-- DESATIVAR VERIFICAÇÃO DE CHAVES ESTRANGEIRAS
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- DROPS DE ÍNDICES ADICIONAIS
-- =====================================================
DROP INDEX IF EXISTS `idx_cant_vendas_dt_tipo` ON `cant_vendas`;
DROP INDEX IF EXISTS `idx_cant_mov_alunos_conta_dt` ON `cant_movimentacoes_alunos`;
DROP INDEX IF EXISTS `idx_cant_mov_estoque_produto_dt` ON `cant_movimentacoes_estoque`;
DROP INDEX IF EXISTS `idx_cant_faturas_func_mes_status` ON `cant_faturas_funcionarios`;

-- =====================================================
-- DROPS DE TRIGGERS
-- =====================================================
DROP TRIGGER IF EXISTS `trg_cant_atualiza_estoque`;
DROP TRIGGER IF EXISTS `trg_cant_atualiza_saldo_aluno`;

-- =====================================================
-- DROPS DE VIEWS
-- =====================================================
DROP VIEW IF EXISTS `vw_cant_contas_alunos_completa`;
DROP VIEW IF EXISTS `vw_cant_estoque_alertas`;
DROP VIEW IF EXISTS `vw_cant_vendas_completa`;

-- =====================================================
-- DROPS DE TABELAS (em ordem reversa das dependências)
-- =====================================================

-- Tabelas financeiras
DROP TABLE IF EXISTS `cant_contas_receber`;
DROP TABLE IF EXISTS `cant_contas_pagar`;
DROP TABLE IF EXISTS `cant_fornecedores`;

-- Tabelas de pacotes de alimentação
DROP TABLE IF EXISTS `cant_uso_pacotes`;
DROP TABLE IF EXISTS `cant_pacotes_alunos`;
DROP TABLE IF EXISTS `cant_pacotes_alimentacao`;

-- Tabelas de funcionários da escola
DROP TABLE IF EXISTS `cant_pagamentos_funcionarios`;
DROP TABLE IF EXISTS `cant_faturas_funcionarios`;
DROP TABLE IF EXISTS `cant_vendas_funcionarios`;
DROP TABLE IF EXISTS `cant_precos_por_cargo`;

-- Tabelas de vendas e caixa
DROP TABLE IF EXISTS `cant_vendas_itens`;
DROP TABLE IF EXISTS `cant_vendas`;
DROP TABLE IF EXISTS `cant_movimentacoes_caixa`;
DROP TABLE IF EXISTS `cant_caixa`;

-- Tabelas de contas de alunos
DROP TABLE IF EXISTS `cant_observacoes_alunos`;
DROP TABLE IF EXISTS `cant_restricoes_alunos`;
DROP TABLE IF EXISTS `cant_movimentacoes_alunos`;
DROP TABLE IF EXISTS `cant_contas_alunos`;

-- Tabelas de produtos e estoque
DROP TABLE IF EXISTS `cant_movimentacoes_estoque`;
DROP TABLE IF EXISTS `cant_estoque`;
DROP TABLE IF EXISTS `cant_historico_precos`;
DROP TABLE IF EXISTS `cant_produtos`;
DROP TABLE IF EXISTS `cant_tipos_produtos`;

-- Tabelas de autenticação e usuários
DROP TABLE IF EXISTS `cant_log_acoes`;
DROP TABLE IF EXISTS `cant_usuarios_cantina`;
DROP TABLE IF EXISTS `cant_perfis_acesso`;

-- REATIVAR VERIFICAÇÃO DE CHAVES ESTRANGEIRAS
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- FIM DO SCRIPT DE DROP
-- =====================================================
