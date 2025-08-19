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
select `a`.`ra` AS `ra`,`a`.`nome` AS `nome`,`a`.`nome_social` AS `nome_social`,`a`.`nacionalidade` AS `nacionalidade`,`a`.`natural_de` AS `natural_de`,`a`.`reside` AS `reside`,`a`.`nasc` AS `nasc`,`a`.`sexo` AS `sexo`,`a`.`estcivil` AS `estcivil`,`a`.`dt_cadastro` AS `dt_cadastro`,`a`.`email` AS `email`,`a`.`email2` AS `email2`,`a`.`familia` AS `familia`,`a`.`cod_religião` AS `cod_religião`,`a`.`cert_nasc` AS `cert_nasc`,`a`.`rg` AS `rg`,`a`.`rg_emissao` AS `rg_emissao`,`a`.`cpf` AS `cpf`,`a`.`t_eleitoral` AS `t_eleitoral`,`a`.`zon_sec` AS `zon_sec`,`a`.`reservista` AS `reservista`,`a`.`categoria` AS `categoria`,`a`.`reserv_emissao` AS `reserv_emissao`,`a`.`reserv_orgemissor` AS `reserv_orgemissor`,`a`.`tipo` AS `tipo`,`a`.`residecom` AS `residecom`,`a`.`endereco` AS `endereco`,`a`.`bairro` AS `bairro`,`a`.`tel_cel` AS `tel_cel`,`a`.`tel_res` AS `tel_res`,`a`.`cidade` AS `cidade`,`a`.`estado` AS `estado`,`a`.`cep` AS `cep`,`a`.`fax` AS `fax`,`a`.`foto` AS `foto`,`a`.`gr_sanguineo` AS `gr_sanguineo`,`a`.`rh` AS `rh`,`a`.`sarampo` AS `sarampo`,`a`.`catapora` AS `catapora`,`a`.`coqueluche` AS `coqueluche`,`a`.`caxumba` AS `caxumba`,`a`.`rubeola` AS `rubeola`,`a`.`dengue` AS `dengue`,`a`.`h1n1` AS `h1n1`,`a`.`covid19` AS `covid19`,`a`.`outras_doencas` AS `outras_doencas`,`a`.`esp_outras_doencas` AS `esp_outras_doencas`,`a`.`cardiovascular` AS `cardiovascular`,`a`.`neurologico` AS `neurologico`,`a`.`diabete` AS `diabete`,`a`.`audicao` AS `audicao`,`a`.`respiratorio` AS `respiratorio`,`a`.`musculo_esqueletico` AS `musculo_esqueletico`,`a`.`visao` AS `visao`,`a`.`outros_disturbios` AS `outros_disturbios`,`a`.`esp_outros_disturbios` AS `esp_outros_disturbios`,`a`.`medicacao` AS `medicacao`,`a`.`descricao_medicacao` AS `descricao_medicacao`,`a`.`tratamento` AS `tratamento`,`a`.`descricao_tratamento` AS `descricao_tratamento`,`a`.`anti_termico` AS `anti_termico`,`a`.`dosagem_anti_termico` AS `dosagem_anti_termico`,`a`.`analgesico` AS `analgesico`,`a`.`dosagem_analgesico` AS `dosagem_analgesico`,`a`.`cicatrizante` AS `cicatrizante`,`a`.`dosagem_cicatrizante` AS `dosagem_cicatrizante`,`a`.`outra_medicacao` AS `outra_medicacao`,`a`.`dosagem_outra_medicacao` AS `dosagem_outra_medicacao`,`a`.`cirurgia` AS `cirurgia`,`a`.`descricao_cirurgia` AS `descricao_cirurgia`,`a`.`medico` AS `medico`,`a`.`tel_medico` AS `tel_medico`,`a`.`dentista` AS `dentista`,`a`.`tel_dentista` AS `tel_dentista`,`a`.`convenio` AS `convenio`,`a`.`hospital` AS `hospital`,`a`.`obs_medicas` AS `obs_medicas`,`a`.`alergia` AS `alergia`,`a`.`descricao_alergia` AS `descricao_alergia`,`a`.`obs` AS `obs`,`a`.`nome_resp` AS `nome_resp`,`a`.`rg_resp` AS `rg_resp`,`a`.`cpf_resp` AS `cpf_resp`,`a`.`nasc_resp` AS `nasc_resp`,`a`.`endereco_resp` AS `endereco_resp`,`a`.`bairro_resp` AS `bairro_resp`,`a`.`tel_cel_resp` AS `tel_cel_resp`,`a`.`tel_res_resp` AS `tel_res_resp`,`a`.`cidade_resp` AS `cidade_resp`,`a`.`estado_resp` AS `estado_resp`,`a`.`cep_resp` AS `cep_resp`,`a`.`fax_resp` AS `fax_resp`,`a`.`email_resp` AS `email_resp`,`a`.`email_resp2` AS `email_resp2`,`a`.`empresa_resp` AS `empresa_resp`,`a`.`cod_prof_resp` AS `cod_prof_resp`,`a`.`tel_emp_resp` AS `tel_emp_resp`,`a`.`nome_resp_fin` AS `nome_resp_fin`,`a`.`tipo_resp_fin` AS `tipo_resp_fin`,`a`.`rg_resp_fin` AS `rg_resp_fin`,`a`.`cpf_resp_fin` AS `cpf_resp_fin`,`a`.`cnpj_resp_fin` AS `cnpj_resp_fin`,`a`.`nasc_resp_fin` AS `nasc_resp_fin`,`a`.`endereco_resp_fin` AS `endereco_resp_fin`,`a`.`bairro_resp_fin` AS `bairro_resp_fin`,`a`.`tel_cel_resp_fin` AS `tel_cel_resp_fin`,`a`.`tel_res_resp_fin` AS `tel_res_resp_fin`,`a`.`cidade_resp_fin` AS `cidade_resp_fin`,`a`.`estado_resp_fin` AS `estado_resp_fin`,`a`.`cep_resp_fin` AS `cep_resp_fin`,`a`.`fax_resp_fin` AS `fax_resp_fin`,`a`.`email_resp_fin` AS `email_resp_fin`,`a`.`email_resp_fin2` AS `email_resp_fin2`,`a`.`empresa_resp_fin` AS `empresa_resp_fin`,`a`.`cod_prof_resp_fin` AS `cod_prof_resp_fin`,`a`.`tel_emp_resp_fin` AS `tel_emp_resp_fin`,`a`.`cod_respfinanc` AS `cod_respfinanc`,`a`.`cod_resp` AS `cod_resp`,`a`.`endrespfin` AS `endrespfin`,`a`.`telrespfin` AS `telrespfin`,`a`.`endresp` AS `endresp`,`a`.`teltresp` AS `teltresp`,`m`.`nro_chamada` AS `nro_chamada`,`c`.`nome` AS `curso_nome`,`m`.`curso` AS `curso`,`m`.`serie` AS `serie`,`m`.`turma` AS `turma`,`m`.`data_matricula` AS `dt_matricula`,`m`.`status` AS `status`,`a`.`situacao_bib` AS `situacao_bib`,`a`.`obs_bib` AS `obs_bib`,`a`.`ult_emprestimo` AS `ult_emprestimo`,`a`.`data_ult_emprestimo` AS `data_ult_emprestimo`,`a`.`rematriculado` AS `rematriculado`,`a`.`obs_fin` AS `obs_fin`,`a`.`pesquisa` AS `pesquisa`,`a`.`tesouraria` AS `tesouraria`,`m`.`periodo` AS `periodo`,`m`.`ano_letivo` AS `ano_letivo`,`a`.`coordenacao` AS `coordenacao`,`a`.`obs_coo` AS `obs_coo`,`a`.`escola_destino` AS `escola_destino`,`a`.`motivo` AS `motivo`,`a`.`codigo_tipo_motivo` AS `codigo_tipo_motivo`,`m`.`data_saida` AS `dia_transferencia`,`a`.`senha` AS `senha`,`a`.`grade` AS `grade`,`a`.`plano_pagamento` AS `plano_pagamento`,`a`.`faz_tratamento_homeopatia` AS `faz_tratamento_homeopatia`,`a`.`faz_tratamento_alopatia` AS `faz_tratamento_alopatia`,`a`.`teve_problema_ao_nascer` AS `teve_problema_ao_nascer`,`a`.`teve_problema_ao_nascer_qual` AS `teve_problema_ao_nascer_qual`,`a`.`convulsao_com_febre` AS `convulsao_com_febre`,`a`.`convulsao_sem_febre` AS `convulsao_sem_febre`,`a`.`neurologista` AS `neurologista`,`a`.`neurologista_quando` AS `neurologista_quando`,`a`.`neurologista_porque` AS `neurologista_porque`,`a`.`tratamento_foniatrico` AS `tratamento_foniatrico`,`a`.`tratamento_foniatrico_porque` AS `tratamento_foniatrico_porque`,`a`.`tratamento_fisioterapico` AS `tratamento_fisioterapico`,`a`.`tratamento_fisioterapico_porque` AS `tratamento_fisioterapico_porque`,`a`.`escola_anterior` AS `escola_anterior`,`a`.`escola_frequetou_cidade1` AS `escola_frequetou_cidade1`,`a`.`escola_frequetou_serie1` AS `escola_frequetou_serie1`,`a`.`escola_frequetou_ano1` AS `escola_frequetou_ano1`,`a`.`escola_frequetou_nome2` AS `escola_frequetou_nome2`,`a`.`escola_frequetou_cidade2` AS `escola_frequetou_cidade2`,`a`.`escola_frequetou_serie2` AS `escola_frequetou_serie2`,`a`.`escola_frequetou_ano2` AS `escola_frequetou_ano2`,`a`.`escola_frequetou_nome3` AS `escola_frequetou_nome3`,`a`.`escola_frequetou_cidade3` AS `escola_frequetou_cidade3`,`a`.`escola_frequetou_serie3` AS `escola_frequetou_serie3`,`a`.`escola_frequetou_ano3` AS `escola_frequetou_ano3`,`a`.`escola_frequetou_nome4` AS `escola_frequetou_nome4`,`a`.`escola_frequetou_cidade4` AS `escola_frequetou_cidade4`,`a`.`escola_frequetou_serie4` AS `escola_frequetou_serie4`,`a`.`escola_frequetou_ano4` AS `escola_frequetou_ano4`,`a`.`motivo_escolha_escola` AS `motivo_escolha_escola`,`a`.`foi_retido` AS `foi_retido`,`a`.`foi_retido_motivo` AS `foi_retido_motivo`,`a`.`existe_local_para_estudo` AS `existe_local_para_estudo`,`a`.`existe_horario_para_estudo` AS `existe_horario_para_estudo`,`a`.`ha_acompanhamento_estudos` AS `ha_acompanhamento_estudos`,`a`.`ha_acompanhamento_estudos_quem` AS `ha_acompanhamento_estudos_quem`,`a`.`participa_atividade_esportiva` AS `participa_atividade_esportiva`,`a`.`participa_atividade_esportiva_onde` AS `participa_atividade_esportiva_onde`,`a`.`participa_atividade_religiosa` AS `participa_atividade_religiosa`,`a`.`participa_atividade_religiosa_onde` AS `participa_atividade_religiosa_onde`,`a`.`participa_atividade_recreativa` AS `participa_atividade_recreativa`,`a`.`participa_atividade_recreativa_onde` AS `participa_atividade_recreativa_onde`,`a`.`participa_aula_informatica` AS `participa_aula_informatica`,`a`.`participa_aula_informatica_onde` AS `participa_aula_informatica_onde`,`a`.`participa_aula_linguas` AS `participa_aula_linguas`,`a`.`participa_aula_linguas_onde` AS `participa_aula_linguas_onde`,`a`.`participa_outras_atividades` AS `participa_outras_atividades`,`a`.`participa_outras_atividades_quais` AS `participa_outras_atividades_quais`,`a`.`meio_transporte_chegada_escola` AS `meio_transporte_chegada_escola`,`a`.`meio_transporte_saida_escola` AS `meio_transporte_saida_escola`,`a`.`pessoa_autorizada_retirar_aluno1` AS `pessoa_autorizada_retirar_aluno1`,`a`.`pessoa_autorizada_retirar_aluno2` AS `pessoa_autorizada_retirar_aluno2`,`a`.`pessoa_autorizada_retirar_aluno3` AS `pessoa_autorizada_retirar_aluno3`,`a`.`pessoa_autorizada_retirar_aluno4` AS `pessoa_autorizada_retirar_aluno4`,`a`.`autorizado_deixar_colegio_sozinho` AS `autorizado_deixar_colegio_sozinho`,`a`.`quem_fica_aluno_ausencia_pais` AS `quem_fica_aluno_ausencia_pais`,`a`.`relacionamento_mae` AS `relacionamento_mae`,`a`.`relacionamento_pai` AS `relacionamento_pai`,`a`.`reserva` AS `reserva`,`a`.`concomitante` AS `concomitante`,`a`.`cor_raca` AS `cor_raca`,`a`.`programa_bilingue` AS `programa_bilingue`,`a`.`curriculum_americano` AS `curriculum_americano`,`a`.`nao_divulgar_imagem` AS `nao_divulgar_imagem`,`a`.`prodesp` AS `prodesp`,`a`.`latitude` AS `latitude`,`a`.`longitude` AS `longitude`,`a`.`santanna_mais` AS `santanna_mais`,`a`.`importado` AS `importado`,`a`.`assist_medica_emergencia` AS `assist_medica_emergencia`,`a`.`obs_portaria` AS `obs_portaria`,`a`.`necessidade_educ_especial` AS `necessidade_educ_especial`,`a`.`possui_laudo` AS `possui_laudo` from ((`cadastro_alunos` `a` join `matriculas_alunos` `m` on((`a`.`ra` = `m`.`ra`))) join `cursos` `c` on((`m`.`curso` = `c`.`codigo`))) where ((`m`.`ano_matricula` = '2025') and ((`m`.`ano_letivo` = '2025_2026') or (`m`.`ano_letivo` = '2025')) and (`m`.`status` = 'MAT') and (`c`.`ativo` = 1) and (`c`.`complementar` = 0));

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
  INSERT INTO cant_estoque_mov (produto_id, tipo_mov, quantidade, referencia, observacao)
  VALUES (NEW.produto_id, 'SAIDA_VENDA', NEW.quantidade, CONCAT('VENDA#', NEW.venda_id), 'Saída automática por venda');
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

-- fim - script sistema cantina