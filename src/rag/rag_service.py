import os
import glob
from typing import List, Tuple

# Global cache of documents as list of (file_name, line_text, set_of_words)
_rag_cache: List[Tuple[str, str, set]] = []

def preload_rag_documents(data_dir: str = "data"):
    """
    Preload all RAG text files from data_dir into an in-memory cache for ultra-fast lookup.
    """
    global _rag_cache
    _rag_cache = []
    
    if not os.path.exists(data_dir):
        return
        
    txt_files = glob.glob(os.path.join(data_dir, "*.txt"))
    for file_path in txt_files:
        try:
            file_name = os.path.basename(file_path)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                lines = [line.strip() for line in content.split("\n") if line.strip()]
                for line in lines:
                    line_words = set(line.lower().split())
                    _rag_cache.append((file_name, line, line_words))
        except Exception as e:
            print(f"Error preloading RAG file {file_path}: {e}")
            
    print(f"Preloaded {len(_rag_cache)} reference guidelines into RAG cache.")

def retrieve_rag_context(query: str, data_dir: str = "data") -> str:
    """
    RAG Service: Searches the in-memory cache for context matching query keywords.
    """
    global _rag_cache
    if not _rag_cache:
        preload_rag_documents(data_dir)
        
    query_words = set(query.lower().split())
    stop_words = {"the", "and", "a", "of", "to", "in", "is", "for", "with", "on", "at", "by", "an"}
    keywords = query_words - stop_words

    matched_lines = []
    for file_name, line, line_words in _rag_cache:
        overlap = keywords.intersection(line_words)
        if overlap:
            matched_lines.append((len(overlap), line))
            
    # Sort matches by overlap score descending
    matched_lines.sort(key=lambda x: x[0], reverse=True)
    best_matches = [line for score, line in matched_lines[:5]]
    
    return "\n".join(best_matches)
