# 🤖 RAG-Based AI — Video Course Assistant

A **Retrieval-Augmented Generation (RAG)** pipeline that lets users ask natural language questions about a video course and get precise, timestamped answers pointing to the exact video and moment where a topic is taught.

Built as a local-first system using **Ollama** for embeddings & LLM inference, **OpenAI Whisper** for speech-to-text transcription, and a beautiful **web UI** powered by FastAPI.

---

## 📌 Overview

This project processes YouTube course videos (currently the **Sigma Web Development Course**) through a multi-stage pipeline:

1. **Audio Extraction** — Video files are converted to MP3 audio.
2. **Speech-to-Text** — Audio is transcribed and translated using OpenAI Whisper, producing timestamped subtitle chunks.
3. **Chunking** — Transcriptions are split into meaningful chunks stored as JSON files with metadata (title, video number, start/end timestamps, text).
4. **Embedding Generation** — Each chunk is embedded using the `bge-m3` model via Ollama, then stored in a serialized DataFrame (`embeddings.joblib`).
5. **Query & Retrieval** — User queries are embedded, compared via cosine similarity against all chunks, and the top-k results are passed as context to an LLM (`llama3.2`) to generate a human-readable, timestamped answer.

---

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│  Video Files │────▶│  MP3 Audios  │────▶│  Whisper (STT)   │
│  (YouTube)   │     │  /audios/    │     │  stt.py          │
└──────────────┘     └──────────────┘     └────────┬─────────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │  JSON Chunks     │
                                          │  /jsons/         │
                                          └────────┬─────────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │  Embeddings      │
                                          │  (bge-m3 model)  │
                                          │  3_read_chunks.py│
                                          └────────┬─────────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │  embeddings      │
                                          │  .joblib         │
                                          └────────┬─────────┘
                                                   │
                    ┌──────────────────┐            │
                    │  Web UI (HTML/   │            │
                    │  CSS/JS)         │            │
                    └────────┬─────────┘            │
                             │                     │
                             ▼                     │
                    ┌──────────────────┐            │
                    │  FastAPI Backend │────────────▶
                    │  (app.py)        │            │
                    └────────┬─────────┘            │
                             │    User Query ──────▶│
                             │                     ▼
                             │            ┌──────────────────┐
                             │            │  Cosine          │
                             │            │  Similarity +    │
                             │            │  LLM Inference   │
                             │            │  (llama3.2)      │
                             │            └────────┬─────────┘
                             │                     │
                             ▼                     ▼
                    ┌──────────────────────────────────────┐
                    │  Timestamped Answer + Source Chunks  │
                    └─────────────────────────────────────-┘
```

---

## 📂 Project Structure

```
Rag_Based_AI/
│
├── static/                          # Web frontend
│   ├── index.html                   #   Main HTML page — chat UI with suggestion chips
│   ├── style.css                    #   Dark theme design system with glassmorphism & animations
│   └── script.js                    #   Chat logic, query handling & source card rendering
│
├── app.py                           # FastAPI backend — serves UI & exposes /api/query endpoint
│
├── audios/                          # MP3 audio files extracted from course videos
├── jsons/                           # Timestamped subtitle chunks (JSON per video)
├── Videos/                          # Raw video/audio source files
│
├── stt.py                           # Speech-to-Text using OpenAI Whisper
├── create_chunks.ipynb              # Jupyter notebook — transcription & chunking pipeline
├── create_chunks_2.ipynb            # Jupyter notebook — alternate chunking approach
├── 3_read_chunks.py                 # Generate embeddings from JSON chunks → embeddings.joblib
├── process_incoming.py              # CLI query pipeline — embed query, retrieve, LLM answer
├── process_video.py                 # Utility to parse video filenames & extract metadata
├── rename_mp3.py                    # Batch rename MP3 files with sequential numbering
├── example_read_chunks.py           # Minimal example of Ollama embedding API usage
│
├── embeddings.joblib                # Serialized DataFrame with chunk texts + embeddings
├── prompt.txt                       # Last generated LLM prompt (for debugging)
├── response.txt                     # Last generated LLM response (for debugging)
└── README.md                        # You are here
```

---

## ⚙️ Tech Stack

| Component          | Technology                                                     |
| ------------------- | -------------------------------------------------------------- |
| **Frontend**        | HTML, CSS (glassmorphism dark theme), Vanilla JavaScript        |
| **Backend**         | [FastAPI](https://fastapi.tiangolo.com/) + Uvicorn              |
| **LLM Inference**   | [Ollama](https://ollama.com/) — `llama3.2`                     |
| **Embeddings**      | [Ollama](https://ollama.com/) — `bge-m3`                       |
| **Speech-to-Text**  | [OpenAI Whisper](https://github.com/openai/whisper) — `base`   |
| **Similarity**      | Cosine Similarity via `scikit-learn`                            |
| **Data Handling**   | `pandas`, `numpy`, `joblib`                                     |
| **Language**        | Python 3.x                                                      |

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.8+**
- **[Ollama](https://ollama.com/)** installed and running locally
- Required Ollama models pulled:
  ```bash
  ollama pull bge-m3
  ollama pull llama3.2
  ```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ayush-Das-9/Rag_Based_AI.git
   cd Rag_Based_AI
   ```

