#!/usr/bin/env python3
"""
Parse Google Docs HTML export of PromptVault prompts (22 Aug update).

Strategy:
  1. Extract plain text from HTML
  2. Find every line that contains a URL AND a link-label keyword -> these are
     guaranteed section headers.
  3. Also find bare-URL lines (no label) that are short (< 500 chars) and
     immediately preceded by a title-like line -> also section headers.
  4. Between consecutive headers, extract title, URLs, image prompt, video prompt.
"""

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

# -- HTML -> plain text -------------------------------------------------------

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts: list[str] = []
        self.skip = False

    def handle_starttag(self, tag, _attrs):
        if tag in ("script", "style"):
            self.skip = True

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip = False
        if tag in ("p", "div", "br", "li", "h1", "h2", "h3", "h4", "tr", "td"):
            self.parts.append("\n")

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)


def html_to_text(html: str) -> str:
    p = TextExtractor()
    p.feed(html)
    text = "".join(p.parts)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


# -- Constants ----------------------------------------------------------------

DASH_RE = re.compile(r"^[\u2014\-]{6,}$")

# A line is a SECTION HEADER if it matches one of these link-label patterns
LINK_LABELS = [
    r"SECCAO\s+IMAGEM\s*-\s*LINK\s*-\s*",
    r"LINK\s*-\s+",
    r"link\s+(da\s+)?(imagem|image|do\s+video|video|a\s+imagem|imagme)\s*[-\u2013\u2014:]*\s*",
    r"lindk\s*",
    r"Link\s+imagem\s*[-\u2013\u2014:]*\s*",
]
LINK_LABEL_ANY = re.compile("|".join(LINK_LABELS), re.IGNORECASE)

# Prompt markers
IMG_MARKER = re.compile(
    r"^(?:PROMPT\s+(?:DA\s+)?IMAGEM|Copiar\s+prompt\s+de\s+imagem)\s*[-\u2013\u2014:]*\s*",
    re.IGNORECASE,
)
VID_NO_SPEECH_MARKER = re.compile(
    r"^(?:PROMPT\s+VIDEO\s+SEM\s+FALA|Copiar\s+prompt\s+de\s+v\u00eddeo\s+sem\s+fala)\s*[-\u2013\u2014:]*\s*",
    re.IGNORECASE,
)
VID_WITH_SPEECH_MARKER = re.compile(
    r"^Copiar\s+prompt\s+de\s+v\u00eddeo\s*[-\u2013\u2014:]*\s*",
    re.IGNORECASE,
)

# Title-like patterns (used to find titles on the line BEFORE a bare URL)
TITLE_HINTS = re.compile(
    r"[|]"  # pipe is the most reliable title indicator
    r"|^(?:POV|Pov|Casa|Ponto|Movimento|Movimentos|Ugc|UGC|Crian"
    r"\u00e7as|Eletros|Beleza|Brincos|Selfie|Embalagem|Caixa|relogio|Relogio|"
    r"unhas|Veja|Estilo|Saco|Comedouro|Loja|Tecnologia|Produto|imagem|RELOGIO)"
    r"|Garrafa"
    r"|Bolsa"
    r"|Eletro|Cal\u00e7ad|\u00d3culos|Camis|Fronha|Lingerie|Anel|Joia|Colar|Pulseira"
    r"|Conjunto|T\u00eanis|Len\u00e7|Mobili|Fruteira|Perfume|Chapeu|Bone"
    r"|Infantil|Brinquedo|Roupa|Cal\u00e7ado|Cabide|Relogio"
    r"|PET|pet|Pet",
    re.IGNORECASE,
)


# -- Helpers ------------------------------------------------------------------

def extract_urls(line: str) -> list[str]:
    """Return all URLs in a line, cleaned."""
    return [u.rstrip(",;:!?'") for u in re.findall(r"https?://\S+", line)]


def is_video_url(url: str) -> bool:
    return any(url.lower().endswith(ext) for ext in (".mp4", ".mov", ".webm"))


def strip_leading_dashes(s: str) -> str:
    return re.sub(r"^[=\u2014\-]+\s*", "", s).strip()


def clean_title(t: str) -> str:
    t = strip_leading_dashes(t)
    t = re.sub(r"[\u2014\-]+\s*$", "", t).strip()
    t = re.sub(r"\s+", " ", t)
    return t


