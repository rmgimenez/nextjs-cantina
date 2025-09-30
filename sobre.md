# Sistema de controle de cantina escolar

O objetivo desse sistema é gerenciar de forma eficiente as operações de uma cantina escolar, permitindo o controle de usuários, funcionários, responsáveis e alunos, além de facilitar a gestão de vendas e estoque.

O sistema funcionará em um banco de dados MySQL e será desenvolvido utilizando Next.js com TypeScript.

O banco de dados já possui algumas tabelas criadas, que poderão ser utilizadas, mas não alteradas.

O sistema ERP da escola chama APS. Algumas tabelas do banco de dados do APS poderão ser utilizadas, mas não alteradas.

Nesse sistema tem o cadastro dos alunos, funcionários e responsáveis. Essas tabelas não poderão ser alteradas.

## Cores

Cores principais para serem utilizadas no sistema:

- Azul: #253287
- Vermelho: #B20000
- Amarelo: #FEA800
- Escuro: #333333
- Claro: #FFFFFF

## Tecnologias utilizadas

O sistema utiliza as seguintes tecnologias:

- **Next.js**: Framework React para construção do frontend com renderização híbrida (SSR/SSG).
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
- **react-icons**: Para uso de ícones.
- **MySQL**: Banco de dados relacional utilizado no backend.
- **PNPM**: Gerenciador de pacotes utilizado para instalação das dependências.
- **Bootstrap**: Framework CSS para estilização da aplicação.
- **react-icons**: Biblioteca de ícones para React.
- **chart.js**: Biblioteca para criação de gráficos.
- **jspdf** e **jspdf-autotable**: Bibliotecas para geração de relatórios em PDF.

## Funcionalidades

### Atores

#### Funcionários da cantina

São os usuários responsáveis pelo atendimento e gestão da cantina.

Eles usarão um nome de usuário e senha para acessar o sistema.

#### Alunos

São os principais clientes da cantina.

Eles terão uma conta com saldo que pode ser usado para compras na cantina.

#### Funcionários da escola

São consumidores que podem marcar na conta da cantina suas compras e depois a cantina envia um relatório para o departamento pessoal para descontar o valor consumido no mês.

### Funcionalidades do sistema

- Cadastro de funcionários da cantina. Eles serão os usuários do sistema.
- Login de funcionários da cantina
- Conta de alunos com saldo que pode ser usado para compras.
- Cadastro de tipos de produtos
- Cadastro de produtos
- Controle de estoque
- Registro de vendas
- PDV
- Controle de caixas (abrir e fechar caixa)
- Controle do que foi gasto pelos funcionários da escola
- Possibilidade de geração de relatórios de consumo dos funcionários
- Geração de fatura para os funcionários da escola
- Registro de pagamentos dos funcionários da escola
- Relatório do que os funcionários da escola consumiram no mês
- Baixa automática do saldo dos alunos conforme o consumo
- Controle de contas a pagar e receber
- Registro do que os alunos consumiram
- Restrição de consumo para os alunos por tipo de produto ou produto específico
- Observação do aluno que deverá ser mostrado no momento da compra
- Os funcionários da escola poderão realizar compras e marcar na conta da cantina, que será fechada mensalmente.
- Os responsáveis poderão comprar pacotes de alimentação para seus filhos. Por exemplo, comprar lanche da manhã e almoço por 1 mês.
- Controle dos pacotes de alimentação dos alunos.
- Os funcionários da cantina poderão verificar se o aluno possui pacote de refeição comprada.
- Os funcionários da cantina poderão verificar o histórico de vendas e consumo dos alunos.
- As fotos dos alunos deverão ser obtidas através da URL <https://sistema.santanna.g12.br/carometr/$ra.jpg>. O RA do aluno será utilizado para substituir o `$ra` na URL.
- As fotos dos funcionários deverão ser obtidas através da URL <https://sistema.santanna.g12.br/carometr/$codigo.jpg>. O código do funcionário será utilizado para substituir o `$codigo` na URL.
- Os produtos deverão possuir um tipo para classificação (ex: salgados, doces, etc).
- Deverá existir um tipo de refeição que é por quilo.
- Possibilidade de informar qual será o valor cobrado pelo almoço para cada funcionário da escola. Esse valor varia de acordo com o cargo do funcionário.

## Banco de dados

O banco de dados utilizado será MySQL.

Ele já possui algumas tabelas criadas. O sistema poderá usar essas tabelas existentes, mas não alterá-las.

Todas as tabelas do banco de dados deverão ser criadas com o prefixo `cant_`.

Os scripts estarão no arquivo `bancodados.sql`.

Sempre que criar uma tabela nova, crie o script de drop em `bancodados-drop.sql`.

## Banco de dados existente

Cada aluno possui um RA (Registro Acadêmico) que é o identificador único do aluno.

Cada funcionário possui um código que é o identificador único do funcionário.

Cada aluno possui um responsável financeiro que é a pessoa que paga as contas da escola.

A tabela cadastro_alunos mostra todos os alunos cadastrados na escola.

A view alunos mostra os alunos que estão matriculados atualmente.

### Tabelas existentes que podem ser utilizadas

