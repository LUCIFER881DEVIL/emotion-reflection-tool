# server/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace * with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class ReflectionInput(BaseModel):
    text: str

# Smart keyword-based emotion logic
@app.post("/analyze")
async def analyze_emotion(input_data: ReflectionInput):
    text = input_data.text.lower()

    if any(word in text for word in ["nervous", "worried", "anxious", "tense", "scared"]):
        emotion = "Anxious"
        confidence = 0.87
    elif any(word in text for word in ["happy", "excited", "joy", "delighted", "great"]):
        emotion = "Happy"
        confidence = 0.92
    elif any(word in text for word in ["sad", "upset", "cry", "lonely", "depressed"]):
        emotion = "Sad"
        confidence = 0.88
    elif any(word in text for word in ["angry", "frustrated", "mad", "irritated"]):
        emotion = "Angry"
        confidence = 0.86
    else:
        emotion = "Neutral"
        confidence = 0.70

    return {
        "emotion": emotion,
        "confidence": confidence
    }