2. **Install Python dependencies**
   ```bash
   pip install pandas numpy scikit-learn joblib requests openai-whisper fastapi uvicorn python-multipart
   ```

3. **Start Ollama** (if not already running)
   ```bash
   ollama serve
   ```

---

## 📖 Usage

### Step 1 — Transcribe Videos (if starting from scratch)

Place your course video MP3 files in the `audios/` directory, then run:

```bash
python stt.py
```

Or use the Jupyter notebooks (`create_chunks.ipynb` / `create_chunks_2.ipynb`) for the full transcription and chunking pipeline. This generates JSON files in `jsons/`.

### Step 2 — Generate Embeddings

```bash
python 3_read_chunks.py
```

This reads all JSON chunk files, generates embeddings via Ollama's `bge-m3` model, and saves the result to `embeddings.joblib`.

### Step 3 — Launch the Web UI

```bash
python -m uvicorn app:app --reload --port 8000
```

Open **http://localhost:8000** in your browser. The web interface provides:
- 💬 A **chat interface** to ask questions in natural language
- 📌 **Suggestion chips** for quick-start queries
- 🎯 **Source cards** showing matched video chunks with timestamps and similarity scores
- 🟢 **Live status badge** indicating whether Ollama is online

**Example:**

```
You: Where is flexbox taught?

CourseAI: You can find the content related to Flexbox in Video 13 of our course.
          Specifically, it's at around 331 seconds into that video where we dive
          into the world of Flexbox and Grid...

          📎 Source Chunks (5):
             Video #13 — Entities, Code tag and more on HTML  |  ⏱ 5:31 – 5:32  |  98%
             Video #11 — CSS Box Model                        |  ⏱ 16:01 – 16:03 |  93%
             ...
```

> **Alternative (CLI mode):** You can still use the original command-line interface by running `python process_incoming.py`.

---

## 📊 How It Works

```mermaid
flowchart LR
    A[User Query] --> B[Embed Query<br>bge-m3]
    B --> C[Cosine Similarity<br>vs all chunks]
    C --> D[Top 5 Chunks]
    D --> E[Build Prompt<br>with context]
    E --> F[LLM Inference<br>llama3.2]
    F --> G[Timestamped<br>Answer]
```

1. **Embedding** — The user's question is converted to a vector using `bge-m3`.
2. **Retrieval** — Cosine similarity is computed against all pre-computed chunk embeddings.
3. **Augmented Generation** — The top-5 most relevant chunks (with video title, number, timestamps, and text) are injected into a prompt template.
4. **Response** — The LLM generates a conversational answer directing the user to the specific video and timestamp.

---

## 🗃️ Data Format

Each JSON file in `jsons/` follows this structure:

```json
{
  "chunks": [
    {
      "title": "Your First HTML Website  Sigma Web Development Course",
      "number": "1",
      "start": 0.0,
      "end": 5.2,
      "text": "Welcome to the Sigma web development course..."
    }
  ]
}
```

---