```sql
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
`escola_frequetou_cidade1` varchar(255) DEFAULT NULL,
`escola_frequetou_serie1` varchar(255) DEFAULT NULL,
`escola_frequetou_ano1` int DEFAULT NULL,
`escola_frequetou_nome2` varchar(255) DEFAULT NULL,
`escola_frequetou_cidade2` varchar(255) DEFAULT NULL,
`escola_frequetou_serie2` varchar(255) DEFAULT NULL,
`escola_frequetou_ano2` int DEFAULT NULL,
`escola_frequetou_nome3` varchar(255) DEFAULT NULL,
`escola_frequetou_cidade3` varchar(255) DEFAULT NULL,
`escola_frequetou_serie3` varchar(255) DEFAULT NULL,
`escola_frequetou_ano3` int DEFAULT NULL,
`escola_frequetou_nome4` varchar(255) DEFAULT NULL,
`escola_frequetou_cidade4` varchar(255) DEFAULT NULL,
`escola_frequetou_serie4` varchar(255) DEFAULT NULL,
`escola_frequetou_ano4` int DEFAULT NULL,
`motivo_escolha_escola` varchar(255) DEFAULT NULL,
`foi_retido` int DEFAULT NULL,
`foi_retido_motivo` varchar(255) DEFAULT NULL,
`existe_local_para_estudo` int DEFAULT NULL,
`existe_horario_para_estudo` int DEFAULT NULL,
`ha_acompanhamento_estudos` int DEFAULT NULL,
`ha_acompanhamento_estudos_quem` varchar(255) DEFAULT NULL,
`participa_atividade_esportiva` int DEFAULT NULL,
`participa_atividade_esportiva_onde` varchar(255) DEFAULT NULL,
`participa_atividade_religiosa` int DEFAULT NULL,
`participa_atividade_religiosa_onde` varchar(255) DEFAULT NULL,
`participa_atividade_recreativa` int DEFAULT NULL,
`participa_atividade_recreativa_onde` varchar(255) DEFAULT NULL,
`participa_aula_informatica` int DEFAULT NULL,
`participa_aula_informatica_onde` varchar(255) DEFAULT NULL,
`participa_aula_linguas` int DEFAULT NULL,
`participa_aula_linguas_onde` varchar(255) DEFAULT NULL,
`participa_outras_atividades` int DEFAULT NULL,
`participa_outras_atividades_quais` varchar(255) DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=2714 DEFAULT CHARSET=latin1;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `alunos` AS select `a`.`ra` AS `ra`,`a`.`nome` AS `nome`,`a`.`nome_social` AS `nome_social`,`a`.`nacionalidade` AS `nacionalidade`,`a`.`natural_de` AS `natural_de`,`a`.`reside` AS `reside`,`a`.`nasc` AS `nasc`,`a`.`sexo` AS `sexo`,`a`.`estcivil` AS `estcivil`,`a`.`dt_cadastro` AS `dt_cadastro`,`a`.`email` AS `email`,`a`.`email2` AS `email2`,`a`.`familia` AS `familia`,`a`.`cod_religião` AS `cod_religião`,`a`.`cert_nasc` AS `cert_nasc`,`a`.`rg` AS `rg`,`a`.`rg_emissao` AS `rg_emissao`,`a`.`cpf` AS `cpf`,`a`.`t_eleitoral` AS `t_eleitoral`,`a`.`zon_sec` AS `zon_sec`,`a`.`reservista` AS `reservista`,`a`.`categoria` AS `categoria`,`a`.`reserv_emissao` AS `reserv_emissao`,`a`.`reserv_orgemissor` AS `reserv_orgemissor`,`a`.`tipo` AS `tipo`,`a`.`residecom` AS `residecom`,`a`.`endereco` AS `endereco`,`a`.`bairro` AS `bairro`,`a`.`tel_cel` AS `tel_cel`,`a`.`tel_res` AS `tel_res`,`a`.`cidade` AS `cidade`,`a`.`estado` AS `estado`,`a`.`cep` AS `cep`,`a`.`fax` AS `fax`,`a`.`foto` AS `foto`,`a`.`gr_sanguineo` AS `gr_sanguineo`,`a`.`rh` AS `rh`,`a`.`sarampo` AS `sarampo`,`a`.`catapora` AS `catapora`,`a`.`coqueluche` AS `coqueluche`,`a`.`caxumba` AS `caxumba`,`a`.`rubeola` AS `rubeola`,`a`.`dengue` AS `dengue`,`a`.`h1n1` AS `h1n1`,`a`.`covid19` AS `covid19`,`a`.`outras_doencas` AS `outras_doencas`,`a`.`esp_outras_doencas` AS `esp_outras_doencas`,`a`.`cardiovascular` AS `cardiovascular`,`a`.`neurologico` AS `neurologico`,`a`.`diabete` AS `diabete`,`a`.`audicao` AS `audicao`,`a`.`respiratorio` AS `respiratorio`,`a`.`musculo_esqueletico` AS `musculo_esqueletico`,`a`.`visao` AS `visao`,`a`.`outros_disturbios` AS `outros_disturbios`,`a`.`esp_outros_disturbios` AS `esp_outros_disturbios`,`a`.`medicacao` AS `medicacao`,`a`.`descricao_medicacao` AS `descricao_medicacao`,`a`.`tratamento` AS `tratamento`,`a`.`descricao_tratamento` AS `descricao_tratamento`,`a`.`anti_termico` AS `anti_termico`,`a`.`dosagem_anti_termico` AS `dosagem_anti_termico`,`a`.`analgesico` AS `analgesico`,`a`.`dosagem_analgesico` AS `dosagem_analgesico`,`a`.`cicatrizante` AS `cicatrizante`,`a`.`dosagem_cicatrizante` AS `dosagem_cicatrizante`,`a`.`outra_medicacao` AS `outra_medicacao`,`a`.`dosagem_outra_medicacao` AS `dosagem_outra_medicacao`,`a`.`cirurgia` AS `cirurgia`,`a`.`descricao_cirurgia` AS `descricao_cirurgia`,`a`.`medico` AS `medico`,`a`.`tel_medico` AS `tel_medico`,`a`.`dentista` AS `dentista`,`a`.`tel_dentista` AS `tel_dentista`,`a`.`convenio` AS `convenio`,`a`.`hospital` AS `hospital`,`a`.`obs_medicas` AS `obs_medicas`,`a`.`alergia` AS `alergia`,`a`.`descricao_alergia` AS `descricao_alergia`,`a`.`obs` AS `obs`,`a`.`nome_resp` AS `nome_resp`,`a`.`rg_resp` AS `rg_resp`,`a`.`cpf_resp` AS `cpf_resp`,`a`.`nasc_resp` AS `nasc_resp`,`a`.`endereco_resp` AS `endereco_resp`,`a`.`bairro_resp` AS `bairro_resp`,`a`.`tel_cel_resp` AS `tel_cel_resp`,`a`.`tel_res_resp` AS `tel_res_resp`,`a`.`cidade_resp` AS `cidade_resp`,`a`.`estado_resp` AS `estado_resp`,`a`.`cep_resp` AS `cep_resp`,`a`.`fax_resp` AS `fax_resp`,`a`.`email_resp` AS `email_resp`,`a`.`email_resp2` AS `email_resp2`,`a`.`empresa_resp` AS `empresa_resp`,`a`.`cod_prof_resp` AS `cod_prof_resp`,`a`.`tel_emp_resp` AS `tel_emp_resp`,`a`.`nome_resp_fin` AS `nome_resp_fin`,`a`.`tipo_resp_fin` AS `tipo_resp_fin`,`a`.`rg_resp_fin` AS `rg_resp_fin`,`a`.`cpf_resp_fin` AS `cpf_resp_fin`,`a`.`cnpj_resp_fin` AS `cnpj_resp_fin`,`a`.`nasc_resp_fin` AS `nasc_resp_fin`,`a`.`endereco_resp_fin` AS `endereco_resp_fin`,`a`.`bairro_resp_fin` AS `bairro_resp_fin`,`a`.`tel_cel_resp_fin` AS `tel_cel_resp_fin`,`a`.`tel_res_resp_fin` AS `tel_res_resp_fin`,`a`.`cidade_resp_fin` AS `cidade_resp_fin`,`a`.`estado_resp_fin` AS `estado_resp_fin`,`a`.`cep_resp_fin` AS `cep_resp_fin`,`a`.`fax_resp_fin` AS `fax_resp_fin`,`a`.`email_resp_fin` AS `email_resp_fin`,`a`.`email_resp_fin2` AS `email_resp_fin2`,`a`.`empresa_resp_fin` AS `empresa_resp_fin`,`a`.`cod_prof_resp_fin` AS `cod_prof_resp_fin`,`a`.`tel_emp_resp_fin` AS `tel_emp_resp_fin`,`a`.`cod_respfinanc` AS `cod_respfinanc`,`a`.`cod_resp` AS `cod_resp`,`a`.`endrespfin` AS `endrespfin`,`a`.`telrespfin` AS `telrespfin`,`a`.`endresp` AS `endresp`,`a`.`teltresp` AS `teltresp`,`m`.`nro_chamada` AS `nro_chamada`,`c`.`nome` AS `curso_nome`,`m`.`curso` AS `curso`,`m`.`serie` AS `serie`,`m`.`turma` AS `turma`,`m`.`data_matricula` AS `dt_matricula`,`m`.`status` AS `status`,`a`.`situacao_bib` AS `situacao_bib`,`a`.`obs_bib` AS `obs_bib`,`a`.`ult_emprestimo` AS `ult_emprestimo`,`a`.`data_ult_emprestimo` AS `data_ult_emprestimo`,`a`.`rematriculado` AS `rematriculado`,`a`.`obs_fin` AS `obs_fin`,`a`.`pesquisa` AS `pesquisa`,`a`.`tesouraria` AS `tesouraria`,`m`.`periodo` AS `periodo`,`m`.`ano_letivo` AS `ano_letivo`,`a`.`coordenacao` AS `coordenacao`,`a`.`obs_coo` AS `obs_coo`,`a`.`escola_destino` AS `escola_destino`,`a`.`motivo` AS `motivo`,`a`.`codigo_tipo_motivo` AS `codigo_tipo_motivo`,`m`.`data_saida` AS `dia_transferencia`,`a`.`senha` AS `senha`,`a`.`grade` AS `grade`,`a`.`plano_pagamento` AS `plano_pagamento`,`a`.`faz_tratamento_homeopatia` AS `faz_tratamento_homeopatia`,`a`.`faz_tratamento_alopatia` AS `faz_tratamento_alopatia`,`a`.`teve_problema_ao_nascer` AS `teve_problema_ao_nascer`,`a`.`teve_problema_ao_nascer_qual` AS `teve_problema_ao_nascer_qual`,`a`.`convulsao_com_febre` AS `convulsao_com_febre`,`a`.`convulsao_sem_febre` AS `convulsao_sem_febre`,`a`.`neurologista` AS `neurologista`,`a`.`neurologista_quando` AS `neurologista_quando`,`a`.`neurologista_porque` AS `neurologista_porque`,`a`.`tratamento_foniatrico` AS `tratamento_foniatrico`,`a`.`tratamento_foniatrico_porque` AS `tratamento_foniatrico_porque`,`a`.`tratamento_fisioterapico` AS `tratamento_fisioterapico`,`a`.`tratamento_fisioterapico_porque` AS `tratamento_fisioterapico_porque`,`a`.`escola_anterior` AS `escola_anterior`,`a`.`escola_frequetou_cidade1` AS `escola_frequetou_cidade1`,`a`.`escola_frequetou_serie1` AS `escola_frequetou_serie1`,`a`.`escola_frequetou_ano1` AS `escola_frequetou_ano1`,`a`.`escola_frequetou_nome2` AS `escola_frequetou_nome2`,`a`.`escola_frequetou_cidade2` AS `escola_frequetou_cidade2`,`a`.`escola_frequetou_serie2` AS `escola_frequetou_serie2`,`a`.`escola_frequetou_ano2` AS `escola_frequetou_ano2`,`a`.`escola_frequetou_nome3` AS `escola_frequetou_nome3`,`a`.`escola_frequetou_cidade3` AS `escola_frequetou_cidade3`,`a`.`escola_frequetou_serie3` AS `escola_frequetou_serie3`,`a`.`escola_frequetou_ano3` AS `escola_frequetou_ano3`,`a`.`escola_frequetou_nome4` AS `escola_frequetou_nome4`,`a`.`escola_frequetou_cidade4` AS `escola_frequetou_cidade4`,`a`.`escola_frequetou_serie4` AS `escola_frequetou_serie4`,`a`.`escola_frequetou_ano4` AS `escola_frequetou_ano4`,`a`.`motivo_escolha_escola` AS `motivo_escolha_escola`,`a`.`foi_retido` AS `foi_retido`,`a`.`foi_retido_motivo` AS `foi_retido_motivo`,`a`.`existe_local_para_estudo` AS `existe_local_para_estudo`,`a`.`existe_horario_para_estudo` AS `existe_horario_para_estudo`,`a`.`ha_acompanhamento_estudos` AS `ha_acompanhamento_estudos`,`a`.`ha_acompanhamento_estudos_quem` AS `ha_acompanhamento_estudos_quem`,`a`.`participa_atividade_esportiva` AS `participa_atividade_esportiva`,`a`.`participa_atividade_esportiva_onde` AS `participa_atividade_esportiva_onde`,`a`.`participa_atividade_religiosa` AS `participa_atividade_religiosa`,`a`.`participa_atividade_religiosa_onde` AS `participa_atividade_religiosa_onde`,`a`.`participa_atividade_recreativa` AS `participa_atividade_recreativa`,`a`.`participa_atividade_recreativa_onde` AS `participa_atividade_recreativa_onde`,`a`.`participa_aula_informatica` AS `participa_aula_informatica`,`a`.`participa_aula_informatica_onde` AS `participa_aula_informatica_onde`,`a`.`participa_aula_linguas` AS `participa_aula_linguas`,`a`.`participa_aula_linguas_onde` AS `participa_aula_linguas_onde`,`a`.`participa_outras_atividades` AS `participa_outras_atividades`,`a`.`participa_outras_atividades_quais` AS `participa_outras_atividades_quais`,`a`.`meio_transporte_chegada_escola` AS `meio_transporte_chegada_escola`,`a`.`meio_transporte_saida_escola` AS `meio_transporte_saida_escola`,`a`.`pessoa_autorizada_retirar_aluno1` AS `pessoa_autorizada_retirar_aluno1`,`a`.`pessoa_autorizada_retirar_aluno2` AS `pessoa_autorizada_retirar_aluno2`,`a`.`pessoa_autorizada_retirar_aluno3` AS `pessoa_autorizada_retirar_aluno3`,`a`.`pessoa_autorizada_retirar_aluno4` AS `pessoa_autorizada_retirar_aluno4`,`a`.`autorizado_deixar_colegio_sozinho` AS `autorizado_deixar_colegio_sozinho`,`a`.`quem_fica_aluno_ausencia_pais` AS `quem_fica_aluno_ausencia_pais`,`a`.`relacionamento_mae` AS `relacionamento_mae`,`a`.`relacionamento_pai` AS `relacionamento_pai`,`a`.`reserva` AS `reserva`,`a`.`concomitante` AS `concomitante`,`a`.`cor_raca` AS `cor_raca`,`a`.`programa_bilingue` AS `programa_bilingue`,`a`.`curriculum_americano` AS `curriculum_americano`,`a`.`nao_divulgar_imagem` AS `nao_divulgar_imagem`,`a`.`prodesp` AS `prodesp`,`a`.`latitude` AS `latitude`,`a`.`longitude` AS `longitude`,`a`.`santanna_mais` AS `santanna_mais`,`a`.`importado` AS `importado`,`a`.`assist_medica_emergencia` AS `assist_medica_emergencia`,`a`.`obs_portaria` AS `obs_portaria`,`a`.`necessidade_educ_especial` AS `necessidade_educ_especial`,`a`.`possui_laudo` AS `possui_laudo` from ((`cadastro_alunos` `a` join `matriculas_alunos` `m` on((`a`.`ra` = `m`.`ra`))) join `cursos` `c` on((`m`.`curso` = `c`.`codigo`))) where ((`m`.`ano_matricula` = '2025') and ((`m`.`ano_letivo` = '2025_2026') or (`m`.`ano_letivo` = '2025')) and (`m`.`status` = 'MAT') and (`c`.`ativo` = 1) and (`c`.`complementar` = 0));
```

