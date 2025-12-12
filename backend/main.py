from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import base64
import cv2
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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