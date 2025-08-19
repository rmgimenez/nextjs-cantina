#!/bin/bash

# Script para aplicar as mudanças do módulo financeiro no banco de dados
# Execute este script na raiz do projeto

echo "🏦 Instalando Módulo de Contas a Pagar e Receber"
echo "================================================"

# Verificar se o arquivo bancodados.sql existe
if [ ! -f "bancodados.sql" ]; then
    echo "❌ Erro: Arquivo bancodados.sql não encontrado"
    exit 1
fi

# Verificar se as variáveis de ambiente estão definidas
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    echo "⚠️  Variáveis de ambiente do banco não definidas"
    echo "📝 Certifique-se de definir: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME"
    echo ""
    echo "💡 Exemplo:"
    echo "export DB_HOST=localhost"
    echo "export DB_USER=root"
    echo "export DB_PASSWORD=sua_senha"
    echo "export DB_NAME=cantina_db"
    echo ""
    exit 1
fi

echo "🔗 Conectando ao banco de dados..."
echo "   Host: $DB_HOST"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"

# Aplicar as mudanças do banco
echo ""
echo "📊 Aplicando estrutura do banco de dados..."
mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < bancodados.sql

if [ $? -eq 0 ]; then
    echo "✅ Estrutura do banco aplicada com sucesso!"
else
    echo "❌ Erro ao aplicar estrutura do banco"
    exit 1
fi

# Aplicar dados de teste (opcional)
echo ""
echo "🧪 Deseja aplicar dados de teste? (y/n)"
read -r aplicar_teste

if [ "$aplicar_teste" = "y" ] || [ "$aplicar_teste" = "Y" ]; then
    if [ -f "teste-modulo-financeiro.sql" ]; then
        echo "📋 Aplicando dados de teste..."
        mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < teste-modulo-financeiro.sql
        
        if [ $? -eq 0 ]; then
            echo "✅ Dados de teste aplicados com sucesso!"
        else
            echo "❌ Erro ao aplicar dados de teste"
        fi
    else
        echo "⚠️  Arquivo de teste não encontrado"
    fi
fi

echo ""
echo "🚀 Instalação do módulo financeiro concluída!"
echo ""
echo "📋 Funcionalidades disponíveis:"
echo "   • Dashboard financeiro"
echo "   • Contas a pagar"
echo "   • Contas a receber" 
echo "   • Categorias financeiras"
echo "   • Controle de parcelas"
echo "   • Histórico de pagamentos/recebimentos"
echo "   • Relatórios e alertas"
echo ""
echo "🌐 Acesse: http://localhost:3000/dashboard/financeiro"
echo ""
echo "👤 Requisitos de acesso:"
echo "   • Perfil: ADMIN (para acesso completo)"
echo "   • Perfil: ESTOQUISTA (para cadastrar contas)"
echo "   • Perfil: ATENDENTE (para registrar pagamentos/recebimentos)"
