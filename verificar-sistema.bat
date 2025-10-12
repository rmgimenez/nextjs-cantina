@echo off
echo ========================================
echo   Sistema de Cantina - Verificacao
echo ========================================
echo.

REM Verifica se o arquivo .env.local existe
if not exist ".env.local" (
    echo [ERRO] Arquivo .env.local nao encontrado!
    echo.
    echo Crie o arquivo .env.local com o seguinte conteudo:
    echo.
    echo MYSQL_HOST=localhost
    echo MYSQL_USER=root
    echo MYSQL_PASSWORD=sua_senha
    echo MYSQL_DATABASE=sant31br
    echo JWT_SECRET=seu_secret_aqui
    echo.
    pause
    exit /b 1
)

echo [OK] Arquivo .env.local encontrado
echo.

REM Verifica se o MySQL está rodando
sc query MySQL80 | find "RUNNING" >nul
if errorlevel 1 (
    echo [AVISO] MySQL pode nao estar rodando
    echo Execute: sc start MySQL80
    echo.
) else (
    echo [OK] MySQL esta rodando
    echo.
)

REM Pergunta se quer executar o SQL
echo Deseja executar o script SQL? (S/N)
set /p execute_sql=

if /i "%execute_sql%"=="S" (
    echo.
    echo Executando bancodados.sql...
    echo Digite a senha do MySQL quando solicitado:
    mysql -u root -p sant31br < bancodados.sql
    
    if errorlevel 1 (
        echo.
        echo [ERRO] Falha ao executar SQL
        echo Verifique se:
        echo 1. O MySQL esta instalado e rodando
        echo 2. A senha esta correta
        echo 3. O database 'sant31br' existe
        echo.
        pause
        exit /b 1
    ) else (
        echo.
        echo [OK] Script SQL executado com sucesso!
    )
)

echo.
echo ========================================
echo   Verificacao concluida!
echo ========================================
echo.
echo Acesse http://localhost:3001/diagnostico
echo para verificar o status completo do sistema
echo.
pause
