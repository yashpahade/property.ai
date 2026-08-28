import chromadb
from chromadb.utils import embedding_functions
import sqlite3
import os
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_PATH = 'props.db'
CHROMA_DIR = './chroma_db'
COLLECTION_NAME = 'properties_collection'

class VectorDBManager:
    def __init__(self):
        # Initialize persistent chroma client
        os.makedirs(CHROMA_DIR, exist_ok=True)
        self.client = chromadb.PersistentClient(path=CHROMA_DIR)
        
        # Use sentence-transformers
        self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
        
        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            embedding_function=self.embedding_function
        )

    def load_properties_from_sqlite(self):
        if not os.path.exists(DB_PATH):
            logger.error(f"SQLite DB {DB_PATH} not found.")
            return

        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM properties")
        rows = cursor.fetchall()
        
        if not rows:
            logger.info("No properties found in SQLite DB to load into ChromaDB.")
            conn.close()
            return
            
        ids = []
        documents = []
        metadatas = []
        
        for row in rows:
            prop_id = str(row['id'])
            title = row['title'] or ""
            locality = row['locality'] or ""
            city = row['city'] or ""
            ptype = row['type'] or ""
            bhk = row['bhk'] or 0
            price = row['price'] or 0.0
            
            # Create a rich text document for embedding
            doc_text = f"{bhk} BHK {ptype} in {locality}, {city}. {title}."
            if row['amenities']:
                try:
                    amenities = json.loads(row['amenities'])
                    if amenities:
                        doc_text += f" Amenities include: {', '.join(amenities)}."
                except Exception:
                    pass
                    
            ids.append(prop_id)
            documents.append(doc_text)
            
            # Add useful metadata for filtering
            metadata = {
                "locality": locality,
                "city": city,
                "type": ptype,
                "bhk": bhk,
                "price": float(price)
            }
            metadatas.append(metadata)
            
        logger.info(f"Adding {len(documents)} properties to ChromaDB collection: {COLLECTION_NAME}...")
        
        # Upsert properties in batches
        batch_size = 100
        for i in range(0, len(documents), batch_size):
            self.collection.upsert(
                ids=ids[i:i+batch_size],
                documents=documents[i:i+batch_size],
                metadatas=metadatas[i:i+batch_size]
            )
            
        logger.info(f"Successfully loaded properties into ChromaDB.")
        conn.close()
        
    def search_properties(self, query: str, n_results: int = 5, where: dict = None):
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where
        )
        return results

def init_and_load_vector_db():
    manager = VectorDBManager()
    manager.load_properties_from_sqlite()
    return manager

if __name__ == "__main__":
    init_and_load_vector_db()
