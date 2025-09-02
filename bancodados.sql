-- início - tabelas que já existem no banco de dados
CREATE TABLE `cadastro_alunos` (
  `ra` int NOT NULL,
  `nome` varchar(255) DEFAULT NULL,
  `nome_social` varchar(255) DEFAULT NULL,
  `nacionalidade` smallint DEFAULT NULL,
  `natural_de` varchar(255) DEFAULT NULL,
  `reside` varchar(255) DEFAULT NULL,
  `nasc` datetime DEFAULT NULL,
  `sexo` varchar(255) DEFAULT NULL,
  `estcivil` varchar(255) DEFAULT NULL,
  `dt_cadastro` datetime DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `email2` varchar(255) DEFAULT NULL,
  `familia` double DEFAULT NULL,
  `cod_religião` smallint DEFAULT NULL,
  `cert_nasc` varchar(255) DEFAULT NULL,
  `rg` varchar(255) DEFAULT NULL,
  `rg_emissao` datetime DEFAULT NULL,
  `cpf` varchar(255) DEFAULT NULL,
  `t_eleitoral` varchar(255) DEFAULT NULL,
  `zon_sec` varchar(255) DEFAULT NULL,
  `reservista` varchar(255) DEFAULT NULL,
  `categoria` varchar(255) DEFAULT NULL,
  `reserv_emissao` datetime DEFAULT NULL,
  `reserv_orgemissor` varchar(255) DEFAULT NULL,
  `tipo` varchar(255) DEFAULT NULL,
  `residecom` varchar(255) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `bairro` varchar(255) DEFAULT NULL,
  `tel_cel` varchar(255) DEFAULT NULL,
  `tel_res` varchar(255) DEFAULT NULL,
  `cidade` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `cep` varchar(255) DEFAULT NULL,
  `fax` varchar(255) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `gr_sanguineo` char(255) DEFAULT NULL,
  `rh` char(255) DEFAULT NULL,
  `sarampo` int DEFAULT NULL,
  `catapora` int DEFAULT NULL,
  `coqueluche` int DEFAULT NULL,
  `caxumba` int DEFAULT NULL,
  `rubeola` int DEFAULT NULL,
  `dengue` int DEFAULT NULL,
  `h1n1` int DEFAULT NULL,
  `covid19` int DEFAULT NULL,
  `outras_doencas` int DEFAULT NULL,
  `esp_outras_doencas` varchar(255) DEFAULT NULL,
  `cardiovascular` int DEFAULT NULL,
  `neurologico` int DEFAULT NULL,
  `diabete` int DEFAULT NULL,
  `audicao` int DEFAULT NULL,
  `respiratorio` int DEFAULT NULL,
  `musculo_esqueletico` int DEFAULT NULL,
  `visao` int DEFAULT NULL,
  `outros_disturbios` int DEFAULT NULL,
  `esp_outros_disturbios` varchar(255) DEFAULT NULL,
  `medicacao` int DEFAULT NULL,
  `descricao_medicacao` varchar(255) DEFAULT NULL,
  `tratamento` int DEFAULT NULL,
  `descricao_tratamento` varchar(255) DEFAULT NULL,
  `anti_termico` varchar(255) DEFAULT NULL,
  `dosagem_anti_termico` varchar(255) DEFAULT NULL,
  `analgesico` varchar(255) DEFAULT NULL,
  `dosagem_analgesico` varchar(255) DEFAULT NULL,
  `cicatrizante` varchar(255) DEFAULT NULL,
  `dosagem_cicatrizante` varchar(255) DEFAULT NULL,
  `outra_medicacao` varchar(255) DEFAULT NULL,
  `dosagem_outra_medicacao` varchar(255) DEFAULT NULL,
  `cirurgia` int DEFAULT NULL,
  `descricao_cirurgia` varchar(255) DEFAULT NULL,
  `medico` varchar(255) DEFAULT NULL,
  `tel_medico` varchar(255) DEFAULT NULL,
  `dentista` varchar(255) DEFAULT NULL,
  `tel_dentista` varchar(255) DEFAULT NULL,
  `convenio` varchar(255) DEFAULT NULL,
  `hospital` varchar(255) DEFAULT NULL,
  `obs_medicas` longtext,
  `alergia` int DEFAULT NULL,
  `descricao_alergia` varchar(255) DEFAULT NULL,
  `obs` longtext,
  `nome_resp` varchar(255) DEFAULT NULL,
  `rg_resp` varchar(255) DEFAULT NULL,
  `cpf_resp` varchar(255) DEFAULT NULL,
  `nasc_resp` datetime DEFAULT NULL,
  `endereco_resp` varchar(255) DEFAULT NULL,
  `bairro_resp` varchar(255) DEFAULT NULL,
  `tel_cel_resp` varchar(255) DEFAULT NULL,
  `tel_res_resp` varchar(255) DEFAULT NULL,
  `cidade_resp` varchar(255) DEFAULT NULL,
  `estado_resp` varchar(255) DEFAULT NULL,
  `cep_resp` varchar(255) DEFAULT NULL,
  `fax_resp` varchar(255) DEFAULT NULL,
  `email_resp` varchar(255) DEFAULT NULL,
  `email_resp2` varchar(255) DEFAULT NULL,
  `empresa_resp` varchar(255) DEFAULT NULL,
  `cod_prof_resp` smallint DEFAULT NULL,
  `tel_emp_resp` varchar(255) DEFAULT NULL,
  `nome_resp_fin` varchar(255) DEFAULT NULL,
  `tipo_resp_fin` varchar(4) DEFAULT NULL,
  `rg_resp_fin` varchar(255) DEFAULT NULL,
  `cpf_resp_fin` varchar(255) DEFAULT NULL,
  `cnpj_resp_fin` varchar(255) DEFAULT NULL,
  `nasc_resp_fin` datetime DEFAULT NULL,
  `endereco_resp_fin` varchar(255) DEFAULT NULL,
  `bairro_resp_fin` varchar(255) DEFAULT NULL,
  `tel_cel_resp_fin` varchar(255) DEFAULT NULL,
  `tel_res_resp_fin` varchar(255) DEFAULT NULL,
  `cidade_resp_fin` varchar(255) DEFAULT NULL,
  `estado_resp_fin` varchar(255) DEFAULT NULL,
  `cep_resp_fin` varchar(255) DEFAULT NULL,
  `fax_resp_fin` varchar(255) DEFAULT NULL,
  `email_resp_fin` varchar(255) DEFAULT NULL,
  `email_resp_fin2` varchar(255) DEFAULT NULL,
  `empresa_resp_fin` varchar(255) DEFAULT NULL,
  `cod_prof_resp_fin` smallint DEFAULT NULL,
  `tel_emp_resp_fin` varchar(255) DEFAULT NULL,
  `cod_respfinanc` char(255) DEFAULT NULL,
  `cod_resp` char(255) DEFAULT NULL,
  `endrespfin` int DEFAULT NULL,
  `telrespfin` int DEFAULT NULL,
  `endresp` int DEFAULT NULL,
  `teltresp` int DEFAULT NULL,
  `nro_chamada` smallint DEFAULT NULL,
  `curso_nome` varchar(255) DEFAULT NULL,
  `curso` int DEFAULT NULL,
  `serie` smallint DEFAULT NULL,
  `turma` varchar(255) DEFAULT NULL,
  `dt_matricula` datetime DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `situacao_bib` smallint DEFAULT NULL,
  `obs_bib` longtext,
  `ult_emprestimo` varchar(255) DEFAULT NULL,
  `data_ult_emprestimo` datetime DEFAULT NULL,
  `rematriculado` int DEFAULT NULL,
  `obs_fin` varchar(255) DEFAULT NULL,
  `pesquisa` varchar(255) DEFAULT NULL,
  `tesouraria` int DEFAULT NULL,
  `periodo` varchar(255) DEFAULT NULL,
  `ano_letivo` int DEFAULT NULL,
  `coordenacao` int DEFAULT NULL,
  `obs_coo` varchar(255) DEFAULT NULL,
  `escola_destino` varchar(255) DEFAULT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `codigo_tipo_motivo` int DEFAULT NULL,
  `dia_transferencia` varchar(255) DEFAULT NULL,
  `senha` varchar(255) DEFAULT NULL,
  `grade` smallint DEFAULT NULL,
  `plano_pagamento` int DEFAULT NULL,
  `faz_tratamento_homeopatia` int DEFAULT NULL,
  `faz_tratamento_alopatia` int DEFAULT NULL,
  `teve_problema_ao_nascer` int DEFAULT NULL,
  `teve_problema_ao_nascer_qual` varchar(255) DEFAULT NULL,
  `convulsao_com_febre` int DEFAULT NULL,
  `convulsao_sem_febre` int DEFAULT NULL,
  `neurologista` int DEFAULT NULL,
  `neurologista_quando` varchar(255) DEFAULT NULL,
  `neurologista_porque` varchar(255) DEFAULT NULL,
  `tratamento_foniatrico` int DEFAULT NULL,
  `tratamento_foniatrico_porque` varchar(255) DEFAULT NULL,
  `tratamento_fisioterapico` int DEFAULT NULL,
  `tratamento_fisioterapico_porque` varchar(255) DEFAULT NULL,
  `escola_anterior` varchar(255) DEFAULT NULL,  
  `foi_retido` int DEFAULT NULL,
  `foi_retido_motivo` varchar(255) DEFAULT NULL,
  `existe_local_para_estudo` int DEFAULT NULL,
  `existe_horario_para_estudo` int DEFAULT NULL,
  `ha_acompanhamento_estudos` int DEFAULT NULL,
  `ha_acompanhamento_estudos_quem` varchar(255) DEFAULT NULL,  
  `meio_transporte_chegada_escola` varchar(255) DEFAULT NULL,
  `meio_transporte_saida_escola` varchar(255) DEFAULT NULL,
  `pessoa_autorizada_retirar_aluno1` varchar(255) DEFAULT NULL,
  `pessoa_autorizada_retirar_aluno2` varchar(255) DEFAULT NULL,
  `pessoa_autorizada_retirar_aluno3` varchar(255) DEFAULT NULL,
  `pessoa_autorizada_retirar_aluno4` varchar(255) DEFAULT NULL,
  `autorizado_deixar_colegio_sozinho` int DEFAULT NULL,
  `quem_fica_aluno_ausencia_pais` varchar(255) DEFAULT NULL,
  `relacionamento_mae` varchar(255) DEFAULT NULL,
  `relacionamento_pai` varchar(255) DEFAULT NULL,
  `reserva` int DEFAULT NULL,
  `concomitante` int DEFAULT NULL,
  `cor_raca` varchar(255) DEFAULT NULL,
  `programa_bilingue` int DEFAULT NULL,
  `curriculum_americano` int DEFAULT NULL,
  `nao_divulgar_imagem` int DEFAULT NULL,
  `prodesp` varchar(255) DEFAULT NULL,
  `latitude` varchar(255) DEFAULT NULL,
  `longitude` varchar(255) DEFAULT NULL,
  `santanna_mais` int DEFAULT NULL,
  `importado` int DEFAULT NULL,
  `assist_medica_emergencia` tinyint DEFAULT NULL,
  `obs_portaria` longtext,
  `necessidade_educ_especial` tinyint DEFAULT '0',
  `possui_laudo` tinyint DEFAULT '0',
  PRIMARY KEY (`ra`),
  KEY `idx_cadastro_alunos_ra` (`ra`),
  KEY `idx_cadastro_alunos_nome` (`nome`),
  KEY `idx_cadastro_alunos_cpf_resp` (`cpf_resp`),
  KEY `idx_cadastro_alunos_cpf_resp_fin` (`cpf_resp_fin`),
  KEY `idx_cadastro_alunos_familia` (`familia`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` 
SQL SECURITY DEFINER VIEW `alunos` AS 
select `a`.`ra` AS `ra`,`a`.`nome` AS `nome`,`a`.`nome_social` AS `nome_social`,`a`.`nacionalidade` AS `nacionalidade`,`a`.`natural_de` AS `natural_de`,`a`.`reside` AS `reside`,`a`.`nasc` AS `nasc`,`a`.`sexo` AS `sexo`,`a`.`estcivil` AS `estcivil`,`a`.`dt_cadastro` AS `dt_cadastro`,`a`.`email` AS `email`,`a`.`email2` AS `email2`,`a`.`familia` AS `familia`,`a`.`cod_religião` AS `cod_religião`,`a`.`cert_nasc` AS `cert_nasc`,`a`.`rg` AS `rg`,`a`.`rg_emissao` AS `rg_emissao`,`a`.`cpf` AS `cpf`,`a`.`t_eleitoral` AS `t_eleitoral`,`a`.`zon_sec` AS `zon_sec`,`a`.`reservista` AS `reservista`,`a`.`categoria` AS `categoria`,`a`.`reserv_emissao` AS `reserv_emissao`,`a`.`reserv_orgemissor` AS `reserv_orgemissor`,`a`.`tipo` AS `tipo`,`a`.`residecom` AS `residecom`,`a`.`endereco` AS `endereco`,`a`.`bairro` AS `bairro`,`a`.`tel_cel` AS `tel_cel`,`a`.`tel_res` AS `tel_res`,`a`.`cidade` AS `cidade`,`a`.`estado` AS `estado`,`a`.`cep` AS `cep`,`a`.`fax` AS `fax`,`a`.`foto` AS `foto`,`a`.`gr_sanguineo` AS `gr_sanguineo`,`a`.`rh` AS `rh`,`a`.`sarampo` AS `sarampo`,`a`.`catapora` AS `catapora`,`a`.`coqueluche` AS `coqueluche`,`a`.`caxumba` AS `caxumba`,`a`.`rubeola` AS `rubeola`,`a`.`dengue` AS `dengue`,`a`.`h1n1` AS `h1n1`,`a`.`covid19` AS `covid19`,`a`.`outras_doencas` AS `outras_doencas`,`a`.`esp_outras_doencas` AS `esp_outras_doencas`,`a`.`cardiovascular` AS `cardiovascular`,`a`.`neurologico` AS `neurologico`,`a`.`diabete` AS `diabete`,`a`.`audicao` AS `audicao`,`a`.`respiratorio` AS `respiratorio`,`a`.`musculo_esqueletico` AS `musculo_esqueletico`,`a`.`visao` AS `visao`,`a`.`outros_disturbios` AS `outros_disturbios`,`a`.`esp_outros_disturbios` AS `esp_outros_disturbios`,`a`.`medicacao` AS `medicacao`,`a`.`descricao_medicacao` AS `descricao_medicacao`,`a`.`tratamento` AS `tratamento`,`a`.`descricao_tratamento` AS `descricao_tratamento`,`a`.`anti_termico` AS `anti_termico`,`a`.`dosagem_anti_termico` AS `dosagem_anti_termico`,`a`.`analgesico` AS `analgesico`,`a`.`dosagem_analgesico` AS `dosagem_analgesico`,`a`.`cicatrizante` AS `cicatrizante`,`a`.`dosagem_cicatrizante` AS `dosagem_cicatrizante`,`a`.`outra_medicacao` AS `outra_medicacao`,`a`.`dosagem_outra_medicacao` AS `dosagem_outra_medicacao`,`a`.`cirurgia` AS `cirurgia`,`a`.`descricao_cirurgia` AS `descricao_cirurgia`,`a`.`medico` AS `medico`,`a`.`tel_medico` AS `tel_medico`,`a`.`dentista` AS `dentista`,`a`.`tel_dentista` AS `tel_dentista`,`a`.`convenio` AS `convenio`,`a`.`hospital` AS `hospital`,`a`.`obs_medicas` AS `obs_medicas`,`a`.`alergia` AS `alergia`,`a`.`descricao_alergia` AS `descricao_alergia`,`a`.`obs` AS `obs`,`a`.`nome_resp` AS `nome_resp`,`a`.`rg_resp` AS `rg_resp`,`a`.`cpf_resp` AS `cpf_resp`,`a`.`nasc_resp` AS `nasc_resp`,`a`.`endereco_resp` AS `endereco_resp`,`a`.`bairro_resp` AS `bairro_resp`,`a`.`tel_cel_resp` AS `tel_cel_resp`,`a`.`tel_res_resp` AS `tel_res_resp`,`a`.`cidade_resp` AS `cidade_resp`,`a`.`estado_resp` AS `estado_resp`,`a`.`cep_resp` AS `cep_resp`,`a`.`fax_resp` AS `fax_resp`,`a`.`email_resp` AS `email_resp`,`a`.`email_resp2` AS `email_resp2`,`a`.`empresa_resp` AS `empresa_resp`,`a`.`cod_prof_resp` AS `cod_prof_resp`,`a`.`tel_emp_resp` AS `tel_emp_resp`,`a`.`nome_resp_fin` AS `nome_resp_fin`,`a`.`tipo_resp_fin` AS `tipo_resp_fin`,`a`.`rg_resp_fin` AS `rg_resp_fin`,`a`.`cpf_resp_fin` AS `cpf_resp_fin`,`a`.`cnpj_resp_fin` AS `cnpj_resp_fin`,`a`.`nasc_resp_fin` AS `nasc_resp_fin`,`a`.`endereco_resp_fin` AS `endereco_resp_fin`,`a`.`bairro_resp_fin` AS `bairro_resp_fin`,`a`.`tel_cel_resp_fin` AS `tel_cel_resp_fin`,`a`.`tel_res_resp_fin` AS `tel_res_resp_fin`,`a`.`cidade_resp_fin` AS `cidade_resp_fin`,`a`.`estado_resp_fin` AS `estado_resp_fin`,`a`.`cep_resp_fin` AS `cep_resp_fin`,`a`.`fax_resp_fin` AS `fax_resp_fin`,`a`.`email_resp_fin` AS `email_resp_fin`,`a`.`email_resp_fin2` AS `email_resp_fin2`,`a`.`empresa_resp_fin` AS `empresa_resp_fin`,`a`.`cod_prof_resp_fin` AS `cod_prof_resp_fin`,`a`.`tel_emp_resp_fin` AS `tel_emp_resp_fin`,`a`.`cod_respfinanc` AS `cod_respfinanc`,`a`.`cod_resp` AS `cod_resp`,`a`.`endrespfin` AS `endrespfin`,`a`.`telrespfin` AS `telrespfin`,`a`.`endresp` AS `endresp`,`a`.`teltresp` AS `teltresp`,`m`.`nro_chamada` AS `nro_chamada`,`c`.`nome` AS `curso_nome`,`m`.`curso` AS `curso`,`m`.`serie` AS `serie`,`m`.`turma` AS `turma`,`m`.`data_matricula` AS `dt_matricula`,`m`.`status` AS `status`,`a`.`situacao_bib` AS `situacao_bib`,`a`.`obs_bib` AS `obs_bib`,`a`.`ult_emprestimo` AS `ult_emprestimo`,`a`.`data_ult_emprestimo` AS `data_ult_emprestimo`,`a`.`rematriculado` AS `rematriculado`,`a`.`obs_fin` AS `obs_fin`,`a`.`pesquisa` AS `pesquisa`,`a`.`tesouraria` AS `tesouraria`,`m`.`periodo` AS `periodo`,`m`.`ano_letivo` AS `ano_letivo`,`a`.`coordenacao` AS `coordenacao`,`a`.`obs_coo` AS `obs_coo`,`a`.`escola_destino` AS `escola_destino`,`a`.`motivo` AS `motivo`,`a`.`codigo_tipo_motivo` AS `codigo_tipo_motivo`,`m`.`data_saida` AS `dia_transferencia`,`a`.`senha` AS `senha`,`a`.`grade` AS `grade`,`a`.`plano_pagamento` AS `plano_pagamento`,`a`.`faz_tratamento_homeopatia` AS `faz_tratamento_homeopatia`,`a`.`faz_tratamento_alopatia` AS `faz_tratamento_alopatia`,`a`.`teve_problema_ao_nascer` AS `teve_problema_ao_nascer`,`a`.`teve_problema_ao_nascer_qual` AS `teve_problema_ao_nascer_qual`,`a`.`convulsao_com_febre` AS `convulsao_com_febre`,`a`.`convulsao_sem_febre` AS `convulsao_sem_febre`,`a`.`neurologista` AS `neurologista`,`a`.`neurologista_quando` AS `neurologista_quando`,`a`.`neurologista_porque` AS `neurologista_porque`,`a`.`tratamento_foniatrico` AS `tratamento_foniatrico`,`a`.`tratamento_foniatrico_porque` AS `tratamento_foniatrico_porque`,`a`.`tratamento_fisioterapico` AS `tratamento_fisioterapico`,`a`.`tratamento_fisioterapico_porque` AS `tratamento_fisioterapico_porque`,`a`.`escola_anterior` AS `escola_anterior`,`a`.`foi_retido` AS `foi_retido`,`a`.`foi_retido_motivo` AS `foi_retido_motivo`,`a`.`existe_local_para_estudo` AS `existe_local_para_estudo`,`a`.`existe_horario_para_estudo` AS `existe_horario_para_estudo`,`a`.`ha_acompanhamento_estudos` AS `ha_acompanhamento_estudos`,`a`.`ha_acompanhamento_estudos_quem` AS `ha_acompanhamento_estudos_quem`,`a`.`meio_transporte_chegada_escola` AS `meio_transporte_chegada_escola`,`a`.`meio_transporte_saida_escola` AS `meio_transporte_saida_escola`,`a`.`pessoa_autorizada_retirar_aluno1` AS `pessoa_autorizada_retirar_aluno1`,`a`.`pessoa_autorizada_retirar_aluno2` AS `pessoa_autorizada_retirar_aluno2`,`a`.`pessoa_autorizada_retirar_aluno3` AS `pessoa_autorizada_retirar_aluno3`,`a`.`pessoa_autorizada_retirar_aluno4` AS `pessoa_autorizada_retirar_aluno4`,`a`.`autorizado_deixar_colegio_sozinho` AS `autorizado_deixar_colegio_sozinho`,`a`.`quem_fica_aluno_ausencia_pais` AS `quem_fica_aluno_ausencia_pais`,`a`.`relacionamento_mae` AS `relacionamento_mae`,`a`.`relacionamento_pai` AS `relacionamento_pai`,`a`.`reserva` AS `reserva`,`a`.`concomitante` AS `concomitante`,`a`.`cor_raca` AS `cor_raca`,`a`.`programa_bilingue` AS `programa_bilingue`,`a`.`curriculum_americano` AS `curriculum_americano`,`a`.`nao_divulgar_imagem` AS `nao_divulgar_imagem`,`a`.`prodesp` AS `prodesp`,`a`.`latitude` AS `latitude`,`a`.`longitude` AS `longitude`,`a`.`santanna_mais` AS `santanna_mais`,`a`.`importado` AS `importado`,`a`.`assist_medica_emergencia` AS `assist_medica_emergencia`,`a`.`obs_portaria` AS `obs_portaria`,`a`.`necessidade_educ_especial` AS `necessidade_educ_especial`,`a`.`possui_laudo` AS `possui_laudo` from ((`cadastro_alunos` `a` join `matriculas_alunos` `m` on((`a`.`ra` = `m`.`ra`))) join `cursos` `c` on((`m`.`curso` = `c`.`codigo`))) where ((`m`.`ano_matricula` = '2025') and ((`m`.`ano_letivo` = '2025_2026') or (`m`.`ano_letivo` = '2025')) and (`m`.`status` = 'MAT') and (`c`.`ativo` = 1) and (`c`.`complementar` = 0));

CREATE TABLE `familias` (
  `codigo` double NOT NULL,
  `nome_pai` varchar(255) DEFAULT NULL,
  `rg_pai` varchar(255) DEFAULT NULL,
  `cpf_pai` varchar(255) DEFAULT NULL,
  `nasc_pai` datetime DEFAULT NULL,
  `endereco_pai` varchar(255) DEFAULT NULL,
  `bairro_pai` varchar(255) DEFAULT NULL,
  `tel_cel_pai` varchar(255) DEFAULT NULL,
  `tel_res_pai` varchar(255) DEFAULT NULL,
  `cidade_pai` varchar(255) DEFAULT NULL,
  `estado_pai` varchar(255) DEFAULT NULL,
  `cep_pai` varchar(255) DEFAULT NULL,
  `fax_pai` varchar(255) DEFAULT NULL,
  `email_pai` varchar(255) DEFAULT NULL,
  `email_pai2` varchar(255) DEFAULT NULL,
  `empresa_pai` varchar(255) DEFAULT NULL,
  `cod_prof_pai` smallint DEFAULT NULL,
  `tel_emp_pai` varchar(255) DEFAULT NULL,
  `nome_mae` varchar(255) DEFAULT NULL,
  `rg_mae` varchar(255) DEFAULT NULL,
  `cpf_mae` varchar(255) DEFAULT NULL,
  `nasc_mae` datetime DEFAULT NULL,
  `endereco_mae` varchar(255) DEFAULT NULL,
  `bairro_mae` varchar(255) DEFAULT NULL,
  `tel_cel_mae` varchar(255) DEFAULT NULL,
  `tel_res_mae` varchar(255) DEFAULT NULL,
  `cidade_mae` varchar(255) DEFAULT NULL,
  `estado_mae` varchar(255) DEFAULT NULL,
  `cep_mae` varchar(255) DEFAULT NULL,
  `fax_mae` varchar(255) DEFAULT NULL,
  `email_mae` varchar(255) DEFAULT NULL,
  `email_mae2` varchar(255) DEFAULT NULL,
  `empresa_mae` varchar(255) DEFAULT NULL,
  `cod_prof_mae` smallint DEFAULT NULL,
  `tel_emp_mae` varchar(255) DEFAULT NULL,
  `telpaialuno` int DEFAULT NULL,
  `telmaealuno` int DEFAULT NULL,
  `endmaealuno` int DEFAULT NULL,
  `endpaialuno` int DEFAULT NULL,
  `falecido_pai` int DEFAULT NULL,
  `falecido_mae` int DEFAULT NULL,
  `estado_civil_pais` varchar(255) DEFAULT NULL,
  `nacionalidade_pai` smallint DEFAULT NULL,
  `nacionalidade_mae` smallint DEFAULT NULL,
  `grau_instrucao_pai` varchar(255) DEFAULT NULL,
  `grau_instrucao_mae` varchar(255) DEFAULT NULL,
  `codigo_formacao_pai` smallint DEFAULT NULL,
  `codigo_formacao_mae` smallint DEFAULT NULL,
  `conjuge_pai_nome` varchar(255) DEFAULT NULL,
  `conjuge_pai_telefone` varchar(255) DEFAULT NULL,
  `conjuge_mae_nome` varchar(255) DEFAULT NULL,
  `conjuge_mae_telefone` varchar(255) DEFAULT NULL,
  `estado_civil_pai` varchar(255) DEFAULT NULL,
  `estado_civil_mae` varchar(255) DEFAULT NULL,
  `pai_nova_uniao_marital` int DEFAULT NULL,
  `mae_nova_uniao_marital` int DEFAULT NULL,
  `tipo_resp1` varchar(45) DEFAULT 'Pai',
  `tipo_resp2` varchar(45) DEFAULT 'Mãe',
  `avisos_pedagogicos_resp1` tinyint DEFAULT NULL,
  `avisos_pedagogicos_resp2` tinyint DEFAULT NULL,
  PRIMARY KEY (`codigo`),
  KEY `idx_familia_codigo` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- tabela dos funcionários da escola
CREATE TABLE `funcionarios` (
  `codigo` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) DEFAULT NULL,
  `nacionalidade` smallint DEFAULT NULL,
  `natural_de` varchar(255) DEFAULT NULL,
  `reside` varchar(255) DEFAULT NULL,
  `nasc` date DEFAULT NULL,
  `sexo` varchar(255) DEFAULT NULL,
  `estcivil` varchar(255) DEFAULT NULL,
  `dt_cadastro` date DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `email_pessoal` varchar(255) DEFAULT NULL,
  `cert_nasc` varchar(255) DEFAULT NULL,
  `rg` varchar(255) DEFAULT NULL,
  `rg_emissao` date DEFAULT NULL,
  `cpf` varchar(255) DEFAULT NULL,
  `t_eleitoral` varchar(255) DEFAULT NULL,
  `zon_sec` varchar(255) DEFAULT NULL,
  `reservista` varchar(255) DEFAULT NULL,
  `categoria` varchar(255) DEFAULT NULL,
  `reserv_emissao` date DEFAULT NULL,
  `reserv_orgemissor` varchar(255) DEFAULT NULL,
  `tipo` varchar(255) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `bairro` varchar(255) DEFAULT NULL,
  `tel_cel` varchar(255) DEFAULT NULL,
  `tel_res` varchar(255) DEFAULT NULL,
  `cidade` varchar(255) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `cep` varchar(255) DEFAULT NULL,
  `fax` varchar(255) DEFAULT NULL,
  `e_professor` int DEFAULT NULL,
  `cargo` varchar(255) DEFAULT NULL,
  `obs` longtext,
  `senha` varchar(255) DEFAULT NULL,
  `horentrada` time DEFAULT NULL,
  `horalmocoinicio` time DEFAULT NULL,
  `horalmocofim` time DEFAULT NULL,
  `horsaida` time DEFAULT NULL,
  `departamento` varchar(255) DEFAULT NULL,
  `inativo` int DEFAULT NULL,
  `data_saida` date DEFAULT NULL,
  `end_numero` varchar(20) DEFAULT NULL,
  `end_complemento` varchar(45) DEFAULT NULL,
  `dt_admissao` date DEFAULT NULL,
  `rnm_numero` varchar(50) DEFAULT NULL,
  `rnm_validade` varchar(50) DEFAULT NULL,
  `rnm_prazo_residencia` varchar(50) DEFAULT NULL,
  `data_atualizacao_funcionario` datetime DEFAULT NULL COMMENT 'data de atualização de cadastro de funcionário. o funcionário deve atualizar a cada 6 meses.',
  `acesso_kids` tinyint DEFAULT '0',
  PRIMARY KEY (`codigo`),
  KEY `idx_funcionario_codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=2706 DEFAULT CHARSET=latin1;
-- fim - tabelas que já existem no banco de dados

-- início - script sistema cantina

-- início - tabelas

/* =====================================================================
   TABELAS DO SISTEMA DA CANTINA
   Todas iniciadas com o prefixo cant_ conforme convenção.
   Observações gerais:
   - Campos padronizados: id BIGINT PK AUTO_INCREMENT, created_at, updated_at
   - Campos monetários DECIMAL(12,2)
   - Evitar duplicação de lógica: saldos consolidados em views; triggers para consistência
   - Tabelas legadas (alunos, funcionarios, familias) NÃO são alteradas
   ===================================================================== */

/* Usuários internos do sistema da cantina */
CREATE TABLE IF NOT EXISTS `cant_usuarios` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(120) NOT NULL,
  `usuario` VARCHAR(60) NOT NULL UNIQUE,
  `senha_hash` VARCHAR(255) NOT NULL COMMENT 'Hash (bcrypt, argon2, etc)',
  `tipo` ENUM('ADMIN','ATENDENTE','ESTOQUISTA') NOT NULL DEFAULT 'ATENDENTE',
  `ativo` TINYINT NOT NULL DEFAULT 1,
  `ultimo_login` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_usuarios_tipo` (`tipo`),
  KEY `idx_cant_usuarios_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Exemplo: usuário administrador para teste (senha: admin123)
INSERT INTO `cant_usuarios` (`nome`, `usuario`, `senha_hash`, `tipo`, `ativo`) VALUES
('Administrador', 'admin', '$2a$10$3TXw/ztlf.eDNdiRDOWkWOt1QGCvh/8gAV1ZPNAdNW0YAMWjSnL9.', 'ADMIN', 1)
ON DUPLICATE KEY UPDATE nome=VALUES(nome), senha_hash=VALUES(senha_hash), tipo=VALUES(tipo), ativo=VALUES(ativo);

/* Tipos de produtos */
CREATE TABLE IF NOT EXISTS `cant_produto_tipo` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `descricao` VARCHAR(80) NOT NULL,
  `codigo` VARCHAR(40) NOT NULL UNIQUE,
  `exige_peso` TINYINT NOT NULL DEFAULT 0 COMMENT '1=calcula por kg',
  `ativo` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_produto_tipo_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* Produtos */
CREATE TABLE IF NOT EXISTS `cant_produtos` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `tipo_id` BIGINT NOT NULL,
  `nome` VARCHAR(120) NOT NULL,
  `descricao` VARCHAR(255) NULL,
  `preco_unitario` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `codigo_barra` VARCHAR(60) NULL UNIQUE,
  `estoque_minimo` DECIMAL(12,3) NULL DEFAULT 0.000 COMMENT 'Quantidade mínima para alerta de baixo estoque',
  `ativo` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cant_produtos_nome` (`nome`),
  KEY `idx_cant_produtos_tipo` (`tipo_id`),
  KEY `idx_cant_produtos_ativo` (`ativo`),
  CONSTRAINT `fk_cant_produtos_tipo` FOREIGN KEY (`tipo_id`) REFERENCES `cant_produto_tipo` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* Movimentações de estoque */
CREATE TABLE IF NOT EXISTS `cant_estoque_mov` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `produto_id` BIGINT NOT NULL,
  `tipo_mov` ENUM('ENTRADA','SAIDA','AJUSTE_POSITIVO','AJUSTE_NEGATIVO','SAIDA_VENDA') NOT NULL,
  `quantidade` DECIMAL(12,3) NOT NULL,
  `custo_unitario` DECIMAL(12,4) NULL,
  `referencia` VARCHAR(80) NULL,
  `observacao` VARCHAR(255) NULL,
  `usuario_id` BIGINT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_estoque_mov_produto` (`produto_id`),
  KEY `idx_cant_estoque_mov_tipo` (`tipo_mov`),
  CONSTRAINT `fk_cant_estoque_mov_produto` FOREIGN KEY (`produto_id`) REFERENCES `cant_produtos` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_cant_estoque_mov_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `cant_usuarios` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* Caixa (abertura/fechamento) */
CREATE TABLE IF NOT EXISTS `cant_caixa` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `usuario_abertura_id` BIGINT NOT NULL,
  `usuario_fechamento_id` BIGINT NULL,
  `data_abertura` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_fechamento` DATETIME NULL,
  `valor_inicial` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `valor_fechamento_informado` DECIMAL(12,2) NULL,
  `valor_fechamento_calculado` DECIMAL(12,2) NULL,
  `diferenca` DECIMAL(12,2) NULL,
  `status` ENUM('ABERTO','FECHADO') NOT NULL DEFAULT 'ABERTO',
  PRIMARY KEY (`id`),
  KEY `idx_cant_caixa_status` (`status`),
  CONSTRAINT `fk_cant_caixa_usuario_abertura` FOREIGN KEY (`usuario_abertura_id`) REFERENCES `cant_usuarios` (`id`),
  CONSTRAINT `fk_cant_caixa_usuario_fechamento` FOREIGN KEY (`usuario_fechamento_id`) REFERENCES `cant_usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* Movimentos de caixa */
CREATE TABLE IF NOT EXISTS `cant_caixa_mov` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `caixa_id` BIGINT NOT NULL,
  `tipo` ENUM('VENDA','SANGRIA','REFORCO','AJUSTE') NOT NULL,
  `valor` DECIMAL(12,2) NOT NULL,
  `descricao` VARCHAR(255) NULL,
  `referencia` VARCHAR(60) NULL,
  `usuario_id` BIGINT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_caixa_mov_caixa` (`caixa_id`),
  KEY `idx_cant_caixa_mov_tipo` (`tipo`),
  CONSTRAINT `fk_cant_caixa_mov_caixa` FOREIGN KEY (`caixa_id`) REFERENCES `cant_caixa` (`id`),
  CONSTRAINT `fk_cant_caixa_mov_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `cant_usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* Vendas (cabeçalho) */
CREATE TABLE IF NOT EXISTS `cant_venda` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `caixa_id` BIGINT NULL,
  `usuario_id` BIGINT NOT NULL,
  `tipo_comprador` ENUM('ALUNO','FUNCIONARIO_ESCOLA','AVULSA') NOT NULL,
  `comprador_aluno_ra` INT NULL,
  `comprador_funcionario_id` INT NULL,
  `forma_pagamento` ENUM('DINHEIRO','CARTAO','SALDO_ALUNO','CONTA_FUNCIONARIO','PACOTE','OUTRO') NOT NULL,
  `valor_bruto` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `desconto` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `valor_liquido` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `observacao` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_venda_caixa` (`caixa_id`),
  KEY `idx_cant_venda_tipo_comp` (`tipo_comprador`),
  KEY `idx_cant_venda_forma_pg` (`forma_pagamento`),
  KEY `idx_cant_venda_aluno` (`comprador_aluno_ra`),
  KEY `idx_cant_venda_func` (`comprador_funcionario_id`),
  CONSTRAINT `fk_cant_venda_caixa` FOREIGN KEY (`caixa_id`) REFERENCES `cant_caixa` (`id`),
  CONSTRAINT `fk_cant_venda_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `cant_usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* Itens de venda */
CREATE TABLE IF NOT EXISTS `cant_venda_item` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `venda_id` BIGINT NOT NULL,
  `produto_id` BIGINT NOT NULL,
  `quantidade` DECIMAL(12,3) NOT NULL,
  `preco_unitario` DECIMAL(12,2) NOT NULL,
  `valor_total` DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cant_venda_item_venda` (`venda_id`),
  KEY `idx_cant_venda_item_produto` (`produto_id`),
  CONSTRAINT `fk_cant_venda_item_venda` FOREIGN KEY (`venda_id`) REFERENCES `cant_venda` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cant_venda_item_produto` FOREIGN KEY (`produto_id`) REFERENCES `cant_produtos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* Movimentações de saldo de alunos */
CREATE TABLE IF NOT EXISTS `cant_aluno_saldo_mov` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `aluno_ra` INT NOT NULL,
  `tipo` ENUM('CREDITO','DEBITO') NOT NULL,
  `valor` DECIMAL(12,2) NOT NULL,
  `origem` ENUM('RECARGA','VENDA','AJUSTE') NOT NULL,
  `referencia` VARCHAR(60) NULL,
  `observacao` VARCHAR(255) NULL,
  `usuario_id` BIGINT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_aluno_saldo_mov_aluno` (`aluno_ra`),
  KEY `idx_cant_aluno_saldo_mov_tipo` (`tipo`),
  KEY `idx_cant_aluno_saldo_mov_origem` (`origem`),
  CONSTRAINT `fk_cant_aluno_saldo_mov_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `cant_usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* Tipos de pacotes */
CREATE TABLE IF NOT EXISTS `cant_pacote_tipo` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `codigo` VARCHAR(60) NOT NULL UNIQUE,
  `descricao` VARCHAR(255) NOT NULL,
  `dias_validade` INT NOT NULL,
  `max_usos_dia` INT NULL,
  `preco` DECIMAL(12,2) NOT NULL,
  `ativo` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_pacote_tipo_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* Pacotes adquiridos */
CREATE TABLE IF NOT EXISTS `cant_pacote_aluno` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `aluno_ra` INT NOT NULL,
  `pacote_tipo_id` BIGINT NOT NULL,
  `data_compra` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_inicio` DATE NOT NULL,
  `data_fim` DATE NOT NULL,
  `usos_totais` INT NOT NULL DEFAULT 0,
  `usos_restantes` INT NOT NULL DEFAULT 0,
  `status` ENUM('ATIVO','CONSUMIDO','EXPIRADO','CANCELADO') NOT NULL DEFAULT 'ATIVO',
  `usuario_id` BIGINT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cant_pacote_aluno_aluno` (`aluno_ra`),
  KEY `idx_cant_pacote_aluno_status` (`status`),
  CONSTRAINT `fk_cant_pacote_aluno_tipo` FOREIGN KEY (`pacote_tipo_id`) REFERENCES `cant_pacote_tipo` (`id`),
  CONSTRAINT `fk_cant_pacote_aluno_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `cant_usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* Utilizações de pacotes */
CREATE TABLE IF NOT EXISTS `cant_pacote_utilizacao` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `pacote_aluno_id` BIGINT NOT NULL,
  `venda_id` BIGINT NULL,
  `data_utilizacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_pacote_utilizacao_pacote` (`pacote_aluno_id`),
  KEY `idx_cant_pacote_utilizacao_venda` (`venda_id`),
  CONSTRAINT `fk_cant_pacote_utilizacao_pacote` FOREIGN KEY (`pacote_aluno_id`) REFERENCES `cant_pacote_aluno` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cant_pacote_utilizacao_venda` FOREIGN KEY (`venda_id`) REFERENCES `cant_venda` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* Restrições por produto */
CREATE TABLE IF NOT EXISTS `cant_aluno_restricao_produto` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `aluno_ra` INT NOT NULL,
  `produto_id` BIGINT NOT NULL,
  `motivo` VARCHAR(255) NULL,
  `ativo` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cant_aluno_restricao_produto` (`aluno_ra`,`produto_id`),
  KEY `idx_cant_aluno_restricao_produto_ativo` (`ativo`),
  CONSTRAINT `fk_cant_aluno_restricao_produto_produto` FOREIGN KEY (`produto_id`) REFERENCES `cant_produtos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* Restrições por tipo */
CREATE TABLE IF NOT EXISTS `cant_aluno_restricao_tipo` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `aluno_ra` INT NOT NULL,
  `tipo_produto_id` BIGINT NOT NULL,
  `motivo` VARCHAR(255) NULL,
  `ativo` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cant_aluno_restricao_tipo` (`aluno_ra`,`tipo_produto_id`),
  KEY `idx_cant_aluno_restricao_tipo_ativo` (`ativo`),
  CONSTRAINT `fk_cant_aluno_restricao_tipo_tipo` FOREIGN KEY (`tipo_produto_id`) REFERENCES `cant_produto_tipo` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* Observações do aluno */
CREATE TABLE IF NOT EXISTS `cant_aluno_observacao` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `aluno_ra` INT NOT NULL,
  `observacao` VARCHAR(255) NOT NULL,
  `ativo` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_aluno_observacao_aluno` (`aluno_ra`),
  KEY `idx_cant_aluno_observacao_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* Preço por cargo (funcionários escola) */
CREATE TABLE IF NOT EXISTS `cant_preco_cargo` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `cargo` VARCHAR(255) NOT NULL,
  `descricao` VARCHAR(255) NULL,
  `valor_refeicao` DECIMAL(12,2) NOT NULL,
  `ativo` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cant_preco_cargo_cargo` (`cargo`),
  KEY `idx_cant_preco_cargo_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* Lançamentos em conta mensal funcionário escola */
CREATE TABLE IF NOT EXISTS `cant_funcionario_conta_lanc` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `funcionario_id` INT NOT NULL,
  `venda_id` BIGINT NULL,
  `mes` INT NOT NULL,
  `ano` INT NOT NULL,
  `valor` DECIMAL(12,2) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_func_conta_periodo` (`funcionario_id`,`ano`,`mes`),
  CONSTRAINT `fk_cant_func_conta_venda` FOREIGN KEY (`venda_id`) REFERENCES `cant_venda` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* Faturas mensais funcionário escola */
CREATE TABLE IF NOT EXISTS `cant_funcionario_fatura` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `funcionario_id` INT NOT NULL,
  `mes` INT NOT NULL,
  `ano` INT NOT NULL,
  `valor_total` DECIMAL(12,2) NOT NULL,
  `data_geracao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('ABERTA','ENVIADA','PAGA','CANCELADA') NOT NULL DEFAULT 'ABERTA',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cant_func_fatura_unica` (`funcionario_id`,`ano`,`mes`),
  KEY `idx_cant_func_fatura_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* Contas a pagar */
CREATE TABLE IF NOT EXISTS `cant_contas_pagar` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `descricao` VARCHAR(255) NOT NULL,
  `valor` DECIMAL(12,2) NOT NULL,
  `data_emissao` DATE NOT NULL,
  `data_vencimento` DATE NOT NULL,
  `data_pagamento` DATE NULL,
  `status` ENUM('ABERTA','PAGA','CANCELADA') NOT NULL DEFAULT 'ABERTA',
  `observacao` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cant_contas_pagar_status` (`status`),
  KEY `idx_cant_contas_pagar_venc` (`data_vencimento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* Contas a receber */
CREATE TABLE IF NOT EXISTS `cant_contas_receber` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `descricao` VARCHAR(255) NOT NULL,
  `valor` DECIMAL(12,2) NOT NULL,
  `data_emissao` DATE NOT NULL,
  `data_vencimento` DATE NOT NULL,
  `data_recebimento` DATE NULL,
  `status` ENUM('ABERTA','RECEBIDA','CANCELADA') NOT NULL DEFAULT 'ABERTA',
  `observacao` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cant_contas_receber_status` (`status`),
  KEY `idx_cant_contas_receber_venc` (`data_vencimento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- fim - tabelas

-- início - views

/* View saldo de estoque */
DROP VIEW IF EXISTS `cant_view_estoque_saldo`;
CREATE VIEW `cant_view_estoque_saldo` AS
SELECT p.id AS produto_id,
       p.nome,
  p.estoque_minimo,
       COALESCE(SUM(CASE WHEN em.tipo_mov IN ('ENTRADA','AJUSTE_POSITIVO') THEN em.quantidade
                         WHEN em.tipo_mov IN ('SAIDA','AJUSTE_NEGATIVO','SAIDA_VENDA') THEN -em.quantidade
                         ELSE 0 END),0) AS saldo
FROM cant_produtos p
LEFT JOIN cant_estoque_mov em ON em.produto_id = p.id
GROUP BY p.id, p.nome;

/* View saldo de alunos */
DROP VIEW IF EXISTS `cant_view_aluno_saldo`;
CREATE VIEW `cant_view_aluno_saldo` AS
SELECT m.aluno_ra,
       COALESCE(SUM(CASE WHEN m.tipo='CREDITO' THEN m.valor ELSE -m.valor END),0) AS saldo_atual
FROM cant_aluno_saldo_mov m
GROUP BY m.aluno_ra;

/* Consumo mensal funcionário escola */
DROP VIEW IF EXISTS `cant_view_funcionario_consumo_mes`;
CREATE VIEW `cant_view_funcionario_consumo_mes` AS
SELECT l.funcionario_id,l.ano,l.mes,SUM(l.valor) AS total_mes
FROM cant_funcionario_conta_lanc l
GROUP BY l.funcionario_id,l.ano,l.mes;

/* Produtos mais vendidos */
DROP VIEW IF EXISTS `cant_view_produtos_mais_vendidos`;
CREATE VIEW `cant_view_produtos_mais_vendidos` AS
SELECT vi.produto_id,p.nome,
       SUM(vi.quantidade) AS quantidade_total,
       SUM(vi.valor_total) AS valor_total
FROM cant_venda_item vi
JOIN cant_produtos p ON p.id = vi.produto_id
GROUP BY vi.produto_id,p.nome
ORDER BY quantidade_total DESC;

/* Performance de usuários (vendedores) */
DROP VIEW IF EXISTS `cant_view_performance_funcionario`;
CREATE VIEW `cant_view_performance_funcionario` AS
SELECT v.usuario_id,u.nome AS usuario_nome,
       COUNT(DISTINCT v.id) AS qtde_vendas,
       SUM(v.valor_liquido) AS total_vendido
FROM cant_venda v
JOIN cant_usuarios u ON u.id = v.usuario_id
GROUP BY v.usuario_id,u.nome;

-- fim - views

-- início - triggers

DROP TRIGGER IF EXISTS `trg_cant_venda_bi`;
DELIMITER $$
/* Calcula valor_liquido antes de inserir venda */
CREATE TRIGGER `trg_cant_venda_bi`
BEFORE INSERT ON `cant_venda`
FOR EACH ROW
BEGIN
  SET NEW.valor_liquido = NEW.valor_bruto - NEW.desconto;
END $$
DELIMITER ;

DROP TRIGGER IF EXISTS `trg_cant_venda_item_ai`;
DELIMITER $$
/* Gera saída de estoque após inserir item de venda */
CREATE TRIGGER `trg_cant_venda_item_ai`
AFTER INSERT ON `cant_venda_item`
FOR EACH ROW
BEGIN
  -- Insere movimento de estoque atribuindo usuario_id do cabeçalho da venda quando disponível
  INSERT INTO cant_estoque_mov (produto_id, tipo_mov, quantidade, referencia, observacao, usuario_id)
  VALUES (
    NEW.produto_id,
    'SAIDA_VENDA',
    NEW.quantidade,
    CONCAT('VENDA#', NEW.venda_id),
    'Saída automática por venda',
    (SELECT usuario_id FROM cant_venda WHERE id = NEW.venda_id LIMIT 1)
  );
END $$
DELIMITER ;

DROP TRIGGER IF EXISTS `trg_cant_venda_ai_saldo_aluno`;
DELIMITER $$
/* Debita saldo aluno pós venda com SALDO_ALUNO */
CREATE TRIGGER `trg_cant_venda_ai_saldo_aluno`
AFTER INSERT ON `cant_venda`
FOR EACH ROW
BEGIN
  IF NEW.forma_pagamento = 'SALDO_ALUNO' AND NEW.comprador_aluno_ra IS NOT NULL THEN
    INSERT INTO cant_aluno_saldo_mov (aluno_ra, tipo, valor, origem, referencia, observacao)
    VALUES (NEW.comprador_aluno_ra, 'DEBITO', NEW.valor_liquido, 'VENDA', CONCAT('VENDA#', NEW.id), 'Débito automático venda');
  END IF;
END $$
DELIMITER ;

DROP TRIGGER IF EXISTS `trg_cant_venda_ai_func_conta`;
DELIMITER $$
/* Lança valor em conta funcionário */
CREATE TRIGGER `trg_cant_venda_ai_func_conta`
AFTER INSERT ON `cant_venda`
FOR EACH ROW
BEGIN
  IF NEW.forma_pagamento = 'CONTA_FUNCIONARIO' AND NEW.comprador_funcionario_id IS NOT NULL THEN
    INSERT INTO cant_funcionario_conta_lanc (funcionario_id, venda_id, mes, ano, valor)
    VALUES (NEW.comprador_funcionario_id, NEW.id, MONTH(NEW.created_at), YEAR(NEW.created_at), NEW.valor_liquido);
  END IF;
END $$
DELIMITER ;

DROP TRIGGER IF EXISTS `trg_cant_pacote_utilizacao_ai`;
DELIMITER $$
/* Decrementa usos de pacote após utilização */
CREATE TRIGGER `trg_cant_pacote_utilizacao_ai`
AFTER INSERT ON `cant_pacote_utilizacao`
FOR EACH ROW
BEGIN
  UPDATE cant_pacote_aluno SET usos_restantes = usos_restantes - 1 WHERE id = NEW.pacote_aluno_id;
  UPDATE cant_pacote_aluno SET status = 'CONSUMIDO'
   WHERE id = NEW.pacote_aluno_id AND usos_restantes <= 0 AND status = 'ATIVO';
END $$
DELIMITER ;

-- fim - triggers

-- início - funções

DROP FUNCTION IF EXISTS `cant_fn_valor_refeicao_cargo`;
DELIMITER $$
/* Valor refeição por cargo */
CREATE FUNCTION `cant_fn_valor_refeicao_cargo`(p_cargo VARCHAR(255))
RETURNS DECIMAL(12,2)
DETERMINISTIC
BEGIN
  DECLARE v_valor DECIMAL(12,2);
  SELECT valor_refeicao INTO v_valor FROM cant_preco_cargo WHERE cargo = p_cargo AND ativo = 1 LIMIT 1;
  RETURN v_valor;
END $$
DELIMITER ;

DROP FUNCTION IF EXISTS `cant_fn_saldo_aluno`;
DELIMITER $$
/* Saldo atual aluno */
CREATE FUNCTION `cant_fn_saldo_aluno`(p_aluno_ra INT)
RETURNS DECIMAL(12,2)
DETERMINISTIC
BEGIN
  DECLARE v_saldo DECIMAL(12,2);
  SELECT saldo_atual INTO v_saldo FROM cant_view_aluno_saldo WHERE aluno_ra = p_aluno_ra LIMIT 1;
  RETURN IFNULL(v_saldo,0.00);
END $$
DELIMITER ;

DROP FUNCTION IF EXISTS `cant_fn_aluno_restrito_produto`;
DELIMITER $$
/* Aluno restrito a produto? */
CREATE FUNCTION `cant_fn_aluno_restrito_produto`(p_aluno_ra INT, p_produto_id BIGINT)
RETURNS TINYINT
DETERMINISTIC
BEGIN
  RETURN IF(EXISTS(SELECT 1 FROM cant_aluno_restricao_produto WHERE aluno_ra=p_aluno_ra AND produto_id=p_produto_id AND ativo=1),1,0);
END $$
DELIMITER ;

DROP FUNCTION IF EXISTS `cant_fn_aluno_restrito_tipo`;
DELIMITER $$
/* Aluno restrito a tipo? */
CREATE FUNCTION `cant_fn_aluno_restrito_tipo`(p_aluno_ra INT, p_tipo_id BIGINT)
RETURNS TINYINT
DETERMINISTIC
BEGIN
  RETURN IF(EXISTS(SELECT 1 FROM cant_aluno_restricao_tipo WHERE aluno_ra=p_aluno_ra AND tipo_produto_id=p_tipo_id AND ativo=1),1,0);
END $$
DELIMITER ;

-- fim - funções

-- início - stored procedures

DROP PROCEDURE IF EXISTS `cant_sp_credita_saldo_aluno`;
DELIMITER $$
/* Credita saldo aluno */
CREATE PROCEDURE `cant_sp_credita_saldo_aluno`(IN p_aluno_ra INT, IN p_valor DECIMAL(12,2), IN p_observacao VARCHAR(255))
BEGIN
  INSERT INTO cant_aluno_saldo_mov (aluno_ra, tipo, valor, origem, referencia, observacao)
  VALUES (p_aluno_ra, 'CREDITO', p_valor, 'RECARGA', CONCAT('REC-', UUID()), p_observacao);
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS `cant_sp_compra_pacote`;
DELIMITER $$
/* Compra de pacote */
CREATE PROCEDURE `cant_sp_compra_pacote`(IN p_aluno_ra INT, IN p_pacote_tipo_id BIGINT, IN p_data_inicio DATE, IN p_usuario_id BIGINT)
BEGIN
  DECLARE v_dias INT; DECLARE v_preco DECIMAL(12,2);
  SELECT dias_validade, preco INTO v_dias, v_preco FROM cant_pacote_tipo WHERE id = p_pacote_tipo_id AND ativo = 1;
  IF v_dias IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Pacote tipo inválido ou inativo'; END IF;
  INSERT INTO cant_pacote_aluno (aluno_ra, pacote_tipo_id, data_inicio, data_fim, usos_totais, usos_restantes, usuario_id)
  VALUES (p_aluno_ra, p_pacote_tipo_id, p_data_inicio, DATE_ADD(p_data_inicio, INTERVAL v_dias DAY), v_dias, v_dias, p_usuario_id);
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS `cant_sp_fecha_caixa`;
DELIMITER $$
/* Fecha caixa */
CREATE PROCEDURE `cant_sp_fecha_caixa`(IN p_caixa_id BIGINT, IN p_usuario_fechamento BIGINT, IN p_valor_informado DECIMAL(12,2))
BEGIN
  DECLARE v_total_vendas DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_total_reforco DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_total_sangria DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_valor_inicial DECIMAL(12,2) DEFAULT 0.00;
  SELECT valor_inicial INTO v_valor_inicial FROM cant_caixa WHERE id = p_caixa_id AND status='ABERTO' FOR UPDATE;
  IF v_valor_inicial IS NULL THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Caixa não encontrado ou fechado'; END IF;
  SELECT COALESCE(SUM(valor),0) INTO v_total_vendas FROM cant_caixa_mov WHERE caixa_id=p_caixa_id AND tipo='VENDA';
  SELECT COALESCE(SUM(valor),0) INTO v_total_reforco FROM cant_caixa_mov WHERE caixa_id=p_caixa_id AND tipo='REFORCO';
  SELECT COALESCE(SUM(valor),0) INTO v_total_sangria FROM cant_caixa_mov WHERE caixa_id=p_caixa_id AND tipo='SANGRIA';
  UPDATE cant_caixa SET usuario_fechamento_id=p_usuario_fechamento, data_fechamento=NOW(), valor_fechamento_informado=p_valor_informado,
    valor_fechamento_calculado=valor_inicial + v_total_vendas + v_total_reforco - v_total_sangria,
    diferenca = p_valor_informado - (valor_inicial + v_total_vendas + v_total_reforco - v_total_sangria), status='FECHADO'
  WHERE id=p_caixa_id;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS `cant_sp_gera_faturas_funcionarios`;
DELIMITER $$
/* Gera faturas mensais funcionários */
CREATE PROCEDURE `cant_sp_gera_faturas_funcionarios`(IN p_ano INT, IN p_mes INT)
BEGIN
  INSERT INTO cant_funcionario_fatura (funcionario_id, mes, ano, valor_total)
  SELECT funcionario_id, p_mes, p_ano, SUM(valor)
  FROM cant_funcionario_conta_lanc l
  WHERE l.ano=p_ano AND l.mes=p_mes
    AND NOT EXISTS (
      SELECT 1 FROM cant_funcionario_fatura f WHERE f.funcionario_id=l.funcionario_id AND f.ano=p_ano AND f.mes=p_mes
    )
  GROUP BY funcionario_id;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS `cant_sp_registra_venda`;
DELIMITER $$
/* Registra venda simples (cabeçalho) - itens devem ser inseridos depois */
CREATE PROCEDURE `cant_sp_registra_venda`(
  IN p_usuario_id BIGINT,
  IN p_caixa_id BIGINT,
  IN p_tipo_comprador ENUM('ALUNO','FUNCIONARIO_ESCOLA','AVULSA'),
  IN p_aluno_ra INT,
  IN p_funcionario_id INT,
  IN p_forma_pag ENUM('DINHEIRO','CARTAO','SALDO_ALUNO','CONTA_FUNCIONARIO','PACOTE','OUTRO'),
  IN p_desconto DECIMAL(12,2),
  IN p_observacao VARCHAR(255)
)
BEGIN
  DECLARE v_valor_bruto DECIMAL(12,2) DEFAULT 0.00;
  INSERT INTO cant_venda (caixa_id, usuario_id, tipo_comprador, comprador_aluno_ra, comprador_funcionario_id, forma_pagamento, valor_bruto, desconto, valor_liquido, observacao)
  VALUES (p_caixa_id, p_usuario_id, p_tipo_comprador, p_aluno_ra, p_funcionario_id, p_forma_pag, v_valor_bruto, p_desconto, v_valor_bruto - p_desconto, p_observacao);
  SELECT LAST_INSERT_ID() AS venda_id;
END $$
DELIMITER ;

-- fim - stored procedures

-- início - tabelas módulo contas a pagar e receber

-- Categorias de contas (receitas e despesas)
CREATE TABLE `cant_categoria_financeira` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(100) NOT NULL,
  `tipo` ENUM('RECEITA','DESPESA') NOT NULL,
  `descricao` TEXT,
  `ativo` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contas a pagar
CREATE TABLE `cant_conta_pagar` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `categoria_id` BIGINT,
  `descricao` VARCHAR(255) NOT NULL,
  `fornecedor` VARCHAR(255),
  `numero_documento` VARCHAR(100),
  `valor_original` DECIMAL(12,2) NOT NULL,
  `valor_pago` DECIMAL(12,2) DEFAULT 0.00,
  `valor_desconto` DECIMAL(12,2) DEFAULT 0.00,
  `valor_juros` DECIMAL(12,2) DEFAULT 0.00,
  `data_emissao` DATE NOT NULL,
  `data_vencimento` DATE NOT NULL,
  `data_pagamento` DATE NULL,
  `status` ENUM('PENDENTE','PAGO','ATRASADO','CANCELADO') DEFAULT 'PENDENTE',
  `observacoes` TEXT,
  `usuario_cadastro_id` BIGINT NOT NULL,
  `usuario_pagamento_id` BIGINT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`categoria_id`) REFERENCES `cant_categoria_financeira`(`id`),
  FOREIGN KEY (`usuario_cadastro_id`) REFERENCES `cant_usuarios`(`id`),
  FOREIGN KEY (`usuario_pagamento_id`) REFERENCES `cant_usuarios`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contas a receber
CREATE TABLE `cant_conta_receber` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `categoria_id` BIGINT,
  `descricao` VARCHAR(255) NOT NULL,
  `cliente` VARCHAR(255),
  `numero_documento` VARCHAR(100),
  `valor_original` DECIMAL(12,2) NOT NULL,
  `valor_recebido` DECIMAL(12,2) DEFAULT 0.00,
  `valor_desconto` DECIMAL(12,2) DEFAULT 0.00,
  `valor_juros` DECIMAL(12,2) DEFAULT 0.00,
  `data_emissao` DATE NOT NULL,
  `data_vencimento` DATE NOT NULL,
  `data_recebimento` DATE NULL,
  `status` ENUM('PENDENTE','RECEBIDO','CANCELADA') DEFAULT 'PENDENTE',
  `observacoes` TEXT,
  `usuario_cadastro_id` BIGINT NOT NULL,
  `usuario_recebimento_id` BIGINT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`categoria_id`) REFERENCES `cant_categoria_financeira`(`id`),
  FOREIGN KEY (`usuario_cadastro_id`) REFERENCES `cant_usuarios`(`id`),
  FOREIGN KEY (`usuario_recebimento_id`) REFERENCES `cant_usuarios`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parcelas das contas a pagar
