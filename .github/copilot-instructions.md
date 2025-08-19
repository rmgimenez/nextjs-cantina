# Copilot Instructions for nextjs-cantina

## Visão Geral

Este projeto é um sistema de controle de cantina escolar, com frontend em Next.js/TypeScript e backend MySQL. O objetivo é gerenciar operações de cantina, incluindo usuários, alunos, funcionários, vendas, estoque e relatórios financeiros.

## Estrutura e Convenções

- Scripts de banco de dados estão em `bancodados.sql`. Todas as tabelas novas devem usar o prefixo `cant_`.
- O arquivo `sobre.md` detalha requisitos, regras de negócio e funcionalidades. Consulte-o antes de propor mudanças de escopo.
- O frontend deve usar Next.js, TypeScript, Tailwind CSS e seguir camelCase para variáveis, PascalCase para classes, UPPER_SNAKE_CASE para constantes e kebab-case para arquivos.
- Cores principais: Azul #253287, Vermelho #B20000, Amarelo #FEA800, Escuro #333333, Claro #FFFFFF.
- Fotos de alunos: obtenha via URL `https://sistema.santanna.g12.br/carometr/$ra.jpg` (substitua `$ra` pelo RA do aluno).

## Banco de Dados

- Use o máximo possível de views, triggers, funções e stored procedures para lógica de negócio.
- Evite lógica de negócio no backend da aplicação; centralize no MySQL.
- Não altere tabelas legadas já existentes (ex: `cadastro_alunos`, `familias`, `funcionarios`).
- Scripts de criação/alteração devem ser manuais e versionados em `bancodados.sql`.

## Workflows de Desenvolvimento

- Use `pnpm` para instalar dependências (`pnpm install`).
- Para rodar o frontend: `pnpm dev`.
- Scripts de banco de dados devem ser aplicados manualmente no MySQL.
- Siga os requisitos funcionais do `sobre.md` e marque-os como "concluído" quando finalizados.

## Padrões e Integrações

- Classifique produtos por tipo (ex: salgados, doces, etc).
- Controle de saldo, pacotes de alimentação e restrições de consumo devem ser implementados no banco.
- Relatórios e faturas para funcionários da escola devem ser gerados via procedures/views.
  -- Use Bootstrap para estilização e mantenha a identidade visual conforme as cores definidas. Prefira tokens de tema, componentes primitivos e system props.

## Exemplos de Arquivos-Chave

- `bancodados.sql`: estrutura e lógica do banco.
- `sobre.md`: regras de negócio, requisitos e contexto do sistema.

## Outras Observações

- Sempre consulte e atualize os requisitos funcionais.
- Documente decisões arquiteturais relevantes no `sobre.md`.
- Evite dependências desnecessárias e mantenha o projeto alinhado às tecnologias listadas.