def strip_marker(line: str, marker: re.Pattern) -> str:
    m = marker.match(line)
    return line[m.end():].strip() if m else line


def classify_line(line: str) -> str | None:
    """'image', 'video_no_speech', 'video_with_speech', or None."""
    s = line.strip()
    if IMG_MARKER.match(s):
        return "image"
    if VID_NO_SPEECH_MARKER.match(s):
        return "video_no_speech"
    if VID_WITH_SPEECH_MARKER.match(s):
        return "video_with_speech"
    return None


def looks_like_title(s: str) -> bool:
    """Heuristic: does this stripped line look like a section title?"""
    if not s or len(s) > 120:
        return False
    if "|" in s:
        return True
    if TITLE_HINTS.search(s):
        return True
    return False


# -- Core: find section header indices -----------------------------------------

def find_section_headers(lines: list[str]) -> list[int]:
    """
    Return line indices that are section headers.
    A line is a header if:
      a) it has a link-label prefix, OR
      b) it is a short bare-URL line and the nearest preceding non-empty
         non-dash line looks like a title.
    """
    headers: list[int] = []

    for i, line in enumerate(lines):
        s = line.strip()
        if not s:
            continue
        urls = extract_urls(s)
        if not urls:
            continue

        # (a) Has a link label -> probably a header, but skip very long lines
        #     (prompt body can contain the word "link" / "Link")
        if LINK_LABEL_ANY.search(s):
            if len(s) > 800:
                continue  # Too long for a header line
            headers.append(i)
            continue

        # (b) Bare URL line - must be short (real headers are short)
        s_nodash = strip_leading_dashes(s)
        if len(s) > 500:
            continue  # Too long - likely a prompt body line with URL
        if not s_nodash.startswith("http"):
            continue  # URL not at start after dashes

        # Look backwards for a title-like line
        for j in range(i - 1, max(i - 5, -1), -1):
            prev = lines[j].strip()
            if not prev:
                continue
            prev_clean = strip_leading_dashes(prev)
            if DASH_RE.match(prev) and not prev_clean:
                continue
            if looks_like_title(prev_clean):
                headers.append(i)
            break

    return headers


# -- Core: extract title for a section -----------------------------------------

def extract_title(header_idx: int, lines: list[str]) -> str | None:
    """
    Try to find a title for the section whose header is at header_idx.
    Look at:
    1. The header line itself (title glued before the link label)
    2. The 1-3 lines before the header, stripping dashes
    """
    header = lines[header_idx].strip()

    # 1a. For SECCAO IMAGEM - LINK - <url><title> or LINK - <url><title>
    #     (title after URL - imgur short IDs have text glued after)
    m = re.match(
        r"^(?:[=\u2014\-]+)?(?:SECCAO\s+IMAGEM\s*-\s*LINK\s*-\s*|LINK\s*-\s*)"
        r"(https?://imgur\.com/\w{7})(.+)$",
        header, re.IGNORECASE,
    )
    if m:
        remainder = m.group(2).strip()
        if len(remainder) > 3:
            return clean_title(remainder)

    # 1b. Title glued before link label on the same line
    #     e.g. "POV | Lingerielink video - https://..."
    #     BUT skip if the text before "link" is just header keywords
    m = re.match(
        r"^(?:[=\u2014\-]+)?(.+?)\s*"
        r"(?:link\s+(?:da\s+)?(?:imagem|image|do\s+video|video|a\s+imagem|imagme)|"
        r"lindk|LINK)\s*[-\u2013\u2014:]*\s*https?://",
        header, re.IGNORECASE,
    )
    if m:
        candidate = clean_title(m.group(1))
        # Reject if the "title" is just a header keyword
        if not re.match(r"^(?:SECCAO|LINK)$", candidate, re.IGNORECASE):
            return candidate

    # 1c. For other URLs after LINK -, title after URL (rare for long URLs)
    m = re.match(
        r"^(?:[=\u2014\-]+)?(?:SECCAO\s+IMAGEM\s*-\s*LINK\s*-\s*|LINK\s*-\s*)"
        r"(https?://\S+?)(.+)$",
        header, re.IGNORECASE,
    )
    if m:
        remainder = m.group(2).strip()
        if len(remainder) > 3:
            return clean_title(remainder)

    # 2. Look at lines BEFORE the header for a title (strip dashes first!)
    #    Skip prompt-marker lines and empty lines when looking backwards.
    for j in range(header_idx - 1, max(header_idx - 8, -1), -1):
        prev = lines[j].strip()
        if not prev:
            continue
        prev_clean = strip_leading_dashes(prev)
        if not prev_clean:
            continue  # Pure dash line
        # Skip prompt-marker lines (they're body content, not titles)
        if classify_line(prev_clean):
            continue
        if looks_like_title(prev_clean):
            return clean_title(prev_clean)
        break  # Non-title content found, stop

    return None