CREATE TABLE `cant_conta_pagar_parcela` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `conta_pagar_id` BIGINT NOT NULL,
  `numero_parcela` INT NOT NULL,
  `valor` DECIMAL(12,2) NOT NULL,
  `data_vencimento` DATE NOT NULL,
  `data_pagamento` DATE NULL,
  `valor_pago` DECIMAL(12,2) DEFAULT 0.00,
  `valor_desconto` DECIMAL(12,2) DEFAULT 0.00,
  `valor_juros` DECIMAL(12,2) DEFAULT 0.00,
  `status` ENUM('PENDENTE','PAGO','ATRASADO','CANCELADO') DEFAULT 'PENDENTE',
  `observacoes` TEXT,
  `usuario_pagamento_id` BIGINT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`conta_pagar_id`) REFERENCES `cant_conta_pagar`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`usuario_pagamento_id`) REFERENCES `cant_usuarios`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parcelas das contas a receber
CREATE TABLE `cant_conta_receber_parcela` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `conta_receber_id` BIGINT NOT NULL,
  `numero_parcela` INT NOT NULL,
  `valor` DECIMAL(12,2) NOT NULL,
  `data_vencimento` DATE NOT NULL,
  `data_recebimento` DATE NULL,
  `valor_recebido` DECIMAL(12,2) DEFAULT 0.00,
  `valor_desconto` DECIMAL(12,2) DEFAULT 0.00,
  `valor_juros` DECIMAL(12,2) DEFAULT 0.00,
  `status` ENUM('PENDENTE','RECEBIDO','ATRASADO','CANCELADO') DEFAULT 'PENDENTE',
  `observacoes` TEXT,
  `usuario_recebimento_id` BIGINT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`conta_receber_id`) REFERENCES `cant_conta_receber`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`usuario_recebimento_id`) REFERENCES `cant_usuarios`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Histórico de pagamentos das contas a pagar
