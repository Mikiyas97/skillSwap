"""
DBU AI Assistant — API views.
POST /api/assistant/ask/  →  { "question": "..." }  →  { "answer": "...", "sources": [...] }
"""

import logging
import google.generativeai as genai
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from django.conf import settings

from .embeddings import search_similar_chunks, build_rag_prompt, get_cache_key

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

CACHE_TTL = 60 * 60 * 24 * 7  # 7 days in seconds


@api_view(['POST'])
@permission_classes([AllowAny])
def ask_question(request):
    """
    RAG-powered Q&A endpoint for the DBU Assistant.
    Accessible without authentication so even visitors can use it.
    """
    question = request.data.get('question', '').strip()

    if not question:
        return Response(
            {'error': 'Please provide a question.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(question) > 500:
        return Response(
            {'error': 'Question is too long. Please keep it under 500 characters.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 1. Check cache
    cache_key = get_cache_key(question)
    cached = cache.get(cache_key)
    if cached:
        logger.info(f"Cache hit for: {question[:50]}...")
        return Response(cached)

    try:
        # 2. Retrieve relevant context chunks
        chunks = search_similar_chunks(question, top_k=4)

        if not chunks:
            # No knowledge found — give a generic response
            return Response({
                'answer': (
                    "I don't have specific information about that yet. "
                    "Try asking about the academic calendar, registration, "
                    "departments, or campus rules!\n\n"
                    "You can also visit **dbu.edu.et** or contact the "
                    "registrar's office directly."
                ),
                'sources': [],
            })

        # 3. Build RAG prompt
        prompt = build_rag_prompt(question, chunks)

        # 4. Generate answer with Gemini Flash
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.3,
                max_output_tokens=600,
            ),
        )

        answer = response.text.strip()
        sources = list({c['topic'] for c in chunks})

        result = {
            'answer': answer,
            'sources': sources,
        }

        # 5. Cache for 7 days
        cache.set(cache_key, result, CACHE_TTL)

        return Response(result)

    except Exception as e:
        logger.error(f"Assistant error: {e}", exc_info=True)
        return Response(
            {
                'answer': (
                    "I'm having a little trouble right now. "
                    "Please try again in a moment, or visit **dbu.edu.et** "
                    "for direct information."
                ),
                'sources': [],
            },
            status=status.HTTP_200_OK,  # Still 200 — graceful degradation
        )
