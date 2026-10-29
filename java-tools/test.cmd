@echo off
setlocal
where javac >nul 2>nul
if errorlevel 1 (
    echo The Java compiler was not found. Install a JDK 17 or newer and reopen your terminal.
    exit /b 2
)
javac --release 17 -encoding UTF-8 -d "%~dp0out" "%~dp0src\QuestionBankTool.java" "%~dp0tests\QuestionBankToolTest.java"
if errorlevel 1 exit /b %errorlevel%
java -cp "%~dp0out" QuestionBankToolTest "%~dp0out\java-test-results.json"
exit /b %errorlevel%
