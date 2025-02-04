# TextMetrics API

## Build Instructions

### Prerequisites
- Docker
- Docker Compose

### Steps
1. Clone the repository
```bash
git clone https://github.com/Yash-Jumde/TextMetrics.git
cd TextMetrics
```

2. Build and start the services
```bash
docker-compose up --build
```

3. The API will be available at `http://localhost:8000`

## API Endpoints

### 1. Text Analysis
- **Endpoint**: `POST /analyze`
- **Description**: Analyze text for emotions and gibberish detection
- **Request Body**:
```json
{
  "text": "Your text to analyze"
}
```
- **Example**:
```bash
curl -X POST http://localhost:8000/analyze \
     -H "Content-Type: application/json" \
     -d '{"text":"Hello world!"}'
```

### 2. Get Specific Entry
- **Endpoint**: `GET /entries/{entry_id}`
- **Description**: Retrieve a specific analysis entry
- **Example**:
```bash
curl http://localhost:8000/entries/1
```

### 3. List All Entries
- **Endpoint**: `GET /entries/`
- **Description**: List all analysis entries
- **Example**:
```bash
curl http://localhost:8000/entries/
```

### 4. Delete Entry
- **Endpoint**: `DELETE /delete/{entry_id}`
- **Description**: Delete a specific analysis entry
- **Example**:
```bash
curl -X DELETE http://localhost:8000/delete/1
```

### 5. Health Check
- **Endpoint**: `GET /health`
- **Description**: Check API health status
- **Example**:
```bash
curl http://localhost:8000/health
```

## Response Example
```json
{
  "emotion": {
    "label": "joy",
    "confidence": 0.8765
  },
  "gibberish": {
    "label": "not_gibberish", 
    "score": 0.9234
  }
}
```
