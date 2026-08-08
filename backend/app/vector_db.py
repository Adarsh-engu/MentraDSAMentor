import chromadb
from chromadb.config import Settings
import os
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any

CHROMA_URL = os.getenv("CHROMA_URL", "http://chroma:8000")
# Parse host and port
try:
    host = CHROMA_URL.split("://")[1].split(":")[0]
    port = int(CHROMA_URL.split(":")[-1])
except:
    host = "chroma"
    port = 8000

# Initialize ChromaDB client
chroma_client = chromadb.HttpClient(host=host, port=port, settings=Settings(allow_reset=True))

# Create or get collection
collection = chroma_client.get_or_create_collection(
    name="problems",
    metadata={"hnsw:space": "cosine"} # Use cosine similarity
)

# Initialize the embedding model locally
# This will download the model weights (only ~80MB) the first time it runs
model = SentenceTransformer('all-MiniLM-L6-v2')

def upsert_problem_embeddings(problems: List[Dict[str, Any]]):
    """
    problems: list of dicts with 'id', 'title', 'difficulty', 'platform'
    """
    if not problems:
        return
        
    ids = [str(p['id']) for p in problems]
    
    # We embed the problem title (we could also include the problem description if we had it)
    documents = [f"{p['title']} ({p.get('difficulty', '')})" for p in problems]
    
    # Generate embeddings
    embeddings = model.encode(documents).tolist()
    
    # Metadata for filtering
    metadatas = [
        {
            "title": p['title'],
            "difficulty": p.get('difficulty') or "unknown",
            "platform_id": str(p['platform_id'])
        } 
        for p in problems
    ]
    
    # Upsert into ChromaDB
    collection.upsert(
        ids=ids,
        embeddings=embeddings,
        metadatas=metadatas,
        documents=documents
    )

def search_similar_problems(problem_id: str, problem_title: str, n_results: int = 5):
    """
    Search for similar problems using a specific problem's title as the query.
    """
    # Embed the query
    query_embedding = model.encode([problem_title]).tolist()
    
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=n_results + 1 # +1 because it might return itself
    )
    
    similar_problems = []
    
    if results['ids'] and len(results['ids']) > 0:
        for i in range(len(results['ids'][0])):
            res_id = results['ids'][0][i]
            # Skip the problem itself
            if res_id == str(problem_id):
                continue
                
            similar_problems.append({
                "id": res_id,
                "document": results['documents'][0][i],
                "metadata": results['metadatas'][0][i],
                "distance": results['distances'][0][i]
            })
            
    # Return exactly n_results
    return similar_problems[:n_results]
