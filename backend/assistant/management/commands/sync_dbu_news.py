import urllib.request
import re
import json
import time
from bs4 import BeautifulSoup

from django.core.management.base import BaseCommand
from assistant.embeddings import insert_knowledge, knowledge_exists

BASE_URL = "https://www.dbu.edu.et"
PAGE_URL = f"{BASE_URL}/older_posts"

def clean_text(text):
    text = text.replace("\t", " ")
    text = re.sub(r" +", " ", text)
    text = re.sub(r"\n\s*\n+", "\n", text)
    return text.strip()

def html_to_text(html_str):
    if not html_str or not html_str.strip():
        return "No Content"
    soup = BeautifulSoup(html_str, "html.parser")
    for tag in soup(["script", "style", "iframe", "img", "nav", "header", "footer"]):
        tag.decompose()
    text = soup.get_text(separator="\n")
    return clean_text(text)

def extract_news_records(page_html):
    match = re.search(r'newsRecords\s*=\s*(\[.*?\]);\s*', page_html, re.DOTALL)
    if not match:
        return []
    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError:
        return []


class Command(BaseCommand):
    help = 'Fetches new DBU posts and injects them into the AI knowledge base.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS(f"Fetching {PAGE_URL}..."))
        
        try:
            req = urllib.request.Request(PAGE_URL, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=30) as response:
                html = response.read().decode('utf-8')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to load page: {e}"))
            return

        records = extract_news_records(html)
        if not records:
            self.stdout.write(self.style.ERROR("No records found in the HTML."))
            return

        self.stdout.write(self.style.SUCCESS(f"Found {len(records)} total posts. Checking for new ones..."))

        # Process max 10 to avoid Gemini rate limits per cron execution
        process_limit = 10
        processed = 0
        skipped = 0
        failed = 0

        for record in records:
            if processed >= process_limit:
                break

            title = clean_text(record.get("title", "No Title"))
            
            # Check if we already have it
            if knowledge_exists(title):
                skipped += 1
                continue

            # It's a new post!
            news_id = record.get("news_id", "?")
            intro = clean_text(record.get("introtext", ""))
            detail_html = record.get("detail", "")
            created_at = record.get("created_at", "Unknown Date")
            post_url = f"{BASE_URL}/news_details?newsID={news_id}"
            content = html_to_text(detail_html)

            llm_content = f"Date: {created_at}\nURL: {post_url}\n\n"
            if intro:
                llm_content += f"{intro}\n\n"
            llm_content += content
            
            # Truncate to avoid massive token limits
            if len(llm_content) > 3000:
                llm_content = llm_content[:3000] + "... [Content Truncated]"

            try:
                kid = insert_knowledge(topic=title, content=llm_content)
                safe_title = title[:50].encode('ascii', 'ignore').decode('ascii')
                self.stdout.write(self.style.SUCCESS(f"  OK Inserted: {safe_title}... (id={kid})"))
                time.sleep(1) # Sleep to avoid rate limits
                processed += 1
            except Exception as e:
                safe_title = title[:50].encode('ascii', 'ignore').decode('ascii')
                self.stdout.write(self.style.ERROR(f"  FAIL: {safe_title}... Error: {e}"))
                failed += 1

        self.stdout.write(self.style.SUCCESS(f"\nSync complete! Inserted: {processed}, Skipped: {skipped}, Failed: {failed}"))