CREATE TABLE `cant_conta_pagar_pagamento` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `conta_pagar_id` BIGINT,
  `parcela_id` BIGINT NULL,
  `valor_pago` DECIMAL(12,2) NOT NULL,
  `valor_desconto` DECIMAL(12,2) DEFAULT 0.00,
  `valor_juros` DECIMAL(12,2) DEFAULT 0.00,
  `data_pagamento` DATE NOT NULL,
  `forma_pagamento` ENUM('DINHEIRO','CHEQUE','TRANSFERENCIA','PIX','CARTAO_DEBITO','CARTAO_CREDITO','OUTRO') NOT NULL,
  `observacoes` TEXT,
  `usuario_id` BIGINT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`conta_pagar_id`) REFERENCES `cant_conta_pagar`(`id`),
  FOREIGN KEY (`parcela_id`) REFERENCES `cant_conta_pagar_parcela`(`id`),
  FOREIGN KEY (`usuario_id`) REFERENCES `cant_usuarios`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Histórico de recebimentos das contas a receber
CREATE TABLE `cant_conta_receber_recebimento` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `conta_receber_id` BIGINT,
  `parcela_id` BIGINT NULL,
  `valor_recebido` DECIMAL(12,2) NOT NULL,
  `valor_desconto` DECIMAL(12,2) DEFAULT 0.00,
  `valor_juros` DECIMAL(12,2) DEFAULT 0.00,
  `data_recebimento` DATE NOT NULL,
  `forma_recebimento` ENUM('DINHEIRO','CHEQUE','TRANSFERENCIA','PIX','CARTAO_DEBITO','CARTAO_CREDITO','OUTRO') NOT NULL,
  `observacoes` TEXT,
  `usuario_id` BIGINT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`conta_receber_id`) REFERENCES `cant_conta_receber`(`id`),
  FOREIGN KEY (`parcela_id`) REFERENCES `cant_conta_receber_parcela`(`id`),
  FOREIGN KEY (`usuario_id`) REFERENCES `cant_usuarios`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- início - views módulo contas a pagar e receber

