# Facial Recognition

Multi-user face + password authentication with a FastAPI backend and React/Vite frontend. Users can register with username/password and a webcam capture, then login with either face or password. Tokens are JWTs stored client-side.

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

### Notes
- Depends on `dlib`/`face_recognition` and OpenCV; ensure system packages for these are present if building outside the provided venv.
- CORS allows `http://localhost:5173` and `http://localhost:3000` (and 127.0.0.1 equivalents).
- JWT secret can be set via `SECRET_KEY` env var (defaults to a dev key).

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
- API docs: `http://localhost:8000/docs`
- Key endpoints:
  - `POST /register` — body: `{ username, password, images[] }` (base64 data URLs). Saves user with hashed password + face embedding; returns JWT.
  - `POST /login-password` — body: `{ username, password }`; returns JWT.
  - `POST /login-face` — body: `{ username, images[] }`; matches first valid embedding; returns JWT and match distance.
  - `GET /me` — bearer token; returns current user.

### Frontend
- React 19 + Vite + React Router.
- Face capture mirrors webcam preview; sends multiple frames for robustness.
- Auth token stored in `localStorage`; logout clears it.

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