## Requisitos Funcionais

Sempre que um requisito for concluído, ele deverá ser marcado como "concluído".

Os requisitos funcionais deverão ser separados por códigos, exemplo RF-001, RF-002, RF-003, etc.

### RF-001 - Sistema de Autenticação de Funcionários da Cantina

**Descrição**: O sistema deve permitir que funcionários da cantina façam login utilizando nome de usuário e senha.
**Regras de Negócio**:

- Login deve ser realizado com usuário e senha únicos
- Senhas devem ser criptografadas no banco de dados
- Sistema deve manter sessão ativa do usuário logado
- Deve haver controle de timeout de sessão por inatividade
- Logout deve invalidar a sessão atual
  **Tabelas Relacionadas**: `cant_usuarios_cantina`
  **Status**: ✅ **Concluído**

### RF-002 - Cadastro de Funcionários da Cantina

**Descrição**: O sistema deve permitir o cadastro, edição e exclusão de funcionários da cantina que serão os usuários do sistema.
**Regras de Negócio**:

- Cada funcionário deve ter: nome, usuário único, senha, email, telefone, nível de acesso
- Não permitir usuários duplicados
- Senha deve ter critérios mínimos de segurança
- Funcionário pode ter diferentes níveis de acesso (administrador, operador)
- Deve permitir ativação/desativação de usuários
  **Tabelas Relacionadas**: `cant_usuarios_cantina`
  **Status**: 🔄 **Em desenvolvimento** (API CRUD implementada, falta interface completa)