-- View para resumo das contas a pagar
CREATE OR REPLACE VIEW `cant_view_conta_pagar_resumo` AS
SELECT 
  cp.id,
  cp.descricao,
  cp.fornecedor,
  cp.numero_documento,
  cp.valor_original,
  cp.valor_pago,
  cp.valor_desconto,
  cp.valor_juros,
  (cp.valor_original + cp.valor_juros - cp.valor_desconto - cp.valor_pago) AS valor_pendente,
  cp.data_emissao,
  cp.data_vencimento,
  cp.data_pagamento,
  cp.status,
  cf.nome AS categoria_nome,
  cf.tipo AS categoria_tipo,
  CASE 
    WHEN cp.status = 'PAGO' THEN 'Pago'
    WHEN cp.data_vencimento < CURDATE() AND cp.status = 'PENDENTE' THEN 'Atrasado'
    WHEN cp.data_vencimento = CURDATE() AND cp.status = 'PENDENTE' THEN 'Vence Hoje'
    WHEN cp.data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND cp.status = 'PENDENTE' THEN 'Vence Esta Semana'
    ELSE 'Em Dia'
  END AS situacao,
  DATEDIFF(CURDATE(), cp.data_vencimento) AS dias_atraso,
  uc.nome AS usuario_cadastro_nome,
  up.nome AS usuario_pagamento_nome
