"""
Embeddings and vector search utilities for the DBU AI Assistant.
Uses Gemini text-embedding-004 for embeddings and Supabase pgvector for storage/retrieval.
"""

import hashlib
import logging
import google.generativeai as genai
from django.conf import settings
from django.db import connection

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

EMBEDDING_MODEL = 'models/gemini-embedding-2'
EMBEDDING_DIM = 3072


def generate_embedding(text):
    """Generate a 768-dim embedding vector for the given text using Gemini."""
    try:
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=text,
            task_type='RETRIEVAL_DOCUMENT',
        )
        return result['embedding']
    except Exception as e:
        logger.error(f"Embedding generation failed: {e}")
        raise


def generate_query_embedding(text):
    """Generate an embedding optimized for query/retrieval."""
    try:
        result = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=text,
            task_type='RETRIEVAL_QUERY',
        )
        return result['embedding']
    except Exception as e:
        logger.error(f"Query embedding generation failed: {e}")
        raise


def search_similar_chunks(query_text, top_k=4):
    """
    Embed the query and find the top-k most similar knowledge chunks
    using cosine similarity in pgvector.
    """
    query_embedding = generate_query_embedding(query_text)
    embedding_str = '[' + ','.join(str(x) for x in query_embedding) + ']'

    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, topic, content,
                   1 - (embedding <=> %s::vector) AS similarity
            FROM dbu_knowledge
            ORDER BY embedding <=> %s::vector
            LIMIT %s
            """,
            [embedding_str, embedding_str, top_k]
        )
        rows = cursor.fetchall()

    results = []
    for row in rows:
        results.append({
            'id': row[0],
            'topic': row[1],
            'content': row[2],
            'similarity': round(float(row[3]), 4),
        })
    return results


def knowledge_exists(topic):
    """Check if a knowledge chunk with this topic already exists."""
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1 FROM dbu_knowledge WHERE topic = %s LIMIT 1", [topic])
        return cursor.fetchone() is not None


def insert_knowledge(topic, content):
    """Insert a knowledge chunk with its embedding into the database."""
    embedding = generate_embedding(content)
    embedding_str = '[' + ','.join(str(x) for x in embedding) + ']'

    with connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO dbu_knowledge (topic, content, embedding)
            VALUES (%s, %s, %s::vector)
            RETURNING id
            """,
            [topic, content, embedding_str]
        )
        row = cursor.fetchone()
        return row[0]


def build_rag_prompt(question, context_chunks):
    """Build the final prompt with retrieved context for Gemini Flash."""
    context_text = '\n\n---\n\n'.join(
        f"[Topic: {c['topic']}]\n{c['content']}" for c in context_chunks
    )

    return f"""You are **DBU Assistant**, an AI helper for Debre Birhan University students.
Answer the student's question using ONLY the context provided below.
If the context doesn't contain enough information, say so honestly and suggest where they might find the answer (e.g., registrar's office, department office, dbu.edu.et).

Keep your answers:
- Concise and well-structured
- Use bullet points or numbered lists when helpful
- Friendly and encouraging
- In English (unless the student asks in Amharic)

## Context from DBU Knowledge Base:
{context_text}

## Student's Question:
{question}

## Your Answer:"""


def get_cache_key(question):
    """Generate a deterministic cache key for a question."""
    normalized = question.strip().lower()
    return f"dbu_assistant_{hashlib.md5(normalized.encode()).hexdigest()}"
