# Facial Recognition

A full-stack facial recognition application with a FastAPI backend and React frontend.

## Project Structure

```
facialRecognition/
├── backend/          # FastAPI backend server
│   ├── main.py      # API endpoints
│   ├── requirements.txt
│   └── venv/        # Python virtual environment
└── frontend/        # React + Vite frontend
    ├── src/
    ├── public/
    └── package.json
```

## Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## Development

### Backend
- API documentation: `http://localhost:8000/docs` (Swagger UI)
- Alternative docs: `http://localhost:8000/redoc` (ReDoc)

### Frontend
- Built with React 19 and Vite
- Hot Module Replacement (HMR) enabled
- ESLint configured for code quality

## Building for Production

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## License

MIT
