from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import base64
import cv2
import numpy as np
import face_recognition

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

stored_embedding = None

class ImagePayload(BaseModel):
    image: str
    
class ImagesPayload(BaseModel):
    images: list[str]

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

    return {
        "message": "One face detected",
        "face_location": face_locations[0]
    }
    
@app.post("/register-face")
def register_face(payload: ImagesPayload):
    global stored_embedding

    centers = []
    embeddings = []

    for img_data in payload.images:
        image = decode_base64_image(img_data)
        if image is None:
            continue

        rgb = to_rgb(image)
        locations = face_recognition.face_locations(rgb)

        if len(locations) != 1:
            return {"error": "Exactly one face required"}

        centers.append(face_center(locations[0]))

        enc = face_recognition.face_encodings(rgb, locations)
        embeddings.append(enc[0])

    if len(centers) < 2:
        return {"error": "Liveness check failed"}

    movement = abs(centers[0][0] - centers[-1][0])

    if movement < 15:
        return {"error": "Please move your head"}

    stored_embedding = embeddings[0]
    return {"message": "Face registered with liveness check"}

@app.post("/login-face")
def login_face(payload: ImagePayload):
    if stored_embedding is None:
        return {"error": "No face registered"}

    image = decode_base64_image(payload.image)
    if image is None:
        return {"error": "Invalid image"}

    rgb_image = to_rgb(image)

    encodings = face_recognition.face_encodings(rgb_image)

    if len(encodings) != 1:
        return {"error": "Exactly one face required"}

    login_embedding = encodings[0]

    distance = face_recognition.face_distance(
        [stored_embedding], login_embedding
    )[0]

    return {
        "distance": float(distance),
        "success": distance < 0.5
    }