# -- Core: parse one section ---------------------------------------------------

def parse_section(
    header_idx: int,
    next_header_idx: int | None,
    lines: list[str],
    title: str | None,
) -> dict | None:
    body_end = next_header_idx if next_header_idx else len(lines)

    # Collect section body lines (skip the header line itself and leading dashes)
    section_lines: list[str] = []
    past_header = False
    for i in range(header_idx, body_end):
        s = lines[i].strip()
        if i == header_idx:
            continue
        if not past_header and DASH_RE.match(s):
            continue
        past_header = True
        section_lines.append(s)

    if not section_lines:
        return None

    # Extract URLs from header line and up to 2 lines after
    header_urls = extract_urls(lines[header_idx].strip())
    for offset in range(1, min(3, body_end - header_idx)):
        extra = lines[header_idx + offset].strip()
        if LINK_LABEL_ANY.search(extra):
            for u in extract_urls(extra):
                if u not in header_urls:
                    header_urls.append(u)

    if not header_urls:
        return None

    # Determine primary link and video presence
    primary_link: str | None = None
    has_video_link = False
    for u in header_urls:
        if is_video_url(u):
            has_video_link = True
        elif primary_link is None:
            primary_link = u
    if primary_link is None:
        primary_link = header_urls[0]

    # Find prompt markers
    img_start = vid_ns_start = vid_ws_start = None
    for idx, sl in enumerate(section_lines):
        ct = classify_line(sl)
        if ct == "image" and img_start is None:
            img_start = idx
        elif ct == "video_no_speech" and vid_ns_start is None:
            vid_ns_start = idx
        elif ct == "video_with_speech" and vid_ws_start is None:
            vid_ws_start = idx

    def grab_prompt(start_idx: int | None, end_constraints: list[int | None]) -> str | None:
        if start_idx is None:
            return None
        end = len(section_lines)
        for ec in end_constraints:
            if ec is not None and ec > start_idx:
                end = min(end, ec)
        parts: list[str] = []
        first = section_lines[start_idx]
        for marker in (IMG_MARKER, VID_NO_SPEECH_MARKER, VID_WITH_SPEECH_MARKER):
            stripped = strip_marker(first, marker)
            if stripped != first:
                first = stripped
                break
        if first:
            parts.append(first)
        for sl in section_lines[start_idx + 1 : end]:
            parts.append(sl)
        text = "\n".join(parts).strip()
        text = re.sub(r"^```text\s*\n?", "", text).strip()
        text = re.sub(r"\n?```$", "", text).strip()
        return text if text else None

    image_prompt = grab_prompt(img_start, [vid_ns_start, vid_ws_start])
    video_prompt = grab_prompt(
        vid_ns_start if vid_ns_start is not None else vid_ws_start,
        [img_start],
    )

    # If no markers, treat entire body as image prompt
    if image_prompt is None and video_prompt is None:
        body = "\n".join(sl for sl in section_lines if sl and not DASH_RE.match(sl))
        body = body.strip()
        if len(body) > 100:
            image_prompt = body

    if image_prompt is None and video_prompt is None:
        return None

    return {
        "title": title or "[sem t\u00edtulo]",
        "link": primary_link,
        "has_video_link": has_video_link,
        "image_prompt": image_prompt,
        "video_prompt": video_prompt,
    }


# -- Deduplication -------------------------------------------------------------

def url_dedup_key(url: str) -> str:
    """Strip query string so signed Supabase URLs with different tokens match."""
    return url.split("?")[0]


