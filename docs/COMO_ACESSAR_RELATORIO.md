# 📍 Como Acessar o Relatório de Faturas em PDF

## 🎯 Caminho de Navegação

Para acessar o relatório de faturas para o Departamento Pessoal, siga este caminho:

```
Menu Principal → Financeiro → Relatório de Faturas (PDF)
```

## 📋 Passo a Passo Detalhado

### 1️⃣ Faça Login no Sistema
- Acesse: `http://localhost:3001/login`
- Digite seu usuário e senha
- Clique em "Entrar"

### 2️⃣ No Menu Lateral, Clique em "Financeiro" 💰
- Localizado no menu lateral esquerdo
- Ícone: 💰 (cifrão)
- **Importante**: Apenas usuários com perfil **Administrador** têm acesso

### 3️⃣ Clique em "Relatório de Faturas (PDF)" 📑
- Submenu dentro de "Financeiro"
- Ícone: 📑 (documento)
- Último item da lista do menu Financeiro

### 4️⃣ Configure os Filtros
- **Mês Início**: Selecione o mês inicial (opcional)
- **Mês Fim**: Selecione o mês final (opcional)
- **Funcionário**: Busque por nome (opcional)
- **Status**: Selecione o status da fatura (opcional)

### 5️⃣ Gere o PDF
- Clique no botão azul "Gerar Relatório PDF"
- Aguarde alguns segundos (aparecerá "Gerando PDF...")
- O PDF será baixado automaticamente

## 🗺️ Estrutura do Menu Completo

```
📊 Dashboard
💰 Caixa
🛒 Vendas
    💰 PDV
    📋 Histórico de Vendas
📦 Produtos
    ➕ Cadastro de Produtos
    🏷️ Tipos de Produtos
📦 Estoque
    📊 Controle de Estoque
    🔄 Movimentações
👨‍🎓 Alunos
    💳 Contas dos Alunos
    📊 Histórico do Aluno
    🚫 Restrições
    📦 Pacotes de Alimentação
👥 Funcionários
    👨‍💼 Funcionários da Cantina
    👨‍🏫 Funcionários da Escola
📊 Relatórios
    💰 Relatório de Vendas
    📈 Relatório de Consumo
    📦 Relatório de Estoque
💰 Financeiro ⭐
    📊 Dashboard Financeiro
    🏢 Fornecedores
    📤 Contas a Pagar
    📥 Contas a Receber
    💳 Contas de Funcionários
    🏷️ Preços por Cargo
    📈 Relatórios Financeiros
    📄 Faturas de Funcionários
    📑 Relatório de Faturas (PDF) 👈 VOCÊ ESTÁ AQUI!
⚙️ Configurações
    👥 Usuários do Sistema
```

## 🔐 Permissões

### Quem Pode Acessar?

✅ **Administradores** (Perfil 1)
- Acesso completo ao menu Financeiro
- Podem gerar relatórios de todos os funcionários

❌ **Operadores** (Perfil 2)
- Não têm acesso ao menu Financeiro
- Não podem gerar este relatório

## 🌐 URLs Diretas

Se você já está autenticado, pode acessar diretamente:

### Interface de Geração
```
http://localhost:3001/financeiro/relatorios/faturas
```

### API (para desenvolvedores)
```
http://localhost:3001/api/relatorios/faturas/pdf?mesInicio=2025-01&mesFim=2025-01
```

## 🖼️ Referência Visual

### Tela Inicial Após Login
```
┌─────────────────────────────────────────┐
│  [Menu]  Sistema de Cantina  [Sair]    │
├──────────┬──────────────────────────────┤
│ 📊 Dash  │                              │
│ 💰 Caixa │    Conteúdo Principal        │
│ 🛒 Vendas│                              │
│ 📦 Prods │                              │
│ 📦 Estoq │                              │
│ 👨‍🎓 Alunos│                              │
│ 👥 Funcs │                              │
│ 📊 Relats│                              │
│ 💰 Financ│ ◄── CLIQUE AQUI              │
│ ⚙️ Config│                              │
└──────────┴──────────────────────────────┘
```

### Menu Financeiro Expandido
```
┌─────────────────────────────────────────┐
│  [Menu]  Sistema de Cantina  [Sair]    │
├──────────┬──────────────────────────────┤
│ 💰 Financ│ ▼                            │
│   📊 Dash│                              │
│   🏢 Forn│                              │
│   📤 C.Pa│                              │
│   📥 C.Re│                              │
│   💳 Conts│                              │
│   🏷️ Preçs│                              │
│   📈 Relat│                              │
│   📄 Fatur│                              │
│   📑 Rel. │ ◄── CLIQUE AQUI              │
│      Fatu│     (Relatório de Faturas)   │
│ ⚙️ Config│                              │
└──────────┴──────────────────────────────┘
```

### Tela do Relatório
```
┌──────────────────────────────────────────────┐
│ 📑 Relatório de Faturas para Dep. Pessoal   │
├──────────────────────────────────────────────┤
│ ┌── Filtros do Relatório ──────────────────┐ │
│ │ Mês Início: [________]  Mês Fim: [_____] │ │
│ │ Funcionário: [____________________] 🔍    │ │
│ │ Status: [Todos os status ▼]              │ │
│ │                                           │ │
│ │ [ 📑 Gerar Relatório PDF ]               │ │
│ └───────────────────────────────────────────┘ │
│                                              │
│ ℹ️ Informações do Relatório                 │
│ ◆ Lista de faturas agrupadas por funcionário│
│ ◆ Subtotal por funcionário                  │
│ ◆ Total geral para desconto em folha        │
└──────────────────────────────────────────────┘
```

## 💡 Dicas Importantes

1. **Primeiro Acesso**: O menu Financeiro só aparece para Administradores
2. **Filtros**: Você pode deixar todos os filtros vazios exceto um
3. **Download**: O PDF vai para sua pasta de Downloads padrão
4. **Nomenclatura**: O arquivo será nomeado como `relatorio-faturas-[timestamp].pdf`
5. **Visualização**: Use Adobe Reader, Chrome ou outro leitor de PDF

## 🆘 Solução de Problemas

### Problema: Não vejo o menu "Financeiro"
**Causa**: Seu usuário não tem perfil de Administrador  
**Solução**: Entre em contato com o administrador do sistema

### Problema: Menu Financeiro não expande
**Causa**: JavaScript desabilitado ou erro no navegador  
**Solução**: Atualize a página (F5) ou limpe o cache

### Problema: Página não carrega
**Causa**: Servidor não está rodando  
**Solução**: Execute `pnpm dev` no terminal

### Problema: Não consigo fazer login
**Causa**: Credenciais incorretas ou sessão expirada  
**Solução**: Verifique usuário e senha ou faça logout e login novamente

## 📞 Suporte

Se ainda tiver dúvidas:
1. Consulte a documentação em `docs/RELATORIO_FATURAS.md`
2. Execute o script de teste em `docs/dados_teste_faturas.sql`
3. Contate o administrador do sistema

---

**Última atualização**: 30/09/2025  
**Versão**: 1.0.0
