import requests 
def create_embedding(text):
    r = requests.post("http://localhost:11434/api/embeddings", json={
        "model" : "bge-m3" ,
        "prompt" : "Harry is a good boy"
})

    embedding = r.json()['embedding']
    print(embedding[0:5])

a = create_embedding("Cat sat on the mat")
print(a)   