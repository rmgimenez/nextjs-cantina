# Correção do Erro "Erro interno do servidor" no Dashboard

## Problema Original

O dashboard estava exibindo erro "Erro interno do servidor" ao tentar carregar os dados, causando falha no carregamento da página inicial.

## Causa Raiz

O erro ocorria quando:

1. As views do banco de dados não estavam criadas (`vw_cant_estoque_alertas`)
2. A conexão com o banco de dados falhava
3. Erros SQL não eram tratados adequadamente

## Soluções Implementadas

### 1. Tratamento de Erros Melhorado na API (`/api/dashboard/geral`)

**Arquivo:** `app/api/dashboard/geral/route.ts`

- ✅ Adicionado teste de conexão inicial
- ✅ Implementado fallback para queries que usam views
- ✅ Mensagens de erro mais descritivas
- ✅ Tratamento individual de cada query crítica

```typescript
// Exemplo: fallback quando view não existe
try {
  // Tenta usar a view
  const alertas = await query("SELECT ... FROM vw_cant_estoque_alertas ...");
} catch (viewError) {
  // Fallback: usa query sem view
  const alertas = await query(
    "SELECT ... FROM cant_estoque JOIN cant_produtos ..."
  );
}
```

### 2. Mensagens de Erro Amigáveis no Frontend

**Arquivo:** `app/page.tsx`

- ✅ Exibição detalhada do erro
- ✅ Instruções de solução passo a passo
- ✅ Link direto para página de diagnóstico
- ✅ Logging melhorado no console

### 3. Página de Diagnóstico do Sistema

**Arquivo:** `app/diagnostico/page.tsx`
**API:** `app/api/system/check-views/route.ts`

Nova funcionalidade: `/diagnostico`

Verifica:

- ✅ Conexão com banco de dados
- ✅ Existência de todas as views necessárias
- ✅ Configuração do ambiente
- ✅ Fornece comandos específicos para correção

### 4. Script Helper para Windows

**Arquivo:** `verificar-sistema.bat`

Script que:

- ✅ Verifica existência do `.env.local`
- ✅ Verifica se MySQL está rodando
- ✅ Oferece executar o SQL automaticamente
- ✅ Direciona para `/diagnostico`

### 5. Documentação Completa

**Arquivos criados:**

- `SETUP.md` - Guia completo de configuração inicial
- `docs/TROUBLESHOOTING_DASHBOARD.md` - Solução de problemas específicos
- Atualizações no `README.md`

## Como Usar

### Se o erro aparecer novamente:

1. **Primeira opção - Página de Diagnóstico:**

   ```
   http://localhost:3001/diagnostico
   ```

2. **Segunda opção - Script Helper (Windows):**

   ```cmd
   verificar-sistema.bat
   ```

3. **Terceira opção - Manual:**
   ```bash
   mysql -u root -p sant31br < bancodados.sql
   ```

## Views Necessárias

O sistema precisa destas views (criadas pelo `bancodados.sql`):

- `vw_cant_vendas_completa`
- `vw_cant_estoque_alertas`
- `vw_cant_contas_alunos_completa`
- `vw_cant_vendas_funcionarios`
- `vw_cant_contas_funcionarios`

## Arquivos Modificados

### Novos Arquivos

- `app/diagnostico/page.tsx`
- `app/api/system/check-views/route.ts`
- `docs/TROUBLESHOOTING_DASHBOARD.md`
- `SETUP.md`
- `verificar-sistema.bat`

### Arquivos Alterados

- `app/api/dashboard/geral/route.ts` - Tratamento robusto de erros
- `app/page.tsx` - Mensagens de erro melhoradas
- `README.md` - Links para documentação

## Testes Realizados

✅ Dashboard carrega com views ausentes (usa fallback)
✅ Dashboard carrega com banco conectado normalmente
✅ Mensagens de erro são claras e informativas
✅ Página de diagnóstico detecta problemas
✅ Script helper funciona no Windows

## Próximas Melhorias Sugeridas

1. Adicionar health check endpoint (`/api/health`)
2. Implementar retry automático em falhas temporárias
3. Cache de dados não críticos
4. Monitoramento de performance das queries
5. Logs estruturados para debugging

## Referências

- [SETUP.md](../SETUP.md) - Configuração inicial
- [TROUBLESHOOTING_DASHBOARD.md](./TROUBLESHOOTING_DASHBOARD.md) - Solução de problemas
- [README.md](../README.md) - Documentação principal
