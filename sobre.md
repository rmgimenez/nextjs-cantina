# Sistema de controle de cantina escolar

O objetivo desse sistema é gerenciar de forma eficiente as operações de uma cantina escolar, permitindo o controle de usuários, funcionários, responsáveis e alunos, além de facilitar a gestão de vendas e estoque.

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

## Funcionalidades

### Atores

#### Funcionários da cantina

São os usuários responsáveis pelo atendimento e gestão da cantina.

Eles usarão um nome de usuário e senha para acessar o sistema.

#### Alunos

São os principais clientes da cantina.

#### Funcionários da escola

São consumidores que podem marcar na conta da cantina suas compras e depois a cantina envia um relatório para o departamento pessoal para descontar o valor consumido no mês. A conta fecha por mês.

### Funcionalidades do sistema

- Os funcionários da cantina poderão ser de 3 tipos:
  - Administrador: Tem acesso total ao sistema, podendo gerenciar usuários, produtos e vendas.
  - Atendente: Pode realizar vendas e consultar o estoque.
  - Estoquista: Pode gerenciar o estoque de produtos.
- Conta de alunos com saldo que pode ser usado para compras.
- Cadastro de tipos de produtos
- Cadastro de produtos
- Controle de estoque
- Registro de vendas
- PDV
- Controle de caixas (abrir e fechar caixa)
- Cadastro de usuários
- Controle do que foi gasto pelos funcionários da escola
- Possibilidade de geração de relatórios de consumo dos funcionários
- Geração de fatura para os funcionários da escola
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
- Os produtos deverão possuir um tipo para classificação (ex: salgados, doces, etc).
- Deverá existir um tipo de refeição que é por quilo.
- Possibilidade de informar qual será o valor cobrado pelo almoço para cada funcionário da escola. Esse valor varia de acordo com o cargo do funcionário.

## Banco de dados

O banco de dados utilizado será MySQL.

Ele já possui algumas tabelas criadas. O sistema poderá usar essas tabelas existentes, mas não alterá-las.

Todas as tabelas do banco de dados deverão ser criadas com o prefixo `cant_`.

Todo o esquema do banco de dados deve ser criado manualmente.

Os scripts estarão no arquivo `bancodados.sql`.

Utilizar o máximo possível triggers, funções, views e stored procedures.

Tentar fazer o máximo possível de operações no banco de dados, evitando lógica de negócios no código da aplicação.

Focar na criação de views para simplificar consultas complexas e na utilização de stored procedures para encapsular lógica de negócios.

## Requisitos Funcionais

Sempre que um requisito for concluído, ele deverá ser marcado como "concluído".

Os requisitos funcionais deverão ser separados por códigos, exemplo RF-001, RF-002, RF-003, etc.

### Módulo de Autenticação e Autorização

**RF-001** - Sistema de login para funcionários da cantina

- O sistema deve permitir login com nome de usuário e senha
- Deve validar credenciais no banco de dados
- Status: ✅ Concluído

Observação: Implementado endpoint de login (`/api/login`) e logout (`/api/logout`), validação de credenciais em `cant_usuarios` (bcrypt) com fallback legada, e sessão via cookie JWT (`cantina_session`). Página de login em `/login` adicionada para testes.

**RF-002** - Controle de perfis de usuário

- Administrador: Acesso total ao sistema
- Atendente: Realizar vendas e consultar estoque
- Estoquista: Gerenciar estoque de produtos
- Status: ✅ Concluído

**RF-003** - Controle de sessão e logout

- Manter sessão ativa do usuário logado
- Permitir logout seguro
- Status: ✅ Concluído

### Módulo de Gestão de Usuários

**RF-004** - Cadastro de funcionários da cantina

- Criar, editar, visualizar e desativar funcionários
- Definir perfil de acesso (Administrador, Atendente, Estoquista)
- Status: ✅ Concluído

Implementado CRUD completo em `/api/usuarios` com criação (hash bcrypt), edição, desativação (soft delete) e reset de senha. Interface de gestão em `/dashboard/usuarios` permite criar, editar, desativar e resetar senha. Controle de acesso restrito a ADMIN.

**RF-005** - Integração com dados de alunos

- Utilizar tabelas existentes de alunos
- Obter fotos via URL: <https://sistema.santanna.g12.br/carometr/$ra.jpg>
- Status: ✅ Concluído

Endpoint `/api/alunos` permite consulta por RA ou parte do nome (limite 20) retornando RA, nome, curso, série, turma e URL de foto. Interface de consulta em aba "Alunos" (somente leitura) dentro de `/dashboard/usuarios`. Não altera tabelas legadas.

**RF-006** - Integração com dados de funcionários da escola

- Utilizar tabelas existentes de funcionários
- Definir valores de almoço por cargo
- Status: ✅ Concluído

Endpoints `/api/funcionarios` (busca código, nome ou cargo) e `/api/funcionarios/preco-cargo` (listar/criar/atualizar preço por cargo via UPSERT). Interface na aba "Funcionários Escola" para busca e manutenção de preços de refeição (`cant_preco_cargo`).

### Módulo de Produtos e Estoque

**RF-007** - Cadastro de tipos de produtos

- Criar categorias (salgados, doces, bebidas, etc.)
- Incluir tipo "por quilo" para refeições
- Status: 🔴 Pendente

**RF-008** - Cadastro de produtos

- Nome, descrição, preço, categoria
- Controle de ativo/inativo
- Status: 🔴 Pendente