### RF-003 - Controle de Perfis de Acesso

**Descrição**: O sistema deve controlar o acesso às funcionalidades baseado no perfil do usuário logado.
**Regras de Negócio**:

- Perfil Administrador: acesso total ao sistema
- Perfil Operador: acesso apenas às funcionalidades de venda e consulta
- Controlar acesso a relatórios financeiros por perfil
- Registrar log de ações dos usuários
  **Tabelas Relacionadas**: `cant_usuarios_cantina`, `cant_perfis_acesso`
  **Status**: Não iniciado

### RF-004 - Gestão de Contas de Alunos

**Descrição**: O sistema deve permitir consultar e gerenciar as contas dos alunos com saldo disponível.
**Regras de Negócio**:

- Utilizar dados da tabela existente `alunos` (view) para informações dos alunos
- Cada aluno deve ter uma conta com saldo atual
- Permitir consulta de saldo por RA do aluno
- Exibir histórico de movimentações da conta
- Permitir recarga de saldo manualmente
- Saldo não pode ficar negativo
  **Tabelas Relacionadas**: `alunos`, `cant_contas_alunos`, `cant_movimentacoes_alunos`
  **Status**: ✅ **Concluído**

### RF-005 - Restrições de Consumo para Alunos

**Descrição**: O sistema deve permitir configurar restrições de consumo para alunos específicos.
**Regras de Negócio**:

