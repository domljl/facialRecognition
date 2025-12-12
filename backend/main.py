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


class ImagePayload(BaseModel):
    image: str


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