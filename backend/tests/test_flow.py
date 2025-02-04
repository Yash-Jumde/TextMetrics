import sys
import os
# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
from app.database import get_db
from app.models import TextAnalysis
from sqlalchemy import desc

def test_text_analysis_flow(input_text: str, api_url: str = "http://localhost:8000"):
    """
    Tests the complete flow of text analysis:
    1. Sends text to the API
    2. Gets the API response
    3. Verifies the database entry
    
    Args:
        input_text: The text to analyze
        api_url: The base URL of your FastAPI application
    """
    print("\n=== Testing Text Analysis Flow ===")
    print(f"Input text: {input_text}")
    
    # Step 1: Send request to API
    print("\n1. Sending request to API...")
    response = requests.post(
        f"{api_url}/analyze",
        json={"text": input_text}
    )
    
    # Print API response
    print("\n2. API Response:")
    api_result = response.json()
    print(f"Status Code: {response.status_code}")
    print(f"Emotion: {api_result['emotion']['label']} (confidence: {api_result['emotion']['confidence']})")
    print(f"Gibberish Score: {api_result['gibberish']['score']}")
    
    # Step 3: Verify database entry
    print("\n3. Verifying database entry...")
    db = next(get_db())
    try:
        # Get the most recent entry
        latest_entry = db.query(TextAnalysis)\
            .order_by(desc(TextAnalysis.id))\
            .first()
        
        if latest_entry and latest_entry.text == input_text:
            print("\nDatabase Entry Found:")
            print(f"Text: {latest_entry.text}")
            print(f"Emotion Label: {latest_entry.emotion_label}")
            print(f"Emotion Confidence: {latest_entry.emotion_confidence}")
            print(f"Gibberish Score: {latest_entry.gibberish_score}")
            
            # Verify that DB entry matches API response
            print("\nVerifying API response matches database entry:")
            matches = {
                "Text matches": latest_entry.text == input_text,
                "Emotion label matches": latest_entry.emotion_label == api_result['emotion']['label'],
                "Emotion confidence matches": abs(latest_entry.emotion_confidence - api_result['emotion']['confidence']) < 0.0001,
                "Gibberish score matches": abs(latest_entry.gibberish_score - api_result['gibberish']['score']) < 0.0001
            }
            
            for check, result in matches.items():
                print(f"{check}: {'✓' if result else '✗'}")
                
            all_matched = all(matches.values())
            print(f"\nOverall verification: {'✓ Successful' if all_matched else '✗ Failed'}")
            
        else:
            print("❌ Error: Latest database entry doesn't match input text!")
            
    finally:
        db.close()

if __name__ == "__main__":
    # Example usage
    test_text = "I am feeling very happy today!"
    test_text_analysis_flow(test_text)