**RF-009** - Controle de estoque

- Entrada e saída de produtos
- Consulta de saldo atual
- Alertas de estoque baixo
- Status: ✅ Concluído

**RF-010** - Relatórios de estoque

- Produtos em falta
- Movimentação de estoque
- Produtos mais vendidos
- Status: 🔴 Pendente

### Módulo de Vendas e PDV

**RF-011** - Sistema de PDV (Ponto de Venda)

- Interface para registrar vendas
- Busca de produtos por código ou nome
- Cálculo automático de totais
- Status: ✅ Concluído

**RF-012** - Vendas para alunos

- Identificação do aluno por RA
- Verificação de saldo disponível
- Desconto automático do saldo
- Exibição de foto do aluno
- Status: ✅ Concluído

**RF-013** - Vendas para funcionários da escola

- Identificação do funcionário
- Registro na conta mensal
- Aplicação de preços específicos por cargo
- Status: ✅ Concluído

**RF-014** - Vendas avulsas (dinheiro/cartão)

- Registro de vendas sem identificação
- Controle de pagamento em dinheiro
- Status: ✅ Concluído

### Módulo de Controle de Caixa

**RF-015** - Abertura de caixa

- Registrar valor inicial do caixa
- Identificar funcionário responsável
- Status: ✅ Concluído

**RF-016** - Fechamento de caixa

- Calcular total de vendas
- Verificar diferenças de caixa
- Gerar relatório de fechamento
- Status: ✅ Concluído

**RF-017** - Sangria e reforço de caixa

- Registrar retiradas de dinheiro
- Registrar entradas de dinheiro
- Status: 🔴 Pendente

### Módulo de Saldo e Pacotes

**RF-018** - Gestão de saldo dos alunos

- Consultar saldo atual
- Histórico de movimentações
- Recarga de saldo
- Status: 🔴 Pendente

**RF-019** - Pacotes de alimentação

- Criação de pacotes (ex: lanche + almoço por 1 mês)
- Venda de pacotes para responsáveis
- Controle de utilização dos pacotes
- Status: 🔴 Pendente

**RF-020** - Verificação de pacotes ativos

- Consultar se aluno possui pacote válido
- Validar tipo de refeição do pacote
- Status: 🔴 Pendente

### Módulo de Restrições e Observações

**RF-021** - Restrições de consumo

- Bloquear produtos específicos por aluno
- Bloquear categorias de produtos por aluno
- Status: ✅ Concluído

**RF-022** - Observações do aluno

- Cadastrar observações importantes
- Exibir observações durante a venda
- Status: ✅ Concluído

### Módulo de Relatórios e Faturas

**RF-023** - Relatório de consumo dos funcionários

- Listagem de compras por funcionário
- Totais por período
- Status: 🔴 Pendente

**RF-024** - Geração de faturas mensais

- Fatura por funcionário da escola
- Fechamento mensal automático
- Status: 🔴 Pendente

**RF-025** - Histórico de vendas dos alunos

- Consultar compras por aluno
- Filtros por período e produto
- Status: 🔴 Pendente

**RF-026** - Relatórios gerenciais

- Vendas por período
- Produtos mais vendidos
- Performance por funcionário
- Status: 🔴 Pendente

### Módulo de Contas a Pagar e Receber

**RF-027** - Controle de contas a pagar

- Registro de despesas da cantina
- Controle de vencimentos
- Status: ✅ Concluído

**RF-028** - Controle de contas a receber

- Registro de valores a receber
- Controle de inadimplência
- Status: ✅ Concluído

### Banco de Dados

**RF-029** - Estrutura do banco de dados

- Criar todas as tabelas com prefixo `cant_`
- Implementar triggers para automações
- Criar views para consultas complexas
- Status: 🔴 Pendente

**RF-030** - Stored procedures

- Procedures para lógica de negócio
- Funções auxiliares
- Encapsular operações complexas
- Status: 🔴 Pendente

**RF-031** - Integração com tabelas existentes

- Usar tabelas legadas sem alterá-las
- Criar relacionamentos necessários
- Status: 🔴 Pendente

### Interface do Sistema

**RF-032** - Design system

- Implementar cores da identidade visual
- Layout responsivo com Bootstrap (usar tokens de tema, componentes primitivos e system props)
- Componentes reutilizáveis construídos com Bootstrap e hooks
- Status: 🔴 Pendente

Observação de migração: o projeto foi migrado de Tailwind CSS para Bootstrap. Para manter histórico, arquivos de configuração do Tailwind podem permanecer temporariamente, mas a nova implementação deve:

- Envolver a aplicação com `Bootstrap` e um tema centralizado que expõe as cores do projeto.
- Remover importações diretas de classes Tailwind nos componentes; substituir por componentes Bootstrap (`Box`, `Flex`, `Button`, `Input`, etc.) e propriedades de sistema.
- Manter `pnpm` como gerenciador de pacotes e instalar as dependências.

Se preferir, posso automatizar uma passagem inicial convertendo os componentes mais usados (ex: botões, cards, inputs) de classes Tailwind para componentes Bootstrap.

**RF-033** - Dashboard principal

- Visão geral das operações
- Indicadores importantes
- Acesso rápido às funcionalidades
- Status: 🔴 Pendente

**RF-034** - Navegação e usabilidade

- Menu intuitivo por perfil de usuário
- Breadcrumbs e navegação contextual
- Status: 🔴 Pendente
