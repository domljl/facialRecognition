from datetime import datetime, timedelta
import base64
import json
import os
from typing import Optional

import cv2
import face_recognition
import numpy as np
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Text, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./users.db"
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login-password")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------
# Database models
# --------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    face_embedding = Column(Text, nullable=True)  # JSON-encoded list


Base.metadata.create_all(bind=engine)


# --------------------
# Pydantic models
# --------------------
class ImagePayload(BaseModel):
    image: str


class ImagesPayload(BaseModel):
    images: list[str]


class RegisterRequest(BaseModel):
    username: str
    password: str
    images: list[str]


class LoginPasswordRequest(BaseModel):
    username: str
    password: str


class LoginFaceRequest(BaseModel):
    username: str
    images: list[str]


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --------------------
# Helpers
# --------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_base64_image(data_url: str):
    try:
        if "," not in data_url:
            return None

        _, encoded = data_url.split(",", 1)
        image_bytes = base64.b64decode(encoded)
        np_array = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
        return image
    except Exception:
        return None


def to_rgb(image):
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)


def face_center(face_location):
    top, right, bottom, left = face_location
    return ((left + right) / 2, (top + bottom) / 2)


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user


# --------------------
# Routes
# --------------------
@app.get("/")
def health():
    return {"status": "ok"}


@app.post("/debug-image")
def debug_image(payload: ImagePayload):
    image = decode_base64_image(payload.image)

    if image is None:
        return {"error": "Image decode failed"}

    h, w, _ = image.shape
    return {"width": w, "height": h}


@app.post("/detect-face")
def detect_face(payload: ImagePayload):
    image = decode_base64_image(payload.image)

    if image is None:
        return {"error": "Invalid image"}

    rgb_image = to_rgb(image)

    face_locations = face_recognition.face_locations(rgb_image)

    face_count = len(face_locations)

    if face_count == 0:
        return {"error": "No face detected"}

    if face_count > 1:
        return {"error": "Multiple faces detected"}

    return {"message": "One face detected", "face_location": face_locations[0]}


@app.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    embeddings = []

    for img_data in payload.images:
        image = decode_base64_image(img_data)
        if image is None:
            continue

        rgb = to_rgb(image)
        locations = face_recognition.face_locations(rgb)

        if len(locations) != 1:
            continue

        enc = face_recognition.face_encodings(rgb, locations)
        if len(enc) != 1:
            continue

        embeddings.append(enc[0])

    if not embeddings:
        raise HTTPException(status_code=400, detail="No valid face found")

    face_embedding = json.dumps(embeddings[0].tolist())

    user = User(
        username=payload.username,
        password_hash=get_password_hash(payload.password),
        face_embedding=face_embedding,
    )
    db.add(user)
    db.commit()

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


@app.post("/login-password", response_model=TokenResponse)
def login_password(payload: LoginPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


@app.post("/login-face")
def login_face(payload: LoginFaceRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()
    if user is None or user.face_embedding is None:
        return {"error": "User not found or no face registered"}

    embeddings = []

    for img_data in payload.images:
        image = decode_base64_image(img_data)
        if image is None:
            continue

        rgb_image = to_rgb(image)
        face_locations = face_recognition.face_locations(rgb_image)

        if len(face_locations) != 1:
            continue

        encodings = face_recognition.face_encodings(rgb_image, face_locations)
        if len(encodings) != 1:
            continue

        embeddings.append(encodings[0])

    if not embeddings:
        return {"error": "No valid face found"}

    stored = np.array(json.loads(user.face_embedding))

    distances = [
        float(face_recognition.face_distance([stored], emb)[0]) for emb in embeddings
    ]
    best_distance = min(distances)
    success = best_distance < 0.5

    if not success:
        return {"success": False, "distance": best_distance}

    token = create_access_token({"sub": user.username})
    return {
        "success": True,
        "distance": best_distance,
        "access_token": token,
        "token_type": "bearer",
    }


@app.get("/me")
def read_me(current_user: User = Depends(get_current_user)):
    return {"username": current_user.username}