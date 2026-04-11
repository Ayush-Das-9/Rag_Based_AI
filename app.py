from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import joblib
import requests
import json
import os

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load embeddings once at startup
df = joblib.load('embeddings.joblib')


def create_embedding(text_list):
    r = requests.post("http://localhost:11434/api/embed", json={
        "model": "bge-m3",
        "input": text_list
    })
    embedding = r.json()["embeddings"]
    return embedding


def inference(prompt):
    r = requests.post("http://localhost:11434/api/generate", json={
        "model": "llama3.2",
        "prompt": prompt,
        "stream": False
    })
    response = r.json()
    return response


@app.post("/api/query")
async def query(request: Request):
    try:
        body = await request.json()
        incoming_query = body.get("question", "")

        if not incoming_query.strip():
            return JSONResponse(
                status_code=400,
                content={"error": "Question cannot be empty"}
            )

        # Embed the question
        question_embedding = create_embedding([incoming_query])[0]

        # Find similarities
        similarities = cosine_similarity(
            np.vstack(df['embedding']),
            [question_embedding]
        ).flatten()

        top_results = 5
        max_indx = similarities.argsort()[::-1][0:top_results]
        new_df = df.loc[max_indx]

        # Build the prompt
        prompt = f'''I am teaching web development in my Sigma web development course. Here are video subtitle chunks containing video title, video number, start time in seconds, end time in seconds, the text at that time:

{new_df[["title", "number", "start", "end", "text"]].to_json(orient="records")}
---------------------------------
"{incoming_query}"
User asked this question related to the video chunks, you have to answer in a human way (dont mention the above format, its just for you) where and how much content is taught in which video (in which video and at what timestamp) and guide the user to go to that particular video. If user asks unrelated question, tell him that you can only answer questions related to the course
'''

        # Get LLM response
        response = inference(prompt)["response"]

        # Extract source chunks for the frontend
        sources = []
        for _, row in new_df.iterrows():
            sources.append({
                "title": row["title"],
                "number": str(row["number"]),
                "start": float(row["start"]),
                "end": float(row["end"]),
                "text": row["text"],
                "similarity": float(similarities[row.name])
            })

        return JSONResponse(content={
            "answer": response,
            "sources": sources,
            "query": incoming_query
        })

    except requests.exceptions.ConnectionError:
        return JSONResponse(
            status_code=503,
            content={"error": "Cannot connect to Ollama. Make sure Ollama is running on localhost:11434"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


# Serve static files
app.mount("/", StaticFiles(directory="static", html=True), name="static")