- Permitir restringir consumo por tipo de produto
- Permitir restringir produtos específicos para um aluno
- Bloquear venda automaticamente quando houver restrição
- Exibir mensagem de restrição durante a tentativa de venda
- Permitir cadastro de observações sobre restrições médicas/alimentares
  **Tabelas Relacionadas**: `cant_restricoes_alunos`
  **Status**: Não iniciado

### RF-006 - Cadastro de Tipos de Produtos

**Descrição**: O sistema deve permitir cadastrar e gerenciar tipos/categorias de produtos.
**Regras de Negócio**:

- Tipos exemplo: salgados, doces, bebidas, refeições, etc.
- Cada tipo deve ter: nome, descrição, status ativo/inativo
- Não permitir exclusão de tipos que possuam produtos vinculados
- Ordenação alfabética na listagem
  **Tabelas Relacionadas**: `cant_tipos_produtos`
  **Status**: 🔄 **Em desenvolvimento** (API CRUD implementada, interface parcialmente completa)

### RF-007 - Cadastro de Produtos

**Descrição**: O sistema deve permitir cadastrar, editar e consultar produtos da cantina.
**Regras de Negócio**:

- Cada produto deve ter: nome, tipo, preço de venda, código de barras (opcional), status
- Produto deve estar vinculado obrigatoriamente a um tipo
- Permitir produtos por quilo (peso variável)
- Controlar preço histórico do produto
- Não permitir exclusão de produtos com movimentação
  **Tabelas Relacionadas**: `cant_produtos`, `cant_tipos_produtos`
  **Status**: ✅ **Concluído**

### RF-008 - Controle de Estoque

**Descrição**: O sistema deve controlar entrada e saída de produtos no estoque.
**Regras de Negócio**:

- Registrar entrada de produtos (compras/reposição)
- Baixa automática no estoque a cada venda
- Controle de estoque mínimo com alertas
- Permitir ajustes de estoque com justificativa
- Relatório de produtos com estoque baixo
- Não permitir venda de produtos sem estoque
  **Tabelas Relacionadas**: `cant_estoque`, `cant_movimentacoes_estoque`
  **Status**: ✅ **Concluído**

### RF-009 - PDV (Ponto de Venda)

**Descrição**: O sistema deve ter uma tela de PDV para registro de vendas da cantina.
**Regras de Negócio**:

