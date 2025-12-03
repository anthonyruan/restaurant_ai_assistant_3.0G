# Restaurant AI Assistant 3.0 - Walkthrough

## Overview
The project has been refactored into a modern **React + Flask** architecture.
- **Backend**: Flask REST API (`app/`)
- **Frontend**: React + Vite SPA (`frontend/`)

## How to Run

### 1. Backend (Flask API)
Open a terminal in the root directory:

```bash
# Install dependencies (if not already done)
poetry install
# OR
pip install -r requirements.txt  # (You might need to generate this if not using poetry)

# Run the server
python run.py
```
The API will start at `http://127.0.0.1:5000`.

### 2. Frontend (React App)
Open a **new** terminal window and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```
The application will start at `http://localhost:5173`.

## Features
- **Modern UI**: Clean, responsive interface built with TailwindCSS.
- **Real-time Interaction**: Instant switching between Sales, Weather, and Holiday modes.
- **Live Editing**: Edit captions directly before posting.
- **Modular Code**: Backend logic is split into services for better maintainability.
