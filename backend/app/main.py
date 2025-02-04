from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import logging
import time
from typing import Dict
from sqlalchemy.orm import Session
from app.database import engine, Base, get_db
from app.models import TextAnalysis


Base.metadata.create_all(bind=engine)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Text Analysis API", version="1.0.0")

# Configure CORS (Allow all origins for testing; restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Check for CUDA availability
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
logger.info(f"Using device: {device}")

# Load models once (optimized)
try:
    logger.info("Loading emotion analysis model...")
    emotion_tokenizer = AutoTokenizer.from_pretrained("SamLowe/roberta-base-go_emotions")
    emotion_model = AutoModelForSequenceClassification.from_pretrained("SamLowe/roberta-base-go_emotions").to(device)

    logger.info("Loading gibberish detection model...")
    gibberish_tokenizer = AutoTokenizer.from_pretrained("wajidlinux99/gibberish-text-detector")
    gibberish_model = AutoModelForSequenceClassification.from_pretrained("wajidlinux99/gibberish-text-detector").to(device)

    logger.info("Models loaded successfully.")
except Exception as e:
    logger.error(f"Error loading models: {e}")
    raise RuntimeError(f"Failed to load models: {e}")

# Pydantic Model for API Request
class TextRequest(BaseModel):
    text: str

@app.post("/analyze")
async def analyze_text(request: TextRequest, db: Session = Depends(get_db)) -> Dict:
    """
    Analyzes input text for emotions and gibberish detection.
    Returns:
        - Emotion label and confidence score
        - Gibberish detection score
    """
    start_time = time.time()
    
    try:
        # Emotion Analysis
        emotion_inputs = emotion_tokenizer(request.text, return_tensors="pt", truncation=True, max_length=512).to(device)
        with torch.no_grad():
            emotion_outputs = emotion_model(**emotion_inputs)
        emotion_probs = torch.softmax(emotion_outputs.logits, dim=1)
        emotion_prediction = emotion_probs.argmax().item()
        emotion_score = emotion_probs.max().item()
        
        emotion_label = emotion_model.config.id2label.get(emotion_prediction, "Unknown")

        # Gibberish Analysis
        gibberish_inputs = gibberish_tokenizer(request.text, return_tensors="pt", truncation=True, max_length=512).to(device)
        with torch.no_grad():
            gibberish_outputs = gibberish_model(**gibberish_inputs)
        gibberish_result = gibberish_model.config.id2label[gibberish_outputs.logits.argmax().item()]
        gibberish_score = torch.softmax(gibberish_outputs.logits, dim=1).max().item()

        db_entry = TextAnalysis(
            text=request.text,
            emotion_label=emotion_label,
            emotion_confidence=round(emotion_score, 4),
            gibberish_label=gibberish_result,
            gibberish_score=round(gibberish_score, 4)
        )
        db.add(db_entry)
        db.commit()
        db.refresh(db_entry)

        # Log processing time
        logger.info(f"Processed request in {time.time() - start_time:.3f} seconds")

        return {
            "emotion": {
                "label": emotion_label,
                "confidence": round(float(emotion_score), 4)
            },
            "gibberish": {
                "label": gibberish_result,
                "score": round(float(gibberish_score), 4)
            }
        }
    except Exception as e:
        logger.error(f"Error processing text: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete/{entry_id}")
async def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    """
    Deletes an entry from the database based on the provided ID.
    """
    entry = db.query(TextAnalysis).filter(TextAnalysis.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    db.delete(entry)
    db.commit()
    return {"message": "Entry deleted successfully"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/entries/{entry_id}")
async def get_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(TextAnalysis).filter(TextAnalysis.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry

@app.get("/entries/")
async def list_entries(db: Session = Depends(get_db)):
    entries = db.query(TextAnalysis).all()
    return entries