FROM cant_conta_pagar cp
LEFT JOIN cant_categoria_financeira cf ON cp.categoria_id = cf.id
LEFT JOIN cant_usuarios uc ON cp.usuario_cadastro_id = uc.id
LEFT JOIN cant_usuarios up ON cp.usuario_pagamento_id = up.id;

-- View para resumo das contas a receber
CREATE OR REPLACE VIEW `cant_view_conta_receber_resumo` AS
SELECT 
  cr.id,
  cr.descricao,
  cr.cliente,
  cr.numero_documento,
  cr.valor_original,
  cr.valor_recebido,
  cr.valor_desconto,
  cr.valor_juros,
  (cr.valor_original + cr.valor_juros - cr.valor_desconto - cr.valor_recebido) AS valor_pendente,
  cr.data_emissao,
  cr.data_vencimento,
  cr.data_recebimento,
  cr.status,
  cf.nome AS categoria_nome,
  cf.tipo AS categoria_tipo,
  CASE 
    WHEN cr.status = 'RECEBIDO' THEN 'Recebido'
    WHEN cr.data_vencimento < CURDATE() AND cr.status = 'PENDENTE' THEN 'Atrasado'
    WHEN cr.data_vencimento = CURDATE() AND cr.status = 'PENDENTE' THEN 'Vence Hoje'
    WHEN cr.data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND cr.status = 'PENDENTE' THEN 'Vence Esta Semana'
    ELSE 'Em Dia'
  END AS situacao,
  DATEDIFF(CURDATE(), cr.data_vencimento) AS dias_atraso,
  uc.nome AS usuario_cadastro_nome,
  ur.nome AS usuario_recebimento_nome