def dedup(entries: list[dict]) -> list[dict]:
    seen: dict[str, dict] = {}
    for e in entries:
        key = url_dedup_key(e["link"])
        if key in seen:
            old = seen[key]
            old_len = len(old.get("image_prompt") or "") + len(old.get("video_prompt") or "")
            new_len = len(e.get("image_prompt") or "") + len(e.get("video_prompt") or "")
            if new_len > old_len:
                if old.get("video_prompt") and not e.get("video_prompt"):
                    e["video_prompt"] = old["video_prompt"]
                if old.get("has_video_link"):
                    e["has_video_link"] = True
                if old.get("title") and not e["title"].startswith("["):
                    pass  # keep new title
                elif old.get("title") and not old["title"].startswith("["):
                    e["title"] = old["title"]
                seen[key] = e
        else:
            seen[key] = e
    return list(seen.values())


# -- Main ---------------------------------------------------------------------

def main():
    html_path = Path(__file__).parent / "ATUALIZACAODEPROMPTDIA22AGO.html"
    out_path = Path(__file__).parent / "parsed_prompts.json"

    print(f"Reading {html_path} ...")
    html = html_path.read_text(encoding="utf-8")
    print(f"  HTML size: {len(html):,} bytes")

    text = html_to_text(html)
    lines = text.split("\n")
    print(f"  Extracted {len(lines):,} lines")

    headers = find_section_headers(lines)
    print(f"  Section headers found: {len(headers)}")

    entries: list[dict] = []
    for idx, hi in enumerate(headers):
        next_hi = headers[idx + 1] if idx + 1 < len(headers) else None
        title = extract_title(hi, lines)
        entry = parse_section(hi, next_hi, lines, title)
        if entry:
            entries.append(entry)

    print(f"  Parsed entries: {len(entries)}")

    before = len(entries)
    entries = dedup(entries)
    print(f"  After dedup: {len(entries)} (removed {before - len(entries)})")

    # Post-processing fixes
    for e in entries:
        # Fix imgur URLs where title is glued: https://imgur.com/i5QahBhSelfie
        # The URL should be https://imgur.com/i5QahBh and the title extracted
        if "imgur.com" in e["link"]:
            # imgur IDs are exactly 7 alphanumeric chars
            m = re.match(r"(https://imgur\.com/\w{7})(.+)", e["link"])
            if m and e["title"].startswith("["):
                e["link"] = m.group(1)
                e["title"] = clean_title(m.group(2))
            elif m:
                e["link"] = m.group(1)

        # Fix 'SECCAO IMAGEM' or untitled entries by content analysis
        if e["title"].startswith("[") or e["title"].lower() == "seccao imagem":
            img = e.get("image_prompt") or ""
            vid = e.get("video_prompt") or ""
            combined = (img + vid).lower()
            if "anel" in combined and "ring" in combined:
                e["title"] = "POV | Anel"
            elif "fronha" in combined or "pillowcase" in combined:
                e["title"] = "Casa Pov | Fronha"
            elif "detalhe" in combined and "voz" in combined and "feminina" in combined:
                e["title"] = "Movimento | Transição Troca de roupa"

    entries.sort(key=lambda e: e["title"].lower())

    out_path.write_text(json.dumps(entries, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  Written to {out_path}")

    # Summary
    n_img = sum(1 for e in entries if e["image_prompt"])
    n_vid = sum(1 for e in entries if e["video_prompt"])
    n_both = sum(1 for e in entries if e["image_prompt"] and e["video_prompt"])
    n_vlink = sum(1 for e in entries if e["has_video_link"])
    n_notitle = sum(1 for e in entries if e["title"].startswith("["))

    print(f"\n{'=' * 70}")
    print(f"SUMMARY  -  {len(entries)} entries")
    print(f"{'=' * 70}")
    print(f"  Image prompts : {n_img}")
    print(f"  Video prompts : {n_vid}")
    print(f"  Both         : {n_both}")
    print(f"  Video links  : {n_vlink}")
    print(f"  Untitled     : {n_notitle}")

    print(f"\n--- All entries ---")
    for i, e in enumerate(entries):
        i_s = "IMG" if e["image_prompt"] else "---"
        v_s = "VID" if e["video_prompt"] else "---"
        vl = " +vid-link" if e["has_video_link"] else ""
        print(f"  {i + 1:2d}. [{i_s}|{v_s}{vl}]  {e['title']}")
        lnk = e["link"]
        print(f"      link: {lnk[:90]}{'...' if len(lnk) > 90 else ''}")
        if e["image_prompt"]:
            print(f"      image prompt: {len(e['image_prompt']):,} chars")
        if e["video_prompt"]:
            print(f"      video prompt: {len(e['video_prompt']):,} chars")
        print()


if __name__ == "__main__":
    main()
