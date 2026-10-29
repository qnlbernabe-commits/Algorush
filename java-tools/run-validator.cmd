@echo off
setlocal
where java >nul 2>nul
if errorlevel 1 (
    echo Java was not found. Install a JDK 17 or newer and reopen your terminal.
    exit /b 2
)
if "%~1"=="" (
    java -Dfile.encoding=UTF-8 --source 17 "%~dp0src\QuestionBankTool.java" --help
    exit /b 2
)
java -Dfile.encoding=UTF-8 --source 17 "%~dp0src\QuestionBankTool.java" --output "%~dp0reports" %*
exit /b %errorlevel%