FROM cant_conta_receber cr
LEFT JOIN cant_categoria_financeira cf ON cr.categoria_id = cf.id
LEFT JOIN cant_usuarios uc ON cr.usuario_cadastro_id = uc.id
LEFT JOIN cant_usuarios ur ON cr.usuario_recebimento_id = ur.id;

-- View para parcelas das contas a pagar
CREATE OR REPLACE VIEW `cant_view_conta_pagar_parcela_resumo` AS
SELECT 
  cpp.id,
  cpp.conta_pagar_id,
  cp.descricao AS conta_descricao,
  cp.fornecedor,
  cpp.numero_parcela,
  cpp.valor,
  cpp.valor_pago,
  cpp.valor_desconto,
  cpp.valor_juros,
  (cpp.valor + cpp.valor_juros - cpp.valor_desconto - cpp.valor_pago) AS valor_pendente,
  cpp.data_vencimento,
  cpp.data_pagamento,
  cpp.status,
  CASE 
    WHEN cpp.status = 'PAGO' THEN 'Pago'
    WHEN cpp.data_vencimento < CURDATE() AND cpp.status = 'PENDENTE' THEN 'Atrasado'
    WHEN cpp.data_vencimento = CURDATE() AND cpp.status = 'PENDENTE' THEN 'Vence Hoje'
    WHEN cpp.data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND cpp.status = 'PENDENTE' THEN 'Vence Esta Semana'
    ELSE 'Em Dia'
  END AS situacao,
  DATEDIFF(CURDATE(), cpp.data_vencimento) AS dias_atraso,
  cf.nome AS categoria_nome
FROM cant_conta_pagar_parcela cpp
INNER JOIN cant_conta_pagar cp ON cpp.conta_pagar_id = cp.id
LEFT JOIN cant_categoria_financeira cf ON cp.categoria_id = cf.id;

-- View para parcelas das contas a receber
CREATE OR REPLACE VIEW `cant_view_conta_receber_parcela_resumo` AS
SELECT 
  crp.id,
  crp.conta_receber_id,
  cr.descricao AS conta_descricao,
  cr.cliente,
  crp.numero_parcela,
  crp.valor,
  crp.valor_recebido,
  crp.valor_desconto,
  crp.valor_juros,
  (crp.valor + crp.valor_juros - crp.valor_desconto - crp.valor_recebido) AS valor_pendente,
  crp.data_vencimento,
  crp.data_recebimento,
  crp.status,
  CASE 
    WHEN crp.status = 'RECEBIDO' THEN 'Recebido'
    WHEN crp.data_vencimento < CURDATE() AND crp.status = 'PENDENTE' THEN 'Atrasado'
    WHEN crp.data_vencimento = CURDATE() AND crp.status = 'PENDENTE' THEN 'Vence Esta Semana'
    WHEN crp.data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND crp.status = 'PENDENTE' THEN 'Vence Esta Semana'
    ELSE 'Em Dia'
  END AS situacao,
  DATEDIFF(CURDATE(), crp.data_vencimento) AS dias_atraso,
  cf.nome AS categoria_nome
FROM cant_conta_receber_parcela crp
INNER JOIN cant_conta_receber cr ON crp.conta_receber_id = cr.id
LEFT JOIN cant_categoria_financeira cf ON cr.categoria_id = cf.id;

-- View para dashboard financeiro
CREATE OR REPLACE VIEW `cant_view_dashboard_financeiro` AS
SELECT 
  (SELECT COUNT(*) FROM cant_conta_pagar WHERE status = 'PENDENTE') AS contas_pagar_pendentes,
  (SELECT COUNT(*) FROM cant_conta_receber WHERE status = 'PENDENTE') AS contas_receber_pendentes,
  (SELECT COUNT(*) FROM cant_conta_pagar WHERE status = 'ATRASADO' OR (status = 'PENDENTE' AND data_vencimento < CURDATE())) AS contas_pagar_atrasadas,
  (SELECT COUNT(*) FROM cant_conta_receber WHERE status = 'ATRASADO' OR (status = 'PENDENTE' AND data_vencimento < CURDATE())) AS contas_receber_atrasadas,
  (SELECT COALESCE(SUM(valor_original + valor_juros - valor_desconto - valor_pago), 0) FROM cant_conta_pagar WHERE status = 'PENDENTE') AS valor_total_pagar,
  (SELECT COALESCE(SUM(valor_original + valor_juros - valor_desconto - valor_recebido), 0) FROM cant_conta_receber WHERE status = 'PENDENTE') AS valor_total_receber,
  (SELECT COALESCE(SUM(valor_original + valor_juros - valor_desconto - valor_pago), 0) FROM cant_conta_pagar WHERE status = 'PENDENTE' AND data_vencimento < CURDATE()) AS valor_atrasado_pagar,
  (SELECT COALESCE(SUM(valor_original + valor_juros - valor_desconto - valor_recebido), 0) FROM cant_conta_receber WHERE status = 'PENDENTE' AND data_vencimento < CURDATE()) AS valor_atrasado_receber;

-- início - triggers módulo contas a pagar e receber

-- Trigger para atualizar status de conta a pagar quando totalmente paga
DELIMITER $$
CREATE TRIGGER `trig_conta_pagar_after_pagamento` 
AFTER INSERT ON `cant_conta_pagar_pagamento`
FOR EACH ROW
BEGIN
  DECLARE v_valor_total_pago DECIMAL(12,2);
  DECLARE v_valor_original DECIMAL(12,2);
  DECLARE v_valor_juros DECIMAL(12,2);
  DECLARE v_valor_desconto DECIMAL(12,2);
  
  -- Calcula valor total pago
  SELECT COALESCE(SUM(valor_pago), 0) INTO v_valor_total_pago
  FROM cant_conta_pagar_pagamento 
  WHERE conta_pagar_id = NEW.conta_pagar_id;
  
  -- Busca dados da conta
  SELECT valor_original, valor_juros, valor_desconto 
  INTO v_valor_original, v_valor_juros, v_valor_desconto
  FROM cant_conta_pagar 
  WHERE id = NEW.conta_pagar_id;
  
  -- Atualiza conta a pagar
  UPDATE cant_conta_pagar SET
    valor_pago = v_valor_total_pago,
    valor_juros = v_valor_juros + NEW.valor_juros,
    valor_desconto = v_valor_desconto + NEW.valor_desconto,
    status = CASE 
      WHEN v_valor_total_pago >= (v_valor_original + v_valor_juros + NEW.valor_juros - v_valor_desconto - NEW.valor_desconto) THEN 'PAGO'
      ELSE status 
    END,
    data_pagamento = CASE 
      WHEN v_valor_total_pago >= (v_valor_original + v_valor_juros + NEW.valor_juros - v_valor_desconto - NEW.valor_desconto) THEN NEW.data_pagamento
      ELSE data_pagamento
    END,
    usuario_pagamento_id = NEW.usuario_id
  WHERE id = NEW.conta_pagar_id;
  
  -- Atualiza parcela se especificada
  IF NEW.parcela_id IS NOT NULL THEN
    UPDATE cant_conta_pagar_parcela SET
      valor_pago = valor_pago + NEW.valor_pago,
      valor_juros = valor_juros + NEW.valor_juros,
      valor_desconto = valor_desconto + NEW.valor_desconto,
      status = CASE 
        WHEN (valor_pago + NEW.valor_pago) >= (valor + valor_juros + NEW.valor_juros - valor_desconto - NEW.valor_desconto) THEN 'PAGO'
        ELSE status 
      END,
      data_pagamento = CASE 
        WHEN (valor_pago + NEW.valor_pago) >= (valor + valor_juros + NEW.valor_juros - valor_desconto - NEW.valor_desconto) THEN NEW.data_pagamento
        ELSE data_pagamento
      END,
      usuario_pagamento_id = NEW.usuario_id
    WHERE id = NEW.parcela_id;
  END IF;
END $$
DELIMITER ;

-- Trigger para atualizar status de conta a receber quando totalmente recebida
DELIMITER $$
CREATE TRIGGER `trig_conta_receber_after_recebimento` 
AFTER INSERT ON `cant_conta_receber_recebimento`
FOR EACH ROW
BEGIN
  DECLARE v_valor_total_recebido DECIMAL(12,2);
  DECLARE v_valor_original DECIMAL(12,2);
  DECLARE v_valor_juros DECIMAL(12,2);
  DECLARE v_valor_desconto DECIMAL(12,2);
  
  -- Calcula valor total recebido
  SELECT COALESCE(SUM(valor_recebido), 0) INTO v_valor_total_recebido
  FROM cant_conta_receber_recebimento 
  WHERE conta_receber_id = NEW.conta_receber_id;
  
  -- Busca dados da conta
  SELECT valor_original, valor_juros, valor_desconto 
  INTO v_valor_original, v_valor_juros, v_valor_desconto
  FROM cant_conta_receber 
  WHERE id = NEW.conta_receber_id;
  
  -- Atualiza conta a receber
  UPDATE cant_conta_receber SET
    valor_recebido = v_valor_total_recebido,
    valor_juros = v_valor_juros + NEW.valor_juros,
    valor_desconto = v_valor_desconto + NEW.valor_desconto,
    status = CASE 
      WHEN v_valor_total_recebido >= (v_valor_original + v_valor_juros + NEW.valor_juros - v_valor_desconto - NEW.valor_desconto) THEN 'RECEBIDO'
      ELSE status 
    END,
    data_recebimento = CASE 
      WHEN v_valor_total_recebido >= (v_valor_original + v_valor_juros + NEW.valor_juros - v_valor_desconto - NEW.valor_desconto) THEN NEW.data_recebimento
      ELSE data_recebimento
    END,
    usuario_recebimento_id = NEW.usuario_id
  WHERE id = NEW.conta_receber_id;
  
  -- Atualiza parcela se especificada
  IF NEW.parcela_id IS NOT NULL THEN
    UPDATE cant_conta_receber_parcela SET
      valor_recebido = valor_recebido + NEW.valor_recebido,
      valor_juros = valor_juros + NEW.valor_juros,
      valor_desconto = valor_desconto + NEW.valor_desconto,
      status = CASE 
        WHEN (valor_recebido + NEW.valor_recebido) >= (valor + valor_juros + NEW.valor_juros - valor_desconto - NEW.valor_desconto) THEN 'RECEBIDO'
        ELSE status 
      END,
      data_recebimento = CASE 
        WHEN (valor_recebido + NEW.valor_recebido) >= (valor + valor_juros + NEW.valor_juros - valor_desconto - NEW.valor_desconto) THEN NEW.data_recebimento
        ELSE data_recebimento
      END,
      usuario_recebimento_id = NEW.usuario_id
    WHERE id = NEW.parcela_id;
  END IF;
