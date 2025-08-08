@echo off

REM ====== RASA CORE ======
start "RASA CORE" cmd /k "cd Chatbot && call .venv\Scripts\activate.bat && cd rasa-chatbot && rasa run --enable-api --cors=*"

REM ====== RASA ACTIONS ======
start "RASA ACTIONS" cmd /k "cd Chatbot && call .venv\Scripts\activate.bat && cd rasa-chatbot && rasa run actions"
