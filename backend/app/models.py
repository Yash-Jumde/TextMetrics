from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class TextAnalysis(Base):
    __tablename__ = "text_analysis"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, index=True)
    emotion_label = Column(String)
    emotion_confidence = Column(Float)
    gibberish_label = Column(String)
    gibberish_score = Column(Float)