END $$
DELIMITER ;

-- Trigger para marcar contas como atrasadas
DELIMITER $$
CREATE EVENT IF NOT EXISTS `evt_atualiza_status_contas_atrasadas`
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
  -- Atualiza contas a pagar atrasadas
  UPDATE cant_conta_pagar 
  SET status = 'ATRASADO' 
  WHERE status = 'PENDENTE' AND data_vencimento < CURDATE();
  
  -- Atualiza contas a receber atrasadas
  UPDATE cant_conta_receber 
  SET status = 'ATRASADO' 
  WHERE status = 'PENDENTE' AND data_vencimento < CURDATE();
  
  -- Atualiza parcelas a pagar atrasadas
  UPDATE cant_conta_pagar_parcela 
  SET status = 'ATRASADO' 
  WHERE status = 'PENDENTE' AND data_vencimento < CURDATE();
  
  -- Atualiza parcelas a receber atrasadas
  UPDATE cant_conta_receber_parcela 
  SET status = 'ATRASADO' 
  WHERE status = 'PENDENTE' AND data_vencimento < CURDATE();
END $$
DELIMITER ;

-- início - stored procedures módulo contas a pagar e receber

-- Procedure para gerar parcelas de conta a pagar
DROP PROCEDURE IF EXISTS `cant_sp_gerar_parcelas_conta_pagar`;
DELIMITER $$
CREATE PROCEDURE `cant_sp_gerar_parcelas_conta_pagar`(
  IN p_conta_pagar_id BIGINT,
  IN p_numero_parcelas INT,
  IN p_data_primeira_parcela DATE
)
BEGIN
  DECLARE v_contador INT DEFAULT 1;
  DECLARE v_valor_parcela DECIMAL(12,2);
  DECLARE v_data_vencimento DATE;
  DECLARE v_valor_original DECIMAL(12,2);
  
  -- Busca valor original da conta
  SELECT valor_original INTO v_valor_original 
  FROM cant_conta_pagar 
  WHERE id = p_conta_pagar_id;
  
  -- Calcula valor da parcela
  SET v_valor_parcela = v_valor_original / p_numero_parcelas;
  
  -- Gera as parcelas
  WHILE v_contador <= p_numero_parcelas DO
    SET v_data_vencimento = DATE_ADD(p_data_primeira_parcela, INTERVAL (v_contador - 1) MONTH);
    
    -- Ajusta valor da última parcela para compensar arredondamentos
    IF v_contador = p_numero_parcelas THEN
      SET v_valor_parcela = v_valor_original - ((p_numero_parcelas - 1) * (v_valor_original / p_numero_parcelas));
    END IF;
    
    INSERT INTO cant_conta_pagar_parcela (conta_pagar_id, numero_parcela, valor, data_vencimento)
    VALUES (p_conta_pagar_id, v_contador, v_valor_parcela, v_data_vencimento);
    
    SET v_contador = v_contador + 1;
  END WHILE;
END $$
DELIMITER ;

-- Procedure para gerar parcelas de conta a receber
DROP PROCEDURE IF EXISTS `cant_sp_gerar_parcelas_conta_receber`;
DELIMITER $$
CREATE PROCEDURE `cant_sp_gerar_parcelas_conta_receber`(
  IN p_conta_receber_id BIGINT,
  IN p_numero_parcelas INT,
  IN p_data_primeira_parcela DATE
)
BEGIN
  DECLARE v_contador INT DEFAULT 1;
  DECLARE v_valor_parcela DECIMAL(12,2);
  DECLARE v_data_vencimento DATE;
  DECLARE v_valor_original DECIMAL(12,2);
  
  -- Busca valor original da conta
  SELECT valor_original INTO v_valor_original 
  FROM cant_conta_receber 
  WHERE id = p_conta_receber_id;
  
  -- Calcula valor da parcela
  SET v_valor_parcela = v_valor_original / p_numero_parcelas;
  
  -- Gera as parcelas
  WHILE v_contador <= p_numero_parcelas DO
    SET v_data_vencimento = DATE_ADD(p_data_primeira_parcela, INTERVAL (v_contador - 1) MONTH);
    
    -- Ajusta valor da última parcela para compensar arredondamentos
    IF v_contador = p_numero_parcelas THEN
      SET v_valor_parcela = v_valor_original - ((p_numero_parcelas - 1) * (v_valor_original / p_numero_parcelas));
    END IF;
    
    INSERT INTO cant_conta_receber_parcela (conta_receber_id, numero_parcela, valor, data_vencimento)
    VALUES (p_conta_receber_id, v_contador, v_valor_parcela, v_data_vencimento);
    
    SET v_contador = v_contador + 1;
  END WHILE;
END $$
DELIMITER ;

-- Procedure para registrar pagamento de conta
DROP PROCEDURE IF EXISTS `cant_sp_registrar_pagamento_conta`;
DELIMITER $$
CREATE PROCEDURE `cant_sp_registrar_pagamento_conta`(
  IN p_conta_pagar_id BIGINT,
  IN p_parcela_id BIGINT,
  IN p_valor_pago DECIMAL(12,2),
  IN p_valor_desconto DECIMAL(12,2),
  IN p_valor_juros DECIMAL(12,2),
  IN p_data_pagamento DATE,
  IN p_forma_pagamento ENUM('DINHEIRO','CHEQUE','TRANSFERENCIA','PIX','CARTAO_DEBITO','CARTAO_CREDITO','OUTRO'),
  IN p_observacoes TEXT,
  IN p_usuario_id BIGINT
)
BEGIN
  INSERT INTO cant_conta_pagar_pagamento (
    conta_pagar_id, parcela_id, valor_pago, valor_desconto, valor_juros, 
    data_pagamento, forma_pagamento, observacoes, usuario_id
  ) VALUES (
    p_conta_pagar_id, p_parcela_id, p_valor_pago, IFNULL(p_valor_desconto, 0), 
    IFNULL(p_valor_juros, 0), p_data_pagamento, p_forma_pagamento, p_observacoes, p_usuario_id
  );
END $$
DELIMITER ;

-- Procedure para registrar recebimento de conta
DROP PROCEDURE IF EXISTS `cant_sp_registrar_recebimento_conta`;
DELIMITER $$
CREATE PROCEDURE `cant_sp_registrar_recebimento_conta`(
  IN p_conta_receber_id BIGINT,
  IN p_parcela_id BIGINT,
  IN p_valor_recebido DECIMAL(12,2),
  IN p_valor_desconto DECIMAL(12,2),
  IN p_valor_juros DECIMAL(12,2),
  IN p_data_recebimento DATE,
  IN p_forma_recebimento ENUM('DINHEIRO','CHEQUE','TRANSFERENCIA','PIX','CARTAO_DEBITO','CARTAO_CREDITO','OUTRO'),
  IN p_observacoes TEXT,
  IN p_usuario_id BIGINT
)
BEGIN
  INSERT INTO cant_conta_receber_recebimento (
    conta_receber_id, parcela_id, valor_recebido, valor_desconto, valor_juros, 
    data_recebimento, forma_recebimento, observacoes, usuario_id
  ) VALUES (
    p_conta_receber_id, p_parcela_id, p_valor_recebido, IFNULL(p_valor_desconto, 0), 
    IFNULL(p_valor_juros, 0), p_data_recebimento, p_forma_recebimento, p_observacoes, p_usuario_id
  );
END $$
DELIMITER ;

-- fim - tabelas, views, triggers e procedures módulo contas a pagar e receber

-- Inserir categorias padrão
INSERT IGNORE INTO cant_categoria_financeira (nome, tipo, descricao) VALUES
('Fornecedores', 'DESPESA', 'Pagamentos a fornecedores de produtos'),
('Utilities', 'DESPESA', 'Contas de luz, água, telefone, internet'),
('Manutenção', 'DESPESA', 'Gastos com manutenção de equipamentos'),
('Impostos', 'DESPESA', 'Pagamento de impostos e taxas'),
('Salários', 'DESPESA', 'Pagamento de funcionários'),
('Vendas Cantina', 'RECEITA', 'Receitas das vendas da cantina'),
('Pacotes Alimentação', 'RECEITA', 'Vendas de pacotes de alimentação'),
('Outros Recebimentos', 'RECEITA', 'Outras fontes de receita');

-- View unificada para restrições de alunos
DROP VIEW IF EXISTS `cant_view_aluno_restricao`;
CREATE VIEW `cant_view_aluno_restricao` AS
SELECT 
  aluno_ra,
  produto_id,
  'produto' as tipo_restricao,
  p.nome as item_nome
FROM cant_aluno_restricao_produto ar
JOIN cant_produtos p ON p.id = ar.produto_id
WHERE ar.ativo = 1
UNION ALL
SELECT 
  aluno_ra,
  NULL as produto_id,
  'categoria' as tipo_restricao,
  pt.descricao as item_nome
FROM cant_aluno_restricao_tipo art
JOIN cant_produto_tipo pt ON pt.id = art.tipo_produto_id
WHERE art.ativo = 1;

-- Dados de exemplo para teste do PDV
INSERT IGNORE INTO `cant_produto_tipo` (`id`, `descricao`, `codigo`, `exige_peso`) VALUES
(1, 'Salgados', 'salgados', 0),
(2, 'Doces', 'doces', 0),
(3, 'Bebidas', 'bebidas', 0),
(4, 'Refeições', 'refeicoes', 1);

INSERT IGNORE INTO `cant_produtos` (`id`, `tipo_id`, `nome`, `descricao`, `preco_unitario`, `codigo_barra`, `estoque_minimo`) VALUES
(1, 1, 'Coxinha', 'Coxinha de frango tradicional', 4.50, '7891234567890', 10.000),
(2, 1, 'Pastel de Queijo', 'Pastel frito recheado com queijo', 5.50, '7891234567891', 8.000),
(3, 1, 'Pão de Açúcar', 'Pão doce tradicional', 3.00, '7891234567892', 15.000),
(4, 2, 'Brigadeiro', 'Brigadeiro gourmet', 2.50, '7891234567893', 20.000),
(5, 2, 'Bolo de Chocolate', 'Fatia de bolo de chocolate', 6.00, '7891234567894', 5.000),
(6, 3, 'Coca-Cola 350ml', 'Refrigerante Coca-Cola lata', 5.00, '7891234567895', 24.000),
(7, 3, 'Água 500ml', 'Água mineral natural', 2.00, '7891234567896', 50.000),
(8, 3, 'Suco de Laranja', 'Suco natural de laranja', 4.00, '7891234567897', 12.000),
(9, 4, 'Almoço Executivo', 'Refeição completa por quilo', 32.00, '7891234567898', 1.000);

-- Estoque inicial para os produtos
INSERT IGNORE INTO `cant_estoque_mov` (`produto_id`, `tipo_mov`, `quantidade`, `referencia`, `observacao`) VALUES
(1, 'ENTRADA', 50.000, 'ESTOQUE_INICIAL', 'Estoque inicial do produto'),
(2, 'ENTRADA', 30.000, 'ESTOQUE_INICIAL', 'Estoque inicial do produto'),
(3, 'ENTRADA', 40.000, 'ESTOQUE_INICIAL', 'Estoque inicial do produto'),
(4, 'ENTRADA', 60.000, 'ESTOQUE_INICIAL', 'Estoque inicial do produto'),
(5, 'ENTRADA', 15.000, 'ESTOQUE_INICIAL', 'Estoque inicial do produto'),
(6, 'ENTRADA', 48.000, 'ESTOQUE_INICIAL', 'Estoque inicial do produto'),
(7, 'ENTRADA', 100.000, 'ESTOQUE_INICIAL', 'Estoque inicial do produto'),
(8, 'ENTRADA', 24.000, 'ESTOQUE_INICIAL', 'Estoque inicial do produto'),
(9, 'ENTRADA', 10.000, 'ESTOQUE_INICIAL', 'Estoque inicial do produto');

-- fim - script sistema cantina

-- ALTER TABLE incremental (caso já exista sem a coluna estoque_minimo)
-- A coluna `estoque_minimo` já está definida na criação da tabela `cant_produtos`.
-- Em algumas versões do MySQL a sintaxe "ADD COLUMN IF NOT EXISTS" não é suportada.
-- Para evitar erro de sintaxe, mantemos a instrução comentada abaixo; descomente se seu servidor suportar ou execute manualmente a alteração.
-- ALTER TABLE cant_produtos ADD COLUMN IF NOT EXISTS `estoque_minimo` DECIMAL(12,3) NULL DEFAULT 0.000 COMMENT 'Quantidade mínima para alerta de baixo estoque';

-- =====================================================================
-- INÍCIO - INTEGRAÇÕES / AJUSTES ADICIONAIS RF-029, RF-030, RF-031 (2025-08-31)
-- Objetivo: finalizar requisitos de estrutura, procedures e integração com
-- tabelas legadas sem alterá-las.
-- ===================================================================== */

