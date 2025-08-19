@echo off
REM Script para aplicar as mudanças do módulo financeiro no banco de dados
REM Execute este script na raiz do projeto

echo 🏦 Instalando Módulo de Contas a Pagar e Receber
echo ================================================

REM Verificar se o arquivo bancodados.sql existe
if not exist "bancodados.sql" (
    echo ❌ Erro: Arquivo bancodados.sql não encontrado
    pause
    exit /b 1
)

REM Verificar se as variáveis de ambiente estão definidas
if "%DB_HOST%"=="" (
    echo ⚠️  Variável DB_HOST não definida
    goto :show_env_help
)
if "%DB_USER%"=="" (
    echo ⚠️  Variável DB_USER não definida
    goto :show_env_help
)
if "%DB_PASSWORD%"=="" (
    echo ⚠️  Variável DB_PASSWORD não definida
    goto :show_env_help
)
if "%DB_NAME%"=="" (
    echo ⚠️  Variável DB_NAME não definida
    goto :show_env_help
)

echo 🔗 Conectando ao banco de dados...
echo    Host: %DB_HOST%
echo    Database: %DB_NAME%
echo    User: %DB_USER%

REM Aplicar as mudanças do banco
echo.
echo 📊 Aplicando estrutura do banco de dados...
mysql -h%DB_HOST% -u%DB_USER% -p%DB_PASSWORD% %DB_NAME% < bancodados.sql

if %errorlevel% equ 0 (
    echo ✅ Estrutura do banco aplicada com sucesso!
) else (
    echo ❌ Erro ao aplicar estrutura do banco
    pause
    exit /b 1
)

REM Aplicar dados de teste (opcional)
echo.
set /p aplicar_teste="🧪 Deseja aplicar dados de teste? (y/n): "

if /i "%aplicar_teste%"=="y" (
    if exist "teste-modulo-financeiro.sql" (
        echo 📋 Aplicando dados de teste...
        mysql -h%DB_HOST% -u%DB_USER% -p%DB_PASSWORD% %DB_NAME% < teste-modulo-financeiro.sql
        
        if %errorlevel% equ 0 (
            echo ✅ Dados de teste aplicados com sucesso!
        ) else (
            echo ❌ Erro ao aplicar dados de teste
        )
    ) else (
        echo ⚠️  Arquivo de teste não encontrado
    )
)

echo.
echo 🚀 Instalação do módulo financeiro concluída!
echo.
echo 📋 Funcionalidades disponíveis:
echo    • Dashboard financeiro
echo    • Contas a pagar
echo    • Contas a receber
echo    • Categorias financeiras
echo    • Controle de parcelas
echo    • Histórico de pagamentos/recebimentos
echo    • Relatórios e alertas
echo.
echo 🌐 Acesse: http://localhost:3000/dashboard/financeiro
echo.
echo 👤 Requisitos de acesso:
echo    • Perfil: ADMIN (para acesso completo)
echo    • Perfil: ESTOQUISTA (para cadastrar contas)
echo    • Perfil: ATENDENTE (para registrar pagamentos/recebimentos)
echo.
pause
exit /b 0

:show_env_help
echo ⚠️  Variáveis de ambiente do banco não definidas
echo 📝 Certifique-se de definir: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
echo.
echo 💡 Exemplo:
echo set DB_HOST=localhost
echo set DB_USER=root
echo set DB_PASSWORD=sua_senha
echo set DB_NAME=cantina_db
echo.
echo 🔧 Ou crie um arquivo .env na raiz do projeto
echo.
pause
exit /b 1