- Buscar aluno por RA
- Exibir foto do aluno (URL: <https://sistema.santanna.g12.br/carometr/$ra.jpg>)
- Exibir saldo atual e dados básicos do aluno
- Adicionar produtos ao carrinho de compras
- Calcular total da venda
- Confirmar venda com baixa automática do saldo
- Exibir observações do aluno durante a venda
- Verificar restrições antes de finalizar venda
  **Tabelas Relacionadas**: `alunos`, `cant_vendas`, `cant_vendas_itens`, `cant_contas_alunos`
  **Status**: ✅ **Concluído**

### RF-010 - Controle de Caixa

**Descrição**: O sistema deve controlar abertura e fechamento do caixa da cantina.
**Regras de Negócio**:

- Abertura de caixa deve registrar valor inicial
- Registrar todas as vendas do período
- Fechamento deve calcular valor final esperado vs real
- Registrar diferenças (sangria, suprimento)
- Não permitir vendas com caixa fechado
- Histórico de movimentações do caixa
  **Tabelas Relacionadas**: `cant_caixa`, `cant_movimentacoes_caixa`
  **Status**: ✅ **Concluído**

### RF-011 - Vendas para Funcionários da Escola

**Descrição**: O sistema deve permitir registro de vendas para funcionários da escola que serão pagas posteriormente.
**Regras de Negócio**:

- Utilizar dados da tabela existente `funcionarios`
- Funcionário pode comprar e marcar na conta da cantina
- Gerar fatura mensal para cada funcionário
- Controlar limite de crédito por funcionário
- Registrar consumo diário dos funcionários
  **Tabelas Relacionadas**: `funcionarios`, `cant_vendas_funcionarios`, `cant_faturas_funcionarios`
  **Status**: Não iniciado

### RF-012 - Valores Diferenciados por Cargo

**Descrição**: O sistema deve permitir configurar valores diferenciados para refeições baseado no cargo do funcionário.
**Regras de Negócio**:

- Configurar tabela de preços por cargo
- Exemplo: almoço para professores R$ 15,00, coordenadores R$ 20,00
- Aplicar preço automaticamente baseado no cargo do funcionário
- Permitir alteração de preços por cargo
- Histórico de alterações de preços
  **Tabelas Relacionadas**: `cant_precos_por_cargo`
  **Status**: Não iniciado

### RF-013 - Geração de Faturas para Funcionários

**Descrição**: O sistema deve gerar faturas mensais do consumo dos funcionários da escola.
**Regras de Negócio**:

- Gerar fatura mensal automaticamente
- Consolidar todas as compras do funcionário no período
- Permitir envio da fatura por email
- Controlar status da fatura (gerada, enviada, paga)
- Permitir reenvio de faturas
  **Tabelas Relacionadas**: `cant_faturas_funcionarios`, `cant_vendas_funcionarios`
  **Status**: Não iniciado

### RF-014 - Registro de Pagamentos de Funcionários

**Descrição**: O sistema deve registrar os pagamentos das faturas dos funcionários da escola.
**Regras de Negócio**:

- Registrar data e valor do pagamento
- Controlar pagamentos parciais
- Gerar recibo de pagamento
- Atualizar status da fatura
- Controle de inadimplência
  **Tabelas Relacionadas**: `cant_pagamentos_funcionarios`, `cant_faturas_funcionarios`
  **Status**: Não iniciado

### RF-015 - Pacotes de Alimentação

**Descrição**: O sistema deve permitir que responsáveis comprem pacotes de alimentação para os alunos.
**Regras de Negócio**:

- Tipos de pacote: lanche manhã, almoço, lanche tarde, jantar
- Permitir compra de pacotes por período (mensal, bimestral)
- Controlar validade dos pacotes
- Baixa automática do pacote a cada utilização
- Alertar quando pacote estiver vencendo
- Não permitir uso após vencimento
  **Tabelas Relacionadas**: `cant_pacotes_alimentacao`, `cant_pacotes_alunos`
  **Status**: Não iniciado

### RF-016 - Controle de Uso de Pacotes

**Descrição**: O sistema deve controlar o uso dos pacotes de alimentação pelos alunos.
**Regras de Negócio**:

- Verificar se aluno possui pacote válido para o tipo de refeição
- Registrar uso do pacote com data/hora
- Exibir quantidade restante de refeições no pacote
- Impedir uso múltiplo no mesmo dia (configurável)
- Relatório de utilização dos pacotes
  **Tabelas Relacionadas**: `cant_pacotes_alunos`, `cant_uso_pacotes`
  **Status**: Não iniciado

### RF-017 - Histórico de Vendas e Consumo

**Descrição**: O sistema deve manter histórico completo de vendas e consumo de alunos e funcionários.
**Regras de Negócio**:

- Registrar todas as transações com data/hora
- Permitir consulta por período
- Filtros por aluno, funcionário, produto, tipo de produto
- Exibir detalhes de cada venda (produtos, quantidades, valores)
- Não permitir alteração de histórico
  **Tabelas Relacionadas**: `cant_vendas`, `cant_vendas_itens`, `cant_vendas_funcionarios`
  **Status**: ✅ **Concluído**

### RF-018 - Observações dos Alunos

**Descrição**: O sistema deve permitir cadastrar e exibir observações específicas dos alunos.
**Regras de Negócio**:

- Observações devem aparecer destacadas durante a venda
- Tipos de observação: médica, alimentar, comportamental
- Observações com data de validade
- Permitir múltiplas observações por aluno
- Alertas visuais para observações importantes
  **Tabelas Relacionadas**: `cant_observacoes_alunos`
  **Status**: ✅ **Concluído** — APIs REST, tela administrativa e alertas no PDV ativos

### RF-019 - Relatório de Consumo Mensal

**Descrição**: O sistema deve gerar relatórios de consumo mensal para diferentes finalidades.
**Regras de Negócio**:

- Relatório de consumo por aluno
- Relatório de consumo por funcionário
- Relatório de vendas por produto
- Relatório de receitas do período
- Exportação em PDF e Excel
- Filtros por período, tipo de cliente, produtos
  **Tabelas Relacionadas**: Todas as tabelas de vendas
  **Status**: Não iniciado

### RF-020 - Controle de Contas a Pagar e Receber

**Descrição**: O sistema deve controlar as contas a pagar (fornecedores) e a receber (faturas de funcionários).
**Regras de Negócio**:

- Cadastro de fornecedores e compras
- Controle de vencimentos
- Relatório de inadimplência
- Dashboard financeiro
- Controle de fluxo de caixa
  **Tabelas Relacionadas**: `cant_contas_pagar`, `cant_contas_receber`, `cant_fornecedores`
  **Status**: Não iniciado

### RF-021 - Refeições por Quilo

**Descrição**: O sistema deve suportar produtos vendidos por peso (refeições por quilo).
**Regras de Negócio**:

- Cadastrar produtos com tipo "por quilo"
- Permitir input do peso durante a venda
- Calcular valor baseado no peso × preço por quilo
- Registrar peso na venda
- Controle de estoque por quantidade, não por peso
  **Tabelas Relacionadas**: `cant_produtos`, `cant_vendas_itens`
  **Status**: Não iniciado

### RF-022 - Dashboard Gerencial

**Descrição**: O sistema deve ter um dashboard com indicadores gerenciais da cantina.
**Regras de Negócio**:

- Vendas do dia, semana, mês
- Produtos mais vendidos
- Alunos com maior consumo
- Situação do estoque
- Receitas e despesas
- Gráficos e indicadores visuais
  **Tabelas Relacionadas**: Todas as tabelas principais
  **Status**: Não iniciado

### RF-023 - Integração com Sistema APS

**Descrição**: O sistema deve integrar com as tabelas existentes do sistema APS da escola.
**Regras de Negócio**:

- Utilizar dados das tabelas `alunos`, `funcionarios`, `cadastro_alunos`
- Não alterar estrutura das tabelas existentes
- Sincronização automática de dados básicos
- Tratamento de alunos/funcionários inativos
  **Tabelas Relacionadas**: `alunos`, `funcionarios`, `cadastro_alunos`
  **Status**: Não iniciado

### RF-024 - Backup e Recuperação de Dados

**Descrição**: O sistema deve implementar rotinas de backup e recuperação dos dados da cantina.
**Regras de Negócio**:

- Backup automático diário das tabelas da cantina
- Permitir backup manual
- Rotina de limpeza de backups antigos
- Teste de integridade dos backups
- Procedimento de restauração
  **Tabelas Relacionadas**: Todas as tabelas `cant_*`
  **Status**: Não iniciado

### RF-025 - Tela Inicial e Dashboard Básico

**Descrição**: O sistema deve ter uma tela inicial com dashboard básico e navegação principal.
**Regras de Negócio**:

- Verificação automática de autenticação ao acessar
- Redirecionamento para login se não autenticado
- Dashboard responsivo com estatísticas básicas
- Menu de navegação para principais funcionalidades
- Ações rápidas para funções mais utilizadas
- Design consistente com as cores do sistema
- Interface moderna e intuitiva
  **Tabelas Relacionadas**: Múltiplas tabelas para estatísticas
  **Status**: ✅ **Concluído**

### RF-026 - Configurações do Sistema

**Descrição**: O sistema deve permitir configurações gerais e parâmetros operacionais.
**Regras de Negócio**:

- Configuração de timeout de sessão
- Parâmetros de segurança (critérios de senha)
- Configuração de URLs externas (fotos de alunos)
- Configuração de valores padrão do sistema
- Backup automático das configurações
- Logs de alterações de configurações
  **Tabelas Relacionadas**: `cant_configuracoes_sistema`
  **Status**: Não iniciado

### RF-027 - Validação e Sanitização de Dados

**Descrição**: O sistema deve implementar validação rigorosa e sanitização de todos os dados de entrada.
**Regras de Negócio**:

- Validação de campos obrigatórios em todas as telas
- Sanitização contra XSS e SQL injection
- Validação de tipos de dados (números, emails, telefones)
- Validação de tamanhos de campos
- Mensagens de erro padronizadas e amigáveis
- Validação tanto no frontend quanto no backend
  **Tabelas Relacionadas**: Todas as tabelas
  **Status**: Parcialmente implementado

### RF-028 - Sistema de Logs e Auditoria

**Descrição**: O sistema deve manter logs detalhados de todas as operações críticas.
**Regras de Negócio**:

- Log de todas as vendas e transações
- Log de alterações em produtos e preços
- Log de acessos e tentativas de login
- Log de alterações em contas de usuários
- Retenção de logs por período configurável
- Relatórios de auditoria para administradores
  **Tabelas Relacionadas**: `cant_log_acoes`, `cant_log_vendas`, `cant_log_sistema`
  **Status**: Parcialmente implementado

### RF-029 - Busca e Filtros Avançados

**Descrição**: O sistema deve permitir busca rápida e filtros avançados em todas as listagens.
**Regras de Negócio**:

- Busca de alunos por RA, nome ou turma
- Busca de produtos por nome ou código de barras
- Filtros por período em relatórios
- Busca de funcionários por nome ou cargo
- Auto-complete em campos de busca
- Histórico de buscas recentes
  **Tabelas Relacionadas**: Múltiplas tabelas
  **Status**: Não iniciado

### RF-030 - Responsividade e Acessibilidade

**Descrição**: O sistema deve ser totalmente responsivo e acessível.
**Regras de Negócio**:

- Interface adaptável para tablets e smartphones
- Suporte a leitores de tela
- Navegação por teclado
- Contraste adequado para deficientes visuais
- Textos alternativos em imagens
- Tamanhos de fonte ajustáveis
  **Tabelas Relacionadas**: Não aplicável
  **Status**: Parcialmente implementado

### RF-031 - Cache e Performance

**Descrição**: O sistema deve implementar estratégias de cache para otimizar performance.
**Regras de Negócio**:

- Cache de dados frequentemente acessados (produtos, tipos)
- Cache de sessões de usuário
- Compressão de imagens de alunos
- Otimização de consultas ao banco
- Lazy loading em listagens grandes
- Métricas de performance
  **Tabelas Relacionadas**: Não aplicável
  **Status**: Não iniciado

### RF-032 - Exportação e Importação de Dados

**Descrição**: O sistema deve permitir exportação e importação de dados em formatos padrão.
**Regras de Negócio**:

- Exportação de relatórios em PDF e Excel
- Importação de produtos via CSV
- Importação de contas de alunos via CSV
- Validação de dados na importação
- Log de operações de importação/exportação
- Templates padrão para importação
  **Tabelas Relacionadas**: Todas as tabelas principais
  **Status**: Não iniciado

### RF-033 - Notificações e Alertas

**Descrição**: O sistema deve enviar notificações e alertas automáticos.
**Regras de Negócio**:

- Alerta de produtos com estoque baixo
- Notificação de faturas vencendo
- Alerta de pacotes de alunos próximos ao vencimento
- Notificação de tentativas de acesso inválidas
- Dashboard com resumo de alertas
- Configuração de tipos de alertas por usuário
  **Tabelas Relacionadas**: `cant_alertas`, `cant_notificacoes`
  **Status**: Não iniciado

### RF-034 - Importação de Saldo de Alunos

**Descrição**: O sistema deve disponibilizar uma tela para importar, por arquivo CSV, os saldos das contas dos alunos.
**Regras de Negócio**:

- Disponível apenas para usuários com perfil Administrador
- Aceitar upload de arquivo CSV sem cabeçalho, utilizando `;` como separador e formato `RA_DO_ALUNO;SALDO`, suportando valores monetários com vírgula ou ponto como separador decimal
- Validar existência do RA na view `alunos`; registros inválidos devem ser exibidos no resumo final com motivo do erro sem interromper a importação dos demais
- Atualizar o saldo da conta para o valor informado quando o aluno já possuir conta ativa; quando não houver conta, criar automaticamente uma nova com o saldo importado
- Registrar movimentação de ajuste por aluno com saldo anterior, preservando o valor antes da importação e gerando log de auditoria com usuário, data, nome do arquivo e totais processados
- Exibir, ao término da importação, relatório com totais importados, quantidade de contas criadas, atualizadas e rejeitadas, além da lista dos alunos afetados mostrando saldo anterior e saldo final
  **Tabelas Relacionadas**: `cant_contas_alunos`, `cant_movimentacoes_alunos`, `cant_log_acoes`
  **Status**: ✅ **Concluído**

## Prioridade de Desenvolvimento

### 🔥 **ALTA PRIORIDADE** - Funcionalidades Críticas (Próximas 2-4 semanas)

1. **RF-007 - Cadastro de Produtos** ⚠️ Dependência crítica para PDV
2. **RF-004 - Gestão de Contas de Alunos** ⚠️ Necessário para vendas
3. **RF-008 - Controle de Estoque** ⚠️ Base para controle financeiro
4. **RF-009 - PDV (Ponto de Venda)** 🎯 **FUNCIONALIDADE PRINCIPAL**

### 🟡 **MÉDIA PRIORIDADE** - Funcionalidades Importantes (4-8 semanas)

1. **RF-005 - Restrições de Consumo para Alunos** - Segurança e controle médico
2. **RF-010 - Controle de Caixa** - Gestão financeira essencial
3. ✅ **RF-018 - Observações dos Alunos** - Entregue (gestão via portal e alertas no PDV)
4. **RF-003 - Controle de Perfis de Acesso** - Segurança do sistema
5. **RF-011 - Vendas para Funcionários da Escola** - Funcionalidade diferencial

### 🔵 **BAIXA PRIORIDADE** - Funcionalidades Complementares (8+ semanas)

1. **RF-015 - Pacotes de Alimentação** - Valor agregado
2. **RF-016 - Controle de Uso de Pacotes**
3. **RF-012 - Valores Diferenciados por Cargo**
4. **RF-013 - Geração de Faturas para Funcionários**
5. **RF-014 - Registro de Pagamentos de Funcionários**

### 📊 **Relatórios e Analytics**

1. ✅ **RF-017 - Histórico de Vendas e Consumo** - Entregue
2. **RF-019 - Relatório de Consumo Mensal**
3. **RF-022 - Dashboard Gerencial**

### 🔧 **Infraestrutura e Melhorias**

1. **RF-027 - Validação e Sanitização de Dados** - Segurança
2. **RF-028 - Sistema de Logs e Auditoria** - Rastreabilidade
3. **RF-029 - Busca e Filtros Avançados** - UX
4. **RF-030 - Responsividade e Acessibilidade** - Acessibilidade
5. **RF-031 - Cache e Performance** - Otimização
6. **RF-032 - Exportação e Importação de Dados** - Utilidade
7. **RF-033 - Notificações e Alertas** - Automação

### 💼 **Funcionalidades Administrativas**

1. **RF-020 - Controle de Contas a Pagar e Receber**
2. **RF-023 - Integração com Sistema APS**
3. **RF-024 - Backup e Recuperação de Dados**
4. **RF-026 - Configurações do Sistema**

## Dependências entre Requisitos

```bash
RF-007 (Produtos) ─┐
                   ├─→ RF-009 (PDV) ─┐
RF-004 (Contas)  ──┘                ├─→ RF-010 (Caixa)
                                     │
RF-008 (Estoque) ────────────────────┘

RF-005 (Restrições) ──→ RF-009 (PDV)
RF-018 (Observações) ──→ RF-009 (PDV)

RF-011 (Vendas Func.) ──→ RF-013 (Faturas) ──→ RF-014 (Pagamentos)

RF-015 (Pacotes) ──→ RF-016 (Uso Pacotes)
```

## Estimativas de Desenvolvimento

| RF     | Funcionalidade       | Complexidade | Estimativa | Dependências           |
| ------ | -------------------- | ------------ | ---------- | ---------------------- |
| RF-007 | Cadastro de Produtos | Média        | 3-5 dias   | RF-006                 |
| RF-004 | Contas de Alunos     | Média        | 4-6 dias   | Integração APS         |
| RF-008 | Controle de Estoque  | Alta         | 5-8 dias   | RF-007                 |
| RF-009 | PDV                  | Muito Alta   | 8-12 dias  | RF-004, RF-007, RF-008 |
| RF-010 | Controle de Caixa    | Alta         | 5-7 dias   | RF-009                 |
| RF-005 | Restrições Alunos    | Baixa        | 2-3 dias   | RF-004                 |
| RF-018 | Observações Alunos   | Baixa        | 2-3 dias   | RF-004                 |

\*Estimativas baseadas em desenvolvimento por um desenvolvedor experiente com a stack.
