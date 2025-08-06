@echo off
REM ====== BACKEND ======
start "BACKEND" cmd /k "cd Backend && npm run start:prod"

REM ====== FRONTEND - CUSTOMER ======
start "FRONTEND CUSTOMER" cmd /k "cd FrontEnd\Customer && npm run start"

REM ====== FRONTEND - STAFF ======
start "FRONTEND STAFF" cmd /k "cd FrontEnd\Staff && npm run start"

REM ====== RASA CORE ======
start "RASA CORE" cmd /k "cd Chatbot && call .venv\Scripts\activate.bat && cd rasa-chatbot && rasa run --enable-api --cors=*"

REM ====== RASA ACTIONS ======
start "RASA ACTIONS" cmd /k "cd Chatbot && call .venv\Scripts\activate.bat && cd rasa-chatbot && rasa run actions"
