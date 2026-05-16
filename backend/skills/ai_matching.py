"""
AI Matching Engine for SkillSwap DBU.
Uses Gemini 2.5 Flash for intelligent skill matching.
All Gemini calls are centralized here — never put AI logic in views.
"""

import os
import re
import json
import hashlib
import logging
from django.core.cache import cache

logger = logging.getLogger(__name__)


# ─── Gemini Client (lazy init) ─────────────────────────────

_genai_configured = False


def _is_genai_available():
    """Lazy-initialize the Gemini client."""
    global _genai_configured
    if not _genai_configured:
        try:
            import google.generativeai as genai
            api_key = os.getenv('GEMINI_API_KEY', '')
            if not api_key:
                logger.warning('[AI] GEMINI_API_KEY not set — all calls will use fallback scoring.')
                return False
            genai.configure(api_key=api_key)
            _genai_configured = True
        except Exception as e:
            logger.error(f'[AI] Failed to initialize Gemini client: {e}')
            return False
    return _genai_configured


def _get_model_name():
    """Get the configured Gemini model name."""
    return os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')


# ─── Cache Helpers ──────────────────────────────────────────

def get_cache_key(id_a, id_b):
    """
    Generate a consistent MD5 cache key for any pair of post IDs.
    Always sorts so (a,b) and (b,a) produce the same key.
    """
    sorted_ids = sorted([str(id_a), str(id_b)])
    raw = f"ai_match:{sorted_ids[0]}:{sorted_ids[1]}"
    return hashlib.md5(raw.encode()).hexdigest()


# ─── Keyword Fallback Scoring ──────────────────────────────

def _extract_keywords(text):
    """Extract lowercase keywords from text, filtering short words."""
    if not text:
        return set()
    words = re.findall(r'[a-zA-Z]{3,}', text.lower())
    # Filter out common stop words
    stop_words = {
        'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all',
        'can', 'had', 'her', 'was', 'one', 'our', 'out', 'has',
        'have', 'from', 'been', 'will', 'with', 'this', 'that',
        'they', 'which', 'their', 'would', 'make', 'like', 'just',
        'know', 'take', 'come', 'could', 'than', 'look', 'only',
        'into', 'over', 'such', 'also', 'back', 'some', 'them',
        'want', 'learn', 'teach', 'help', 'need', 'about', 'what',
    }
    return set(words) - stop_words


def _keyword_score(listing_a, listing_b):
    """
    Compute a keyword-based similarity score between two listings.
    Returns (score: int, reason: str).
    """
    score = 0

    # Category match (worth 30 points)
    cat_a = getattr(listing_a.category, 'name', '') if listing_a.category else ''
    cat_b = getattr(listing_b.category, 'name', '') if listing_b.category else ''
    if cat_a and cat_b and cat_a.lower() == cat_b.lower():
        score += 30

    # Tag overlap (worth up to 30 points)
    tags_a = set(t.lower() for t in (listing_a.tags or []))
    tags_b = set(t.lower() for t in (listing_b.tags or []))
    if tags_a and tags_b:
        overlap = tags_a & tags_b
        union = tags_a | tags_b
        if union:
            tag_ratio = len(overlap) / len(union)
            score += int(tag_ratio * 30)

    # Title keyword overlap (worth up to 20 points)
    title_kw_a = _extract_keywords(listing_a.title)
    title_kw_b = _extract_keywords(listing_b.title)
    if title_kw_a and title_kw_b:
        overlap = title_kw_a & title_kw_b
        if overlap:
            score += min(20, len(overlap) * 7)

    # Description keyword overlap (worth up to 20 points)
    desc_kw_a = _extract_keywords(listing_a.description)
    desc_kw_b = _extract_keywords(listing_b.description)
    if desc_kw_a and desc_kw_b:
        overlap = desc_kw_a & desc_kw_b
        if overlap:
            score += min(20, len(overlap) * 3)

    # Generate reason
    if score >= 70:
        reason = "Strong keyword and category overlap between these skills."
    elif score >= 50:
        reason = "Good overlap in skill category and related topics."
    elif score >= 30:
        reason = "Some shared topics and related skill areas."
    else:
        reason = "Limited overlap, but could still be a useful connection."

    return min(100, score), reason


# ─── Gemini Response Parsing ───────────────────────────────