/* =============================
   INTEGRAÇÃO COM TABELAS LEGADAS (RF-031)
   Criação de relacionamentos (FK) para garantir integridade referencial.
   Observação: executar apenas uma vez. Caso já existam, comentar as linhas.
============================= */
-- Relações com cadastro_alunos
ALTER TABLE `cant_aluno_saldo_mov`
  ADD CONSTRAINT `fk_cant_aluno_saldo_mov_aluno` FOREIGN KEY (`aluno_ra`) REFERENCES `cadastro_alunos`(`ra`);
ALTER TABLE `cant_pacote_aluno`
  ADD CONSTRAINT `fk_cant_pacote_aluno_aluno` FOREIGN KEY (`aluno_ra`) REFERENCES `cadastro_alunos`(`ra`);
ALTER TABLE `cant_aluno_restricao_produto`
  ADD CONSTRAINT `fk_cant_aluno_restricao_produto_aluno` FOREIGN KEY (`aluno_ra`) REFERENCES `cadastro_alunos`(`ra`);
ALTER TABLE `cant_aluno_restricao_tipo`
  ADD CONSTRAINT `fk_cant_aluno_restricao_tipo_aluno` FOREIGN KEY (`aluno_ra`) REFERENCES `cadastro_alunos`(`ra`);
ALTER TABLE `cant_aluno_observacao`
  ADD CONSTRAINT `fk_cant_aluno_observacao_aluno` FOREIGN KEY (`aluno_ra`) REFERENCES `cadastro_alunos`(`ra`);

-- Relações com funcionarios
ALTER TABLE `cant_funcionario_conta_lanc`
  ADD CONSTRAINT `fk_cant_func_conta_func` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionarios`(`codigo`);
ALTER TABLE `cant_funcionario_fatura`
  ADD CONSTRAINT `fk_cant_func_fatura_func` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionarios`(`codigo`);

/* =============================
   FUNÇÕES AUXILIARES (RF-030)
============================= */
DROP FUNCTION IF EXISTS `cant_fn_estoque_saldo`;
DELIMITER $$
CREATE FUNCTION `cant_fn_estoque_saldo`(p_produto_id BIGINT)
RETURNS DECIMAL(12,3)
DETERMINISTIC
BEGIN
  DECLARE v_saldo DECIMAL(12,3);
  SELECT COALESCE(SUM(CASE WHEN tipo_mov IN ('ENTRADA','AJUSTE_POSITIVO') THEN quantidade
                           WHEN tipo_mov IN ('SAIDA','AJUSTE_NEGATIVO','SAIDA_VENDA') THEN -quantidade
                           ELSE 0 END),0)
    INTO v_saldo
  FROM cant_estoque_mov WHERE produto_id = p_produto_id;
  RETURN IFNULL(v_saldo,0);
END $$
DELIMITER ;

DROP FUNCTION IF EXISTS `cant_fn_pacote_validavel`;
DELIMITER $$
/* Retorna 1 se o pacote pode ser utilizado (aluno, ativo, data válida, usos restantes >0) */
CREATE FUNCTION `cant_fn_pacote_validavel`(p_pacote_id BIGINT)
RETURNS TINYINT
DETERMINISTIC
BEGIN
  RETURN IF(EXISTS(
    SELECT 1 FROM cant_pacote_aluno pa
     WHERE pa.id = p_pacote_id
       AND pa.status='ATIVO'
       AND pa.usos_restantes > 0
       AND pa.data_inicio <= CURDATE()
       AND pa.data_fim >= CURDATE()
  ),1,0);
END $$
DELIMITER ;

/* =============================
   PROCEDURE COMPLETA DE VENDA (RF-030)
   Substitui lógica dispersa no backend consolidando regras no banco:
   - Validação de estoque
   - Restrições de aluno (produto / tipo)
   - Saldo de aluno
   - Uso de pacote
   - Inserção cabeçalho + itens + movimentos
   Formato de p_itens: lista separada por ponto-e-vírgula.
   Cada item no formato: produto_id,quantidade,preco_unitario
   Ex: '1,2,4.50;3,1,6.00;'
============================= */
DROP PROCEDURE IF EXISTS `cant_sp_realiza_venda`;
DELIMITER $$
CREATE PROCEDURE `cant_sp_realiza_venda`(
  IN p_usuario_id BIGINT,
  IN p_caixa_id BIGINT,
  IN p_tipo_comprador ENUM('ALUNO','FUNCIONARIO_ESCOLA','AVULSA'),
  IN p_aluno_ra INT,
  IN p_funcionario_id INT,
  IN p_forma_pag ENUM('DINHEIRO','CARTAO','SALDO_ALUNO','CONTA_FUNCIONARIO','PACOTE','OUTRO'),
  IN p_pacote_aluno_id BIGINT,
  IN p_desconto DECIMAL(12,2),
  IN p_observacao VARCHAR(255),
  IN p_itens TEXT
)
BEGIN
  DECLARE v_line TEXT;
  DECLARE v_pos INT;
  DECLARE v_prod BIGINT; DECLARE v_qtd DECIMAL(12,3); DECLARE v_preco DECIMAL(12,2);
  DECLARE v_valor_bruto DECIMAL(12,2) DEFAULT 0.00;
  DECLARE v_saldo_aluno DECIMAL(12,2);
  DECLARE v_usos_rest INT; DECLARE v_usos_dia INT; DECLARE v_max_usos_dia INT; DECLARE v_dummy INT;
  DECLARE v_venda_id BIGINT;
  DECLARE v_tipo_id BIGINT;
  DECLARE v_count INT;
  DECLARE v_index INT;
  DECLARE v_msg VARCHAR(255);

  -- Pré-validações básicas
  IF p_tipo_comprador NOT IN ('ALUNO','FUNCIONARIO_ESCOLA','AVULSA') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Tipo de comprador inválido';
  END IF;
  IF p_tipo_comprador='ALUNO' AND p_aluno_ra IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Aluno não informado';
  END IF;
  IF p_tipo_comprador='FUNCIONARIO_ESCOLA' AND p_funcionario_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Funcionário não informado';
  END IF;

  CREATE TEMPORARY TABLE IF NOT EXISTS tmp_venda_itens (
    produto_id BIGINT,
    quantidade DECIMAL(12,3),
    preco_unit DECIMAL(12,2)
  ) ENGINE=Memory;
  TRUNCATE tmp_venda_itens;

  -- Parse de itens
  parse_loop: WHILE p_itens IS NOT NULL AND LENGTH(p_itens) > 0 DO
    SET v_pos = INSTR(p_itens,';');
    IF v_pos = 0 THEN
      SET v_line = p_itens; SET p_itens='';
    ELSE
      SET v_line = SUBSTRING(p_itens,1,v_pos-1);
      SET p_itens = SUBSTRING(p_itens,v_pos+1);
    END IF;
    IF v_line IS NULL OR TRIM(v_line) = '' THEN
      ITERATE parse_loop;
    END IF;
    SET v_prod = CAST(SUBSTRING_INDEX(v_line,',',1) AS UNSIGNED);
    SET v_qtd = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(v_line,',',2),',',-1) AS DECIMAL(12,3));
    SET v_preco = CAST(SUBSTRING_INDEX(v_line,',',-1) AS DECIMAL(12,2));
    IF v_prod IS NULL OR v_qtd IS NULL OR v_preco IS NULL OR v_qtd <= 0 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Item inválido na lista';
    END IF;
    INSERT INTO tmp_venda_itens VALUES (v_prod, v_qtd, v_preco);
  END WHILE;

  -- Verificar se houve itens
  SELECT COUNT(*) INTO v_dummy FROM tmp_venda_itens;
  IF v_dummy = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Carrinho vazio';
  END IF;

  -- Validações por item (loop indexado sobre tabela temporária)
  SELECT COUNT(*) INTO v_count FROM tmp_venda_itens;
  SET v_index = 0;
  WHILE v_index < v_count DO
    SELECT produto_id, quantidade, preco_unit INTO v_prod, v_qtd, v_preco FROM tmp_venda_itens LIMIT v_index,1;
    -- Tipo do produto
    SELECT tipo_id INTO v_tipo_id FROM cant_produtos WHERE id = v_prod LIMIT 1;
    IF v_tipo_id IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Produto inexistente';
    END IF;
    -- Restrição de aluno
    IF p_tipo_comprador='ALUNO' THEN
      IF cant_fn_aluno_restrito_produto(p_aluno_ra, v_prod)=1 THEN
        SET v_msg = CONCAT('Produto restrito para aluno (prod ',v_prod,')');
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_msg;
      END IF;
      IF cant_fn_aluno_restrito_tipo(p_aluno_ra, v_tipo_id)=1 THEN
        SET v_msg = CONCAT('Tipo de produto restrito para aluno (prod ',v_prod,')');
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_msg;
      END IF;
    END IF;
    -- Estoque
    IF cant_fn_estoque_saldo(v_prod) < v_qtd THEN
      SET v_msg = CONCAT('Estoque insuficiente para produto ',v_prod);
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_msg;
    END IF;
    -- Acumula valor
    SET v_valor_bruto = v_valor_bruto + (v_qtd * v_preco);
    SET v_index = v_index + 1;
  END WHILE;

  -- Validação saldo aluno
  IF p_forma_pag='SALDO_ALUNO' AND p_tipo_comprador='ALUNO' THEN
    SET v_saldo_aluno = cant_fn_saldo_aluno(p_aluno_ra);
    IF v_saldo_aluno < (v_valor_bruto - p_desconto) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Saldo insuficiente';
    END IF;
  END IF;

  -- Validação pacote
  IF p_forma_pag='PACOTE' THEN
    IF p_pacote_aluno_id IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Pacote não informado';
    END IF;
    IF cant_fn_pacote_validavel(p_pacote_aluno_id)=0 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Pacote inválido ou indisponível';
    END IF;
    -- Limite diário
    SELECT usos_restantes INTO v_usos_rest FROM cant_pacote_aluno WHERE id=p_pacote_aluno_id;
    SELECT COUNT(*) INTO v_usos_dia FROM cant_pacote_utilizacao WHERE pacote_aluno_id=p_pacote_aluno_id AND DATE(data_utilizacao)=CURDATE();
    SELECT pt.max_usos_dia INTO v_max_usos_dia FROM cant_pacote_aluno pa JOIN cant_pacote_tipo pt ON pt.id=pa.pacote_tipo_id WHERE pa.id=p_pacote_aluno_id;
    IF v_usos_rest <= 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Pacote sem usos restantes'; END IF;
    IF v_max_usos_dia IS NOT NULL AND v_usos_dia >= v_max_usos_dia THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Limite diário do pacote atingido'; END IF;
  END IF;

  START TRANSACTION;
  -- Cabeçalho da venda
  INSERT INTO cant_venda (caixa_id, usuario_id, tipo_comprador, comprador_aluno_ra, comprador_funcionario_id, forma_pagamento, valor_bruto, desconto, valor_liquido, observacao)
  VALUES (p_caixa_id, p_usuario_id, p_tipo_comprador,
          IF(p_tipo_comprador='ALUNO', p_aluno_ra, NULL),
          IF(p_tipo_comprador='FUNCIONARIO_ESCOLA', p_funcionario_id, NULL),
          p_forma_pag, v_valor_bruto, IFNULL(p_desconto,0), v_valor_bruto - IFNULL(p_desconto,0), p_observacao);
  SET v_venda_id = LAST_INSERT_ID();

  -- Itens + saída de estoque (loop indexado)
  SELECT COUNT(*) INTO v_count FROM tmp_venda_itens;
  SET v_index = 0;
  WHILE v_index < v_count DO
    SELECT produto_id, quantidade, preco_unit INTO v_prod, v_qtd, v_preco FROM tmp_venda_itens LIMIT v_index,1;
    INSERT INTO cant_venda_item (venda_id, produto_id, quantidade, preco_unitario, valor_total)
    VALUES (v_venda_id, v_prod, v_qtd, v_preco, v_qtd * v_preco);
    -- Saída de estoque: gerada pelo trigger `trg_cant_venda_item_ai` para evitar duplicidade
    -- (removido INSERT direto de dentro da procedure)
    SET v_index = v_index + 1;
  END WHILE;

  -- Pagamento caixa
  IF p_forma_pag IN ('DINHEIRO','CARTAO') THEN
    INSERT INTO cant_caixa_mov (caixa_id, tipo, valor, descricao, referencia, usuario_id)
    VALUES (p_caixa_id, 'VENDA', v_valor_bruto - IFNULL(p_desconto,0), CONCAT('Venda ', p_forma_pag), CONCAT('VENDA#',v_venda_id), p_usuario_id);
  END IF;

  -- Uso de pacote
  IF p_forma_pag='PACOTE' THEN
    INSERT INTO cant_pacote_utilizacao (pacote_aluno_id, venda_id) VALUES (p_pacote_aluno_id, v_venda_id);
  END IF;

  COMMIT;
  SELECT v_venda_id AS venda_id, v_valor_bruto AS valor_bruto, (v_valor_bruto - IFNULL(p_desconto,0)) AS valor_liquido;
END $$
DELIMITER ;

-- =====================================================================
-- FIM - INTEGRAÇÕES / AJUSTES ADICIONAIS RF-029, RF-030, RF-031
-- =====================================================================