-- =====================================================
-- SISTEMA DE CONTROLE DE CANTINA ESCOLAR
-- Data de criação: 21/09/2025
-- Autor: Sistema de IA
-- Descrição: Estrutura completa do banco de dados
-- =====================================================

-- =====================================================
-- TABELAS DE AUTENTICAÇÃO E USUÁRIOS
-- =====================================================

-- Tabela de perfis de acesso
CREATE TABLE `cant_perfis_acesso` (
    `id` int NOT NULL AUTO_INCREMENT,
    `nome` varchar(50) NOT NULL,
    `descricao` varchar(255) DEFAULT NULL,
    `ativo` tinyint(1) DEFAULT 1,
    `dt_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `dt_alteracao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_cant_perfis_nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de usuários da cantina
CREATE TABLE `cant_usuarios_cantina` (
    `id` int NOT NULL AUTO_INCREMENT,
    `nome` varchar(100) NOT NULL,
    `usuario` varchar(50) NOT NULL,
    `senha` varchar(255) NOT NULL,
    `email` varchar(100) DEFAULT NULL,
    `telefone` varchar(20) DEFAULT NULL,
    `id_perfil` int NOT NULL,
    `ativo` tinyint(1) DEFAULT 1,
    `dt_ultimo_acesso` timestamp NULL,
    `dt_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `dt_alteracao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `criado_por` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_cant_usuarios_usuario` (`usuario`),
    KEY `fk_cant_usuarios_perfil` (`id_perfil`),
    KEY `fk_cant_usuarios_criado_por` (`criado_por`),
    CONSTRAINT `fk_cant_usuarios_perfil` FOREIGN KEY (`id_perfil`) REFERENCES `cant_perfis_acesso` (`id`),
    CONSTRAINT `fk_cant_usuarios_criado_por` FOREIGN KEY (`criado_por`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de log de ações dos usuários
CREATE TABLE `cant_log_acoes` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_usuario` int NOT NULL,
    `acao` varchar(100) NOT NULL,
    `tabela_afetada` varchar(50) DEFAULT NULL,
    `registro_id` int DEFAULT NULL,
    `dados_anteriores` json DEFAULT NULL,
    `dados_novos` json DEFAULT NULL,
    `ip_address` varchar(45) DEFAULT NULL,
    `user_agent` varchar(500) DEFAULT NULL,
    `dt_acao` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `fk_cant_log_usuario` (`id_usuario`),
    KEY `idx_cant_log_dt_acao` (`dt_acao`),
    KEY `idx_cant_log_tabela` (`tabela_afetada`),
    CONSTRAINT `fk_cant_log_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELAS DE PRODUTOS E ESTOQUE
-- =====================================================

-- Tabela de tipos de produtos
CREATE TABLE `cant_tipos_produtos` (
    `id` int NOT NULL AUTO_INCREMENT,
    `nome` varchar(50) NOT NULL,
    `descricao` varchar(255) DEFAULT NULL,
    `ativo` tinyint(1) DEFAULT 1,
    `dt_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `dt_alteracao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `criado_por` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_cant_tipos_nome` (`nome`),
    KEY `fk_cant_tipos_criado_por` (`criado_por`),
    CONSTRAINT `fk_cant_tipos_criado_por` FOREIGN KEY (`criado_por`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de produtos
CREATE TABLE `cant_produtos` (
    `id` int NOT NULL AUTO_INCREMENT,
    `nome` varchar(100) NOT NULL,
    `id_tipo` int NOT NULL,
    `preco_venda` decimal(10,2) NOT NULL,
    `codigo_barras` varchar(50) DEFAULT NULL,
    `por_quilo` tinyint(1) DEFAULT 0,
    `ativo` tinyint(1) DEFAULT 1,
    `dt_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `dt_alteracao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `criado_por` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_cant_produtos_tipo` (`id_tipo`),
    KEY `fk_cant_produtos_criado_por` (`criado_por`),
    KEY `idx_cant_produtos_nome` (`nome`),
    KEY `idx_cant_produtos_codigo_barras` (`codigo_barras`),
    CONSTRAINT `fk_cant_produtos_tipo` FOREIGN KEY (`id_tipo`) REFERENCES `cant_tipos_produtos` (`id`),
    CONSTRAINT `fk_cant_produtos_criado_por` FOREIGN KEY (`criado_por`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de histórico de preços dos produtos
CREATE TABLE `cant_historico_precos` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_produto` int NOT NULL,
    `preco_anterior` decimal(10,2) NOT NULL,
    `preco_novo` decimal(10,2) NOT NULL,
    `dt_alteracao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `alterado_por` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_cant_hist_precos_produto` (`id_produto`),
    KEY `fk_cant_hist_precos_usuario` (`alterado_por`),
    KEY `idx_cant_hist_precos_dt` (`dt_alteracao`),
    CONSTRAINT `fk_cant_hist_precos_produto` FOREIGN KEY (`id_produto`) REFERENCES `cant_produtos` (`id`),
    CONSTRAINT `fk_cant_hist_precos_usuario` FOREIGN KEY (`alterado_por`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de estoque
CREATE TABLE `cant_estoque` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_produto` int NOT NULL,
    `quantidade_atual` decimal(10,3) NOT NULL DEFAULT 0,
    `quantidade_minima` decimal(10,3) DEFAULT 0,
    `dt_ultima_movimentacao` timestamp NULL,
    `dt_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `dt_alteracao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_cant_estoque_produto` (`id_produto`),
    CONSTRAINT `fk_cant_estoque_produto` FOREIGN KEY (`id_produto`) REFERENCES `cant_produtos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de movimentações de estoque
CREATE TABLE `cant_movimentacoes_estoque` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_produto` int NOT NULL,
    `tipo_movimentacao` enum('ENTRADA','SAIDA','AJUSTE') NOT NULL,
    `quantidade` decimal(10,3) NOT NULL,
    `quantidade_anterior` decimal(10,3) NOT NULL,
    `quantidade_posterior` decimal(10,3) NOT NULL,
    `motivo` varchar(255) DEFAULT NULL,
    `documento` varchar(50) DEFAULT NULL,
    `dt_movimentacao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `usuario` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_cant_mov_estoque_produto` (`id_produto`),
    KEY `fk_cant_mov_estoque_usuario` (`usuario`),
    KEY `idx_cant_mov_estoque_dt` (`dt_movimentacao`),
    KEY `idx_cant_mov_estoque_tipo` (`tipo_movimentacao`),
    CONSTRAINT `fk_cant_mov_estoque_produto` FOREIGN KEY (`id_produto`) REFERENCES `cant_produtos` (`id`),
    CONSTRAINT `fk_cant_mov_estoque_usuario` FOREIGN KEY (`usuario`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELAS DE CONTAS DE ALUNOS
-- =====================================================

-- Tabela de contas dos alunos
CREATE TABLE `cant_contas_alunos` (
    `id` int NOT NULL AUTO_INCREMENT,
    `ra_aluno` int NOT NULL,
    `saldo_atual` decimal(10,2) NOT NULL DEFAULT 0.00,
    `limite_credito` decimal(10,2) DEFAULT 0.00,
    `ativo` tinyint(1) DEFAULT 1,
    `dt_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `dt_alteracao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_cant_contas_aluno` (`ra_aluno`),
    KEY `idx_cant_contas_saldo` (`saldo_atual`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de movimentações das contas dos alunos
CREATE TABLE `cant_movimentacoes_alunos` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_conta_aluno` int NOT NULL,
    `tipo_movimentacao` enum('CREDITO','DEBITO','ESTORNO') NOT NULL,
    `valor` decimal(10,2) NOT NULL,
    `saldo_anterior` decimal(10,2) NOT NULL,
    `saldo_posterior` decimal(10,2) NOT NULL,
    `descricao` varchar(255) NOT NULL,
    `id_venda` int DEFAULT NULL,
    `dt_movimentacao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `usuario` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_cant_mov_alunos_conta` (`id_conta_aluno`),
    KEY `fk_cant_mov_alunos_usuario` (`usuario`),
    KEY `idx_cant_mov_alunos_dt` (`dt_movimentacao`),
    KEY `idx_cant_mov_alunos_tipo` (`tipo_movimentacao`),
    CONSTRAINT `fk_cant_mov_alunos_conta` FOREIGN KEY (`id_conta_aluno`) REFERENCES `cant_contas_alunos` (`id`),
    CONSTRAINT `fk_cant_mov_alunos_usuario` FOREIGN KEY (`usuario`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de restrições dos alunos
CREATE TABLE `cant_restricoes_alunos` (
    `id` int NOT NULL AUTO_INCREMENT,
    `ra_aluno` int NOT NULL,
    `tipo_restricao` enum('PRODUTO','TIPO_PRODUTO') NOT NULL,
    `id_produto` int DEFAULT NULL,
    `id_tipo_produto` int DEFAULT NULL,
    `motivo` varchar(255) DEFAULT NULL,
    `ativo` tinyint(1) DEFAULT 1,
    `dt_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `dt_alteracao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `criado_por` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_cant_restricoes_produto` (`id_produto`),
    KEY `fk_cant_restricoes_tipo` (`id_tipo_produto`),
    KEY `fk_cant_restricoes_criado_por` (`criado_por`),
    KEY `idx_cant_restricoes_aluno` (`ra_aluno`),
    CONSTRAINT `fk_cant_restricoes_produto` FOREIGN KEY (`id_produto`) REFERENCES `cant_produtos` (`id`),
    CONSTRAINT `fk_cant_restricoes_tipo` FOREIGN KEY (`id_tipo_produto`) REFERENCES `cant_tipos_produtos` (`id`),
    CONSTRAINT `fk_cant_restricoes_criado_por` FOREIGN KEY (`criado_por`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de observações dos alunos
CREATE TABLE `cant_observacoes_alunos` (
    `id` int NOT NULL AUTO_INCREMENT,
    `ra_aluno` int NOT NULL,
    `tipo_observacao` enum('MEDICA','ALIMENTAR','COMPORTAMENTAL','GERAL') NOT NULL,
    `observacao` text NOT NULL,
    `prioridade` enum('BAIXA','MEDIA','ALTA','CRITICA') DEFAULT 'MEDIA',
    `dt_validade` date DEFAULT NULL,
    `ativo` tinyint(1) DEFAULT 1,
    `dt_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `dt_alteracao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `criado_por` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_cant_observacoes_criado_por` (`criado_por`),
    KEY `idx_cant_observacoes_aluno` (`ra_aluno`),
    KEY `idx_cant_observacoes_tipo` (`tipo_observacao`),
    KEY `idx_cant_observacoes_prioridade` (`prioridade`),
    CONSTRAINT `fk_cant_observacoes_criado_por` FOREIGN KEY (`criado_por`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELAS DE VENDAS E CAIXA
-- =====================================================

-- Tabela de caixa
CREATE TABLE `cant_caixa` (
    `id` int NOT NULL AUTO_INCREMENT,
    `dt_abertura` timestamp NOT NULL,
    `dt_fechamento` timestamp NULL,
    `valor_inicial` decimal(10,2) NOT NULL,
    `valor_final_esperado` decimal(10,2) DEFAULT NULL,
    `valor_final_real` decimal(10,2) DEFAULT NULL,
    `diferenca` decimal(10,2) DEFAULT NULL,
    `observacoes` text DEFAULT NULL,
    `status` enum('ABERTO','FECHADO') DEFAULT 'ABERTO',
    `usuario_abertura` int NOT NULL,
    `usuario_fechamento` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_cant_caixa_abertura` (`usuario_abertura`),
    KEY `fk_cant_caixa_fechamento` (`usuario_fechamento`),
    KEY `idx_cant_caixa_dt_abertura` (`dt_abertura`),
    KEY `idx_cant_caixa_status` (`status`),
    CONSTRAINT `fk_cant_caixa_abertura` FOREIGN KEY (`usuario_abertura`) REFERENCES `cant_usuarios_cantina` (`id`),
    CONSTRAINT `fk_cant_caixa_fechamento` FOREIGN KEY (`usuario_fechamento`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de movimentações do caixa
CREATE TABLE `cant_movimentacoes_caixa` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_caixa` int NOT NULL,
    `tipo_movimentacao` enum('SANGRIA','SUPRIMENTO','VENDA','ESTORNO') NOT NULL,
    `valor` decimal(10,2) NOT NULL,
    `descricao` varchar(255) DEFAULT NULL,
    `dt_movimentacao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `usuario` int NOT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_cant_mov_caixa_caixa` (`id_caixa`),
    KEY `fk_cant_mov_caixa_usuario` (`usuario`),
    KEY `idx_cant_mov_caixa_dt` (`dt_movimentacao`),
    KEY `idx_cant_mov_caixa_tipo` (`tipo_movimentacao`),
    CONSTRAINT `fk_cant_mov_caixa_caixa` FOREIGN KEY (`id_caixa`) REFERENCES `cant_caixa` (`id`),
    CONSTRAINT `fk_cant_mov_caixa_usuario` FOREIGN KEY (`usuario`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de vendas
CREATE TABLE `cant_vendas` (
    `id` int NOT NULL AUTO_INCREMENT,
    `ra_aluno` int DEFAULT NULL,
    `codigo_funcionario` int DEFAULT NULL,
    `tipo_cliente` enum('ALUNO','FUNCIONARIO','GERAL') NOT NULL,
    `valor_total` decimal(10,2) NOT NULL,
    `forma_pagamento` enum('SALDO','DINHEIRO','CARTAO','CONTA_FUNCIONARIO') NOT NULL,
    `status` enum('CONCLUIDA','CANCELADA','ESTORNADA') DEFAULT 'CONCLUIDA',
    `id_caixa` int NOT NULL,
    `dt_venda` timestamp DEFAULT CURRENT_TIMESTAMP,
    `usuario` int NOT NULL,
    `observacoes` text DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_cant_vendas_caixa` (`id_caixa`),
    KEY `fk_cant_vendas_usuario` (`usuario`),
    KEY `idx_cant_vendas_aluno` (`ra_aluno`),
    KEY `idx_cant_vendas_funcionario` (`codigo_funcionario`),
    KEY `idx_cant_vendas_dt` (`dt_venda`),
    KEY `idx_cant_vendas_tipo_cliente` (`tipo_cliente`),
    CONSTRAINT `fk_cant_vendas_caixa` FOREIGN KEY (`id_caixa`) REFERENCES `cant_caixa` (`id`),
    CONSTRAINT `fk_cant_vendas_usuario` FOREIGN KEY (`usuario`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de itens das vendas
CREATE TABLE `cant_vendas_itens` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_venda` int NOT NULL,
    `id_produto` int NOT NULL,
    `quantidade` decimal(10,3) NOT NULL,
    `peso` decimal(10,3) DEFAULT NULL,
    `preco_unitario` decimal(10,2) NOT NULL,
    `valor_total` decimal(10,2) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_cant_vendas_itens_venda` (`id_venda`),
    KEY `fk_cant_vendas_itens_produto` (`id_produto`),
    CONSTRAINT `fk_cant_vendas_itens_venda` FOREIGN KEY (`id_venda`) REFERENCES `cant_vendas` (`id`),
    CONSTRAINT `fk_cant_vendas_itens_produto` FOREIGN KEY (`id_produto`) REFERENCES `cant_produtos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELAS DE FUNCIONÁRIOS DA ESCOLA
-- =====================================================

-- Tabela de contas dos funcionários
CREATE TABLE `cant_contas_funcionarios` (
    `id` int NOT NULL AUTO_INCREMENT,
    `codigo_funcionario` int NOT NULL,
    `limite_credito` decimal(10,2) DEFAULT NULL,
    `alerta_credito` decimal(10,2) DEFAULT NULL,
    `observacoes` varchar(255) DEFAULT NULL,
    `ativo` tinyint(1) DEFAULT 1,
    `dt_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `dt_alteracao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `criado_por` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_cant_contas_funcionario` (`codigo_funcionario`),
    KEY `idx_cant_contas_func_limite` (`limite_credito`),
    CONSTRAINT `fk_cant_contas_func_criado_por` FOREIGN KEY (`criado_por`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de preços por cargo
CREATE TABLE `cant_precos_por_cargo` (
    `id` int NOT NULL AUTO_INCREMENT,
    `cargo` varchar(100) NOT NULL,
    `id_produto` int NOT NULL,
    `preco_especial` decimal(10,2) NOT NULL,
    `ativo` tinyint(1) DEFAULT 1,
    `dt_inicio_vigencia` date DEFAULT NULL,
    `dt_fim_vigencia` date DEFAULT NULL,
    `dt_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `dt_alteracao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `criado_por` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_cant_precos_cargo_produto` (`cargo`, `id_produto`),
    KEY `fk_cant_precos_cargo_produto` (`id_produto`),
    KEY `fk_cant_precos_cargo_criado_por` (`criado_por`),
    KEY `idx_cant_precos_cargo` (`cargo`),
    CONSTRAINT `fk_cant_precos_cargo_produto` FOREIGN KEY (`id_produto`) REFERENCES `cant_produtos` (`id`),
    CONSTRAINT `fk_cant_precos_cargo_criado_por` FOREIGN KEY (`criado_por`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de histórico de preços por cargo
CREATE TABLE `cant_precos_por_cargo_historico` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_preco_cargo` int DEFAULT NULL,
    `cargo` varchar(100) NOT NULL,
    `id_produto` int NOT NULL,
    `preco_anterior` decimal(10,2) NOT NULL,
    `preco_novo` decimal(10,2) NOT NULL,
    `dt_alteracao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `usuario` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_cant_precos_cargo_hist_preco` (`id_preco_cargo`),
    KEY `fk_cant_precos_cargo_hist_usuario` (`usuario`),
    KEY `idx_cant_precos_cargo_hist_produto` (`id_produto`),
    CONSTRAINT `fk_cant_precos_cargo_hist_preco` FOREIGN KEY (`id_preco_cargo`) REFERENCES `cant_precos_por_cargo` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_cant_precos_cargo_hist_usuario` FOREIGN KEY (`usuario`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de faturas dos funcionários
CREATE TABLE `cant_faturas_funcionarios` (
    `id` int NOT NULL AUTO_INCREMENT,
    `codigo_funcionario` int NOT NULL,
    `mes_referencia` varchar(7) NOT NULL, -- YYYY-MM
    `valor_total` decimal(10,2) NOT NULL,
    `quantidade_itens` int NOT NULL,
    `status` enum('GERADA','ENVIADA','PAGA','VENCIDA','PARCIAL') DEFAULT 'GERADA',
    `dt_vencimento` date NOT NULL,
    `dt_pagamento` timestamp NULL,
    `dt_envio_email` timestamp NULL,
    `dt_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `id_usuario_geracao` int DEFAULT NULL,
    `observacoes` text DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_cant_faturas_funcionario` (`codigo_funcionario`),
    KEY `idx_cant_faturas_mes` (`mes_referencia`),
    KEY `idx_cant_faturas_status` (`status`),
    UNIQUE KEY `uk_cant_faturas_func_mes` (`codigo_funcionario`, `mes_referencia`),
    CONSTRAINT `fk_cant_faturas_usuario_geracao` FOREIGN KEY (`id_usuario_geracao`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de vendas para funcionários da escola
CREATE TABLE `cant_vendas_funcionarios` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_venda` int NOT NULL,
    `codigo_funcionario` int NOT NULL,
    `cargo_aplicado` varchar(100) DEFAULT NULL,
    `valor_original` decimal(10,2) NOT NULL,
    `valor_aplicado` decimal(10,2) NOT NULL,
    `desconto_aplicado` decimal(10,2) DEFAULT 0.00,
    `mes_referencia` varchar(7) NOT NULL, -- YYYY-MM
    `id_fatura` int DEFAULT NULL,
    `pago` tinyint(1) DEFAULT 0,
    `dt_lancamento` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `fk_cant_vendas_func_venda` (`id_venda`),
    KEY `idx_cant_vendas_func_codigo` (`codigo_funcionario`),
    KEY `idx_cant_vendas_func_mes` (`mes_referencia`),
    KEY `idx_cant_vendas_func_pago` (`pago`),
    KEY `idx_cant_vendas_func_id_fatura` (`id_fatura`),
    CONSTRAINT `fk_cant_vendas_func_venda` FOREIGN KEY (`id_venda`) REFERENCES `cant_vendas` (`id`),
    CONSTRAINT `fk_cant_vendas_func_fatura` FOREIGN KEY (`id_fatura`) REFERENCES `cant_faturas_funcionarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de pagamentos dos funcionários
CREATE TABLE `cant_pagamentos_funcionarios` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_fatura` int NOT NULL,
    `valor_pago` decimal(10,2) NOT NULL,
    `forma_pagamento` enum('DINHEIRO','CARTAO','TRANSFERENCIA','DESCONTO_FOLHA') NOT NULL,
    `dt_pagamento` timestamp DEFAULT CURRENT_TIMESTAMP,
    `observacoes` varchar(255) DEFAULT NULL,
    `usuario` int NOT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_cant_pagamentos_fatura` (`id_fatura`),
    KEY `fk_cant_pagamentos_usuario` (`usuario`),
    KEY `idx_cant_pagamentos_dt` (`dt_pagamento`),
    CONSTRAINT `fk_cant_pagamentos_fatura` FOREIGN KEY (`id_fatura`) REFERENCES `cant_faturas_funcionarios` (`id`),
    CONSTRAINT `fk_cant_pagamentos_usuario` FOREIGN KEY (`usuario`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de pacotes de alimentação
CREATE TABLE `cant_pacotes_alimentacao` (
    `id` int NOT NULL AUTO_INCREMENT,
    `nome` varchar(100) NOT NULL,
    `tipo_refeicao` enum('LANCHE_MANHA','ALMOCO','LANCHE_TARDE','JANTAR','PERSONALIZADO') NOT NULL,
    `descricao` varchar(255) DEFAULT NULL,
    `quantidade_refeicoes` int NOT NULL,
    `validade_dias` int DEFAULT NULL,
    `valor` decimal(10,2) NOT NULL,
    `ativo` tinyint(1) DEFAULT 1,
    `dt_inicio_vigencia` date DEFAULT NULL,
    `dt_fim_vigencia` date DEFAULT NULL,
    `dt_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `dt_alteracao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `criado_por` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_cant_pacotes_criado_por` FOREIGN KEY (`criado_por`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de pacotes contratados pelos alunos
CREATE TABLE `cant_pacotes_alunos` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_pacote` int NOT NULL,
    `ra_aluno` int NOT NULL,
    `quantidade_total` int NOT NULL,
    `quantidade_utilizada` int NOT NULL DEFAULT 0,
    `data_inicio` date NOT NULL,
    `data_fim` date DEFAULT NULL,
    `ativo` tinyint(1) DEFAULT 1,
    `dt_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `dt_alteracao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `criado_por` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_cant_pacotes_aluno_pacote` (`id_pacote`),
    KEY `idx_cant_pacotes_aluno_ra` (`ra_aluno`),
    CONSTRAINT `fk_cant_pacotes_aluno_pacote` FOREIGN KEY (`id_pacote`) REFERENCES `cant_pacotes_alimentacao` (`id`),
    CONSTRAINT `fk_cant_pacotes_aluno_criado_por` FOREIGN KEY (`criado_por`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de uso dos pacotes de alimentação
CREATE TABLE `cant_uso_pacotes` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_pacote_aluno` int NOT NULL,
    `data_utilizacao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `tipo_refeicao` enum('LANCHE_MANHA','ALMOCO','LANCHE_TARDE','JANTAR','PERSONALIZADO') NOT NULL,
    `observacoes` varchar(255) DEFAULT NULL,
    `usuario` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_cant_uso_pacote_aluno` (`id_pacote_aluno`),
    KEY `fk_cant_uso_pacotes_usuario` (`usuario`),
    CONSTRAINT `fk_cant_uso_pacote_aluno` FOREIGN KEY (`id_pacote_aluno`) REFERENCES `cant_pacotes_alunos` (`id`),
    CONSTRAINT `fk_cant_uso_pacotes_usuario` FOREIGN KEY (`usuario`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de fornecedores
CREATE TABLE `cant_fornecedores` (
    `id` int NOT NULL AUTO_INCREMENT,
    `nome` varchar(150) NOT NULL,
    `cnpj` varchar(18) DEFAULT NULL,
    `cpf` varchar(14) DEFAULT NULL,
    `email` varchar(150) DEFAULT NULL,
    `telefone` varchar(20) DEFAULT NULL,
    `contato` varchar(100) DEFAULT NULL,
    `endereco` varchar(255) DEFAULT NULL,
    `cidade` varchar(100) DEFAULT NULL,
    `estado` char(2) DEFAULT NULL,
    `cep` varchar(10) DEFAULT NULL,
    `observacoes` text DEFAULT NULL,
    `ativo` tinyint(1) DEFAULT 1,
    `dt_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `dt_alteracao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `criado_por` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_cant_fornecedores_cnpj` (`cnpj`),
    UNIQUE KEY `uk_cant_fornecedores_cpf` (`cpf`),
    CONSTRAINT `fk_cant_fornecedores_criado_por` FOREIGN KEY (`criado_por`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de contas a pagar
CREATE TABLE `cant_contas_pagar` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_fornecedor` int NOT NULL,
    `descricao` varchar(255) NOT NULL,
    `valor` decimal(10,2) NOT NULL,
    `dt_vencimento` date NOT NULL,
    `dt_pagamento` date DEFAULT NULL,
    `valor_pago` decimal(10,2) DEFAULT NULL,
    `status` enum('PENDENTE','PAGO','VENCIDO','PARCIAL') DEFAULT 'PENDENTE',
    `categoria` varchar(50) DEFAULT NULL,
    `numero_documento` varchar(50) DEFAULT NULL,
    `observacoes` text DEFAULT NULL,
    `dt_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `criado_por` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_cant_contas_pagar_fornecedor` (`id_fornecedor`),
    KEY `fk_cant_contas_pagar_criado_por` (`criado_por`),
    KEY `idx_cant_contas_pagar_vencimento` (`dt_vencimento`),
    KEY `idx_cant_contas_pagar_status` (`status`),
    CONSTRAINT `fk_cant_contas_pagar_fornecedor` FOREIGN KEY (`id_fornecedor`) REFERENCES `cant_fornecedores` (`id`),
    CONSTRAINT `fk_cant_contas_pagar_criado_por` FOREIGN KEY (`criado_por`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de contas a receber
CREATE TABLE `cant_contas_receber` (
    `id` int NOT NULL AUTO_INCREMENT,
    `tipo_cliente` enum('FUNCIONARIO','ALUNO','TERCEIRO') NOT NULL,
    `codigo_funcionario` int DEFAULT NULL,
    `ra_aluno` int DEFAULT NULL,
    `nome_terceiro` varchar(100) DEFAULT NULL,
    `descricao` varchar(255) NOT NULL,
    `valor` decimal(10,2) NOT NULL,
    `dt_vencimento` date NOT NULL,
    `dt_recebimento` date DEFAULT NULL,
    `valor_recebido` decimal(10,2) DEFAULT NULL,
    `status` enum('PENDENTE','RECEBIDO','VENCIDO','PARCIAL') DEFAULT 'PENDENTE',
    `categoria` varchar(50) DEFAULT NULL,
    `numero_documento` varchar(50) DEFAULT NULL,
    `observacoes` text DEFAULT NULL,
    `dt_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
    `criado_por` int DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `fk_cant_contas_receber_criado_por` (`criado_por`),
    KEY `idx_cant_contas_receber_funcionario` (`codigo_funcionario`),
    KEY `idx_cant_contas_receber_aluno` (`ra_aluno`),
    KEY `idx_cant_contas_receber_vencimento` (`dt_vencimento`),
    KEY `idx_cant_contas_receber_status` (`status`),
    CONSTRAINT `fk_cant_contas_receber_criado_por` FOREIGN KEY (`criado_por`) REFERENCES `cant_usuarios_cantina` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERÇÃO DE DADOS INICIAIS
-- =====================================================

-- Inserir perfis de acesso padrão
INSERT INTO `cant_perfis_acesso` (`nome`, `descricao`) VALUES
('ADMINISTRADOR', 'Acesso total ao sistema'),
('OPERADOR', 'Acesso limitado às funcionalidades de venda e consulta');

-- Inserir usuário administrador padrão
INSERT INTO `cant_usuarios_cantina` (`nome`, `usuario`, `senha`, `email`, `id_perfil`, `ativo`) VALUES
('Administrador', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@cantina.com', 1, 1);
-- Senha padrão: password (deve ser alterada no primeiro acesso)

-- Inserir tipos de produtos básicos
INSERT INTO `cant_tipos_produtos` (`nome`, `descricao`, `criado_por`) VALUES
('SALGADOS', 'Produtos salgados (coxinha, pão de açúcar, etc.)', 1),
('DOCES', 'Produtos doces (brigadeiro, beijinho, etc.)', 1),
('BEBIDAS', 'Refrigerantes, sucos, água, etc.', 1),
('REFEICOES', 'Pratos feitos, marmitas, etc.', 1),
('LANCHES', 'Sanduíches, hambúrgueres, etc.', 1);

-- =====================================================
-- VIEWS AUXILIARES
-- =====================================================

-- View para consulta de vendas completa
CREATE VIEW `vw_cant_vendas_completa` AS
SELECT 
    v.id,
    v.tipo_cliente,
    CASE 
        WHEN v.tipo_cliente = 'ALUNO' THEN a.nome
        WHEN v.tipo_cliente = 'FUNCIONARIO' THEN f.nome
        ELSE 'N/A'
    END AS nome_cliente,
    v.ra_aluno,
    v.codigo_funcionario,
    v.valor_total,
    v.forma_pagamento,
    v.status,
    v.dt_venda,
    u.nome AS usuario_nome,
    c.dt_abertura AS caixa_abertura
FROM cant_vendas v
LEFT JOIN alunos a ON v.ra_aluno = a.ra
LEFT JOIN funcionarios f ON v.codigo_funcionario = f.codigo
LEFT JOIN cant_usuarios_cantina u ON v.usuario = u.id
LEFT JOIN cant_caixa c ON v.id_caixa = c.id;

-- View para consulta de estoque com alertas
CREATE VIEW `vw_cant_estoque_alertas` AS
SELECT 
    e.id,
    p.nome AS produto_nome,
    tp.nome AS tipo_produto,
    e.quantidade_atual,
    e.quantidade_minima,
    CASE 
        WHEN e.quantidade_atual <= e.quantidade_minima THEN 'CRITICO'
        WHEN e.quantidade_atual <= (e.quantidade_minima * 1.5) THEN 'BAIXO'
        ELSE 'OK'
    END AS status_estoque,
    p.ativo AS produto_ativo
FROM cant_estoque e
INNER JOIN cant_produtos p ON e.id_produto = p.id
INNER JOIN cant_tipos_produtos tp ON p.id_tipo = tp.id
WHERE p.ativo = 1;

-- View para consulta de contas de alunos com dados pessoais
CREATE VIEW `vw_cant_contas_alunos_completa` AS
SELECT 
    ca.id,
    ca.ra_aluno,
    a.nome,
    a.turma,
    a.serie,
    a.curso_nome,
    ca.saldo_atual,
    ca.limite_credito,
    ca.ativo
FROM cant_contas_alunos ca
INNER JOIN alunos a ON ca.ra_aluno = a.ra
WHERE a.status = 'MAT';

-- View para consulta de vendas de funcionários com detalhes
CREATE VIEW `vw_cant_vendas_funcionarios` AS
SELECT 
    vf.id,
    vf.id_venda,
    v.dt_venda,
    vf.codigo_funcionario,
    f.nome AS funcionario_nome,
    COALESCE(vf.cargo_aplicado, f.cargo) AS cargo_utilizado,
    vf.valor_original,
    vf.valor_aplicado,
    vf.desconto_aplicado,
    vf.mes_referencia,
    vf.pago,
    vf.dt_lancamento,
    vf.id_fatura,
    fat.status AS status_fatura
FROM cant_vendas_funcionarios vf
INNER JOIN cant_vendas v ON v.id = vf.id_venda
LEFT JOIN cant_faturas_funcionarios fat ON fat.id = vf.id_fatura
LEFT JOIN funcionarios f ON vf.codigo_funcionario = f.codigo;

-- View para contas de funcionários com limite e saldo em aberto
CREATE VIEW `vw_cant_contas_funcionarios` AS
SELECT 
    cf.id,
    cf.codigo_funcionario,
    f.nome AS funcionario_nome,
    f.cargo AS cargo_oficial,
    cf.limite_credito,
    cf.alerta_credito,
    cf.ativo,
    cf.dt_criacao,
    cf.dt_alteracao,
    COALESCE(SUM(CASE WHEN vf.pago = 0 THEN vf.valor_aplicado ELSE 0 END), 0) AS total_em_aberto,
    CASE
        WHEN cf.limite_credito IS NULL THEN NULL
        ELSE cf.limite_credito - COALESCE(SUM(CASE WHEN vf.pago = 0 THEN vf.valor_aplicado ELSE 0 END), 0)
    END AS limite_disponivel
FROM cant_contas_funcionarios cf
LEFT JOIN funcionarios f ON f.codigo = cf.codigo_funcionario
LEFT JOIN cant_vendas_funcionarios vf ON vf.codigo_funcionario = cf.codigo_funcionario AND vf.pago = 0
GROUP BY cf.id, cf.codigo_funcionario, f.nome, f.cargo, cf.limite_credito, cf.alerta_credito, cf.ativo, cf.dt_criacao, cf.dt_alteracao;

-- =====================================================
-- TRIGGERS PARA CONTROLE AUTOMÁTICO
-- =====================================================

-- Trigger para atualizar saldo após movimentação de conta de aluno
DELIMITER //
CREATE TRIGGER `trg_cant_atualiza_saldo_aluno` 
AFTER INSERT ON `cant_movimentacoes_alunos`
FOR EACH ROW
BEGIN
    UPDATE `cant_contas_alunos` 
    SET `saldo_atual` = NEW.saldo_posterior
    WHERE `id` = NEW.id_conta_aluno;
END //
DELIMITER ;

-- Trigger para atualizar estoque após movimentação
DELIMITER //
CREATE TRIGGER `trg_cant_atualiza_estoque` 
AFTER INSERT ON `cant_movimentacoes_estoque`
FOR EACH ROW
BEGIN
    UPDATE `cant_estoque` 
    SET `quantidade_atual` = NEW.quantidade_posterior,
        `dt_ultima_movimentacao` = NEW.dt_movimentacao
    WHERE `id_produto` = NEW.id_produto;
END //
DELIMITER ;

-- Trigger para criar conta do aluno automaticamente
-- NOTA: Como 'alunos' é uma VIEW e não uma tabela base, não é possível criar triggers nela.
-- As contas dos alunos devem ser criadas manualmente quando necessário através da aplicação.
-- DELIMITER //
-- CREATE TRIGGER `trg_cant_criar_conta_aluno`
-- AFTER INSERT ON `alunos`
-- FOR EACH ROW
-- BEGIN
--     INSERT INTO `cant_contas_alunos` (`ra_aluno`, `saldo_atual`, `ativo`)
--     VALUES (NEW.ra, 0.00, 1)
--     ON DUPLICATE KEY UPDATE `ativo` = 1;
-- END //
-- DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Índices compostos para consultas frequentes
CREATE INDEX `idx_cant_vendas_dt_tipo` ON `cant_vendas` (`dt_venda`, `tipo_cliente`);
CREATE INDEX `idx_cant_mov_alunos_conta_dt` ON `cant_movimentacoes_alunos` (`id_conta_aluno`, `dt_movimentacao`);
CREATE INDEX `idx_cant_mov_estoque_produto_dt` ON `cant_movimentacoes_estoque` (`id_produto`, `dt_movimentacao`);
CREATE INDEX `idx_cant_faturas_func_mes_status` ON `cant_faturas_funcionarios` (`codigo_funcionario`, `mes_referencia`, `status`);
CREATE INDEX `idx_cant_vendas_funcionario_pendente` ON `cant_vendas_funcionarios` (`codigo_funcionario`, `pago`, `mes_referencia`);
CREATE INDEX `idx_cant_contas_funcionario_codigo` ON `cant_contas_funcionarios` (`codigo_funcionario`);

-- =====================================================
-- FIM DO SCRIPT DE CRIAÇÃO DO BANCO DE DADOS
-- =====================================================