def _parse_gemini_json(text):
    """
    Parse JSON from Gemini response, handling markdown code fences.
    Returns parsed dict or None on failure.
    """
    if not text:
        return None

    # Strip markdown code fences (```json ... ```)
    cleaned = text.strip()
    cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
    cleaned = re.sub(r'\s*```$', '', cleaned)
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Try to find JSON object in the text
        match = re.search(r'\{[^{}]*\}', cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
    return None


# ─── Core Scoring Functions ────────────────────────────────

def score_match(wanted_post, offer_post):
    """
    Score how well an offer listing matches a wanted listing using Gemini.
    Falls back to keyword scoring if Gemini is unavailable or fails.

    Returns: dict {"score": int, "reason": str}
    """
    # Check cache first
    cache_key = get_cache_key(wanted_post.id, offer_post.id)
    cached = cache.get(cache_key)
    if cached:
        return cached

    if _is_genai_available():
        import google.generativeai as genai
        try:
            cat_wanted = getattr(wanted_post.category, 'name', 'Uncategorized') if wanted_post.category else 'Uncategorized'
            cat_offer = getattr(offer_post.category, 'name', 'Uncategorized') if offer_post.category else 'Uncategorized'

            prompt = f"""You are a university skill-matching assistant for SkillSwap DBU, a peer-to-peer skill exchange platform at Debre Berhan University.

Evaluate how well the OFFER post matches what the WANTED post is looking for.

WANTED POST (what the student needs):
- Title: {wanted_post.title}
- Description: {wanted_post.description}
- Category: {cat_wanted}
- Tags: {', '.join(wanted_post.tags or [])}

OFFER POST (what a tutor can teach):
- Title: {offer_post.title}
- Description: {offer_post.description}
- Category: {cat_offer}
- Tags: {', '.join(offer_post.tags or [])}

SCORING SCALE:
90-100: Perfect match — the offer directly addresses the need
70-89: Strong match — highly relevant skills with good overlap
50-69: Partial match — some relevant overlap but not exact
30-49: Weak match — loosely related skills
0-29: No match — unrelated topics

Return ONLY valid JSON, nothing else:
{{"score": <0-100>, "reason": "<one sentence explaining the match>"}}"""

            model = genai.GenerativeModel(_get_model_name())
            response = model.generate_content(prompt)

            result = _parse_gemini_json(response.text)
            if result and 'score' in result and 'reason' in result:
                result['score'] = max(0, min(100, int(result['score'])))
                cache.set(cache_key, result, 86400)  # Cache 24 hours
                return result

            logger.warning(f'[AI] Invalid Gemini response for match {wanted_post.id}↔{offer_post.id}')
        except Exception as e:
            logger.warning(f'[AI] Gemini call failed for match scoring: {e}')

    # Fallback to keyword scoring
    fallback_score, fallback_reason = _keyword_score(wanted_post, offer_post)
    result = {"score": fallback_score, "reason": fallback_reason}
    cache.set(cache_key, result, 86400)
    return result


def score_study_partner(wanted_post_a, wanted_post_b):
    """
    Score how well two students would benefit from studying together
    based on their learning needs.
    Falls back to keyword scoring if Gemini fails.

    Returns: dict {"score": int, "reason": str}
    """
    cache_key = f"study_{get_cache_key(wanted_post_a.id, wanted_post_b.id)}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    if _is_genai_available():
        import google.generativeai as genai
        try:
            cat_a = getattr(wanted_post_a.category, 'name', 'Uncategorized') if wanted_post_a.category else 'Uncategorized'
            cat_b = getattr(wanted_post_b.category, 'name', 'Uncategorized') if wanted_post_b.category else 'Uncategorized'

            prompt = f"""You are a university skill-matching assistant for SkillSwap DBU at Debre Berhan University.

Evaluate how well these two students would benefit from studying together AS PEERS based on their posts.

STUDENT A's POST:
- Title: {wanted_post_a.title}
- Description: {wanted_post_a.description}
- Category: {cat_a}
- Tags: {', '.join(wanted_post_a.tags or [])}

STUDENT B's POST:
- Title: {wanted_post_b.title}
- Description: {wanted_post_b.description}
- Category: {cat_b}
- Tags: {', '.join(wanted_post_b.tags or [])}

IMPORTANT INSTRUCTION:
You are evaluating them strictly as PEER STUDY PARTNERS (co-learners) or CO-TUTORS. 
If one student is explicitly asking for a teacher and the other is offering to teach, they are a Teacher-Student match, NOT peer study partners. In that case, score them LOW (below 50).
Give high scores ONLY if they share similar learning goals and would study well together on the same level.

SCORING SCALE:
90-100: Perfect study partners — nearly identical learning goals or co-tutoring interests
70-89: Strong partners — very similar topics and can learn together
50-69: Partial match — some shared interests worth exploring
30-49: Weak match — loosely related study areas or mismatched dynamics (e.g., tutor vs learner)
0-29: No match — completely different learning paths

Return ONLY valid JSON, nothing else:
{{"score": <0-100>, "reason": "<one sentence explaining why they'd be good PEER study partners>"}}"""

            model = genai.GenerativeModel(_get_model_name())
            response = model.generate_content(prompt)

            result = _parse_gemini_json(response.text)
            if result and 'score' in result and 'reason' in result:
                result['score'] = max(0, min(100, int(result['score'])))
                cache.set(cache_key, result, 86400)
                return result

            logger.warning(f'[AI] Invalid Gemini response for study partner {wanted_post_a.id}↔{wanted_post_b.id}')
        except Exception as e:
            logger.warning(f'[AI] Gemini call failed for study partner scoring: {e}')

    # Fallback
    fallback_score, fallback_reason = _keyword_score(wanted_post_a, wanted_post_b)
    result = {"score": fallback_score, "reason": fallback_reason}
    cache.set(cache_key, result, 86400)
    return result


# ─── High-Level Match Functions ────────────────────────────

def get_ai_matches(source_post, exclude_user, limit=5, min_score=60):
    """
    Find the best matching posts for a given listing (bidirectional).

    - If source is 'wanted' → query 'offer' posts (learner finds tutor)
    - If source is 'offer'  → query 'wanted' posts (tutor finds learner)

    Step 1: Query same-category active posts of the OPPOSITE type (up to 20).
    Step 2: If < 5 found, broaden to all categories (still opposite type only).
    Step 3: Score each candidate with Gemini.
    Step 4: Filter by min_score, sort descending.
    Step 5: Return top `limit` results.
    """
    from .models import SkillListing

    # Determine the opposite post type to search for
    target_type = 'offer' if source_post.post_type == 'wanted' else 'wanted'

    # Step 1: Same category candidates of the opposite type
    candidates = list(
        SkillListing.objects.filter(
            is_active=True,
            post_type=target_type,
            category=source_post.category,
        ).exclude(
            tutor=exclude_user
        ).select_related('tutor', 'category')[:20]
    )

    # Step 2: Broaden if fewer than 5 (still opposite type only)
    if len(candidates) < 5:
        existing_ids = [c.id for c in candidates]
        extra = list(
            SkillListing.objects.filter(
                is_active=True,
                post_type=target_type,
            ).exclude(
                tutor=exclude_user
            ).exclude(
                id__in=existing_ids
            ).select_related('tutor', 'category')[:20 - len(candidates)]
        )
        candidates.extend(extra)

    # Step 3: Score each candidate (max 20)
    scored = []
    for candidate in candidates[:20]:
        if source_post.post_type == 'wanted':
            result = score_match(source_post, candidate)
        else:
            result = score_match(candidate, source_post)
        scored.append({
            "post": candidate,
            "score": result["score"],
            "reason": result["reason"],
        })

    # Step 4: Filter and sort
    scored = [s for s in scored if s["score"] >= min_score]
    scored.sort(key=lambda x: x["score"], reverse=True)

    # Step 5: Return top results
    return scored[:limit]


def get_study_partners(source_post, exclude_user, limit=5, min_score=55):
    """
    Find study partners — other students with listings of the same type on the same topic.
    - Wanted → Wanted (find peers to learn with)
    - Offer → Offer (find co-tutors to collaborate with)
    """
    from .models import SkillListing

    # Find other listings of the SAME type in the same category
    candidates = list(
        SkillListing.objects.filter(
            is_active=True,
            post_type=source_post.post_type,
            category=source_post.category,
        ).exclude(
            tutor=exclude_user
        ).select_related('tutor', 'category')[:20]
    )

    # Broaden if needed (still only same type posts)
    if len(candidates) < 5:
        existing_ids = [c.id for c in candidates]
        extra = list(
            SkillListing.objects.filter(
                is_active=True,
                post_type=source_post.post_type,
            ).exclude(
                tutor=exclude_user
            ).exclude(
                id__in=existing_ids
            ).select_related('tutor', 'category')[:20 - len(candidates)]
        )
        candidates.extend(extra)

    # Score each as study partner
    scored = []
    for candidate in candidates[:20]:
        result = score_study_partner(source_post, candidate)
        scored.append({
            "post": candidate,
            "score": result["score"],
            "reason": result["reason"],
        })

    scored = [s for s in scored if s["score"] >= min_score]
    scored.sort(key=lambda x: x["score"], reverse=True)

    return scored[:limit]


def get_skill_suggestions(user_profile):
    """
    Use Gemini to suggest 3 skills a student should learn next,
    based on their profile, department, and current activity.

    Returns: dict {"suggestions": [{"skill": str, "reason": str, "category": str}, ...]}
    """
    # Cache by user ID for 48 hours
    cache_key = f"skill_suggestions_{user_profile.id}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    # Build profile context
    name = user_profile.get_full_name() or user_profile.username
    department = user_profile.department or 'Unknown'
    year = user_profile.year or 'Unknown'
    bio = user_profile.bio or 'No bio provided'
    teaching = ', '.join(user_profile.skills_teaching or []) or 'None listed'
    learning = ', '.join(user_profile.skills_learning or []) or 'None listed'
    sessions = user_profile.sessions_completed or 0

    if _is_genai_available():
        import google.generativeai as genai
        try:
            prompt = f"""You are an academic advisor at Debre Berhan University helping students grow.

STUDENT PROFILE:
- Name: {name}
- Department: {department}
- Year: {year}
- Bio: {bio}
- Skills they currently teach: {teaching}
- Skills they want to learn: {learning}
- Completed tutoring sessions: {sessions}

Based on this student's academic profile, department, current skills, and learning interests, what are 3 skills they should learn next to grow academically and professionally?

Consider:
- Skills that complement their current expertise
- Skills valued in their department/field
- Practical skills for Ethiopian university students
- Skills that would make them more competitive

Return ONLY valid JSON:
{{"suggestions": [{{"skill": "...", "reason": "...", "category": "..."}}, {{"skill": "...", "reason": "...", "category": "..."}}, {{"skill": "...", "reason": "...", "category": "..."}}]}}"""

            model = genai.GenerativeModel(_get_model_name())
            response = model.generate_content(prompt)

            result = _parse_gemini_json(response.text)
            if result and 'suggestions' in result and len(result['suggestions']) > 0:
                cache.set(cache_key, result, 172800)  # 48 hours
                return result

            logger.warning(f'[AI] Invalid Gemini response for skill suggestions user {user_profile.id}')
        except Exception as e:
            logger.warning(f'[AI] Gemini call failed for skill suggestions: {e}')

    # Fallback suggestions based on department
    fallback = _get_fallback_suggestions(department)
    cache.set(cache_key, fallback, 172800)
    return fallback


def _get_fallback_suggestions(department):
    """Generate sensible fallback suggestions based on department."""
    dept_lower = department.lower()

    if 'computer' in dept_lower or 'software' in dept_lower or 'it' in dept_lower:
        return {"suggestions": [
            {"skill": "Data Structures & Algorithms", "reason": "Foundational for technical interviews and advanced programming.", "category": "Programming"},
            {"skill": "Web Development with React", "reason": "High-demand skill for modern software development careers.", "category": "Programming"},
            {"skill": "Database Management (SQL)", "reason": "Essential for backend development and data-driven applications.", "category": "Programming"},
        ]}
    elif 'business' in dept_lower or 'management' in dept_lower or 'accounting' in dept_lower:
        return {"suggestions": [
            {"skill": "Financial Analysis with Excel", "reason": "Critical for business analysis and decision making.", "category": "Business"},
            {"skill": "Digital Marketing Basics", "reason": "Growing field that complements traditional business skills.", "category": "Business"},
            {"skill": "Presentation & Public Speaking", "reason": "Essential for leadership and professional communication.", "category": "Communication"},
        ]}
    elif 'engineer' in dept_lower or 'electrical' in dept_lower or 'mechanical' in dept_lower:
        return {"suggestions": [
            {"skill": "CAD/3D Modeling", "reason": "Essential for engineering design and prototyping.", "category": "Engineering"},
            {"skill": "MATLAB Programming", "reason": "Widely used for engineering simulations and analysis.", "category": "Programming"},
            {"skill": "Project Management", "reason": "Critical for managing engineering projects effectively.", "category": "Business"},
        ]}
    else:
        return {"suggestions": [
            {"skill": "Academic Writing", "reason": "Improves research papers and thesis quality across all fields.", "category": "Communication"},
            {"skill": "Basic Programming (Python)", "reason": "Valuable digital literacy skill for any career path.", "category": "Programming"},
            {"skill": "Critical Thinking & Research", "reason": "Strengthens analytical abilities for academic success.", "category": "Academic"},
        ]}
