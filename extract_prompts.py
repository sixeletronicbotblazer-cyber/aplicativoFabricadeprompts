#!/usr/bin/env python3
"""
Extract all prompts from the LISTA ATUALIZADA PROMPTS ACADEMY PDF (v2 - refined).

The PDF structure:
- Each prompt block is separated by lines like "—----------------" or "====" or "━━━━━━"
- After separator: TITLE line (e.g., "Gancho papai Noel", "NATAL GANCHO PET -")
- Optional: "Before" / "After" (reference images)
- Optional: "LINK IMAGEM OU VIDEO" + URL
- Optional: "DETALHE" + short note/tip (usually < 200 chars)
- Prompt text: starts with "View Prompt →", "padrao prompts", "PROMPT GERAL", "PROMPT -", etc.
- Variant prompts: "PROMPT PARA O FLOW", "PROMPT GROK", "PROMPT KLING", etc.
- Category headers: "CATEGORIA - GANCHO", "SECCAO POV ROUPA FEMININA"
"""

import pdfplumber
import re
import json
import sys

PDF_PATH = "/home/z/my-project/upload/LISTA ATUALIZADA PROMPTS ACADEMY .pdf"
OUTPUT_PATH = "/home/z/my-project/upload/extracted_prompts.json"

# Category detection patterns from title
CATEGORY_MAP = {
    "Natal": r'\b(natal|christmas|papai noel|árvore de natal|arvore de natal|guirlanda|presépio|presepio|xicara de natal|toalha de natal|almofada.*natal|cortina de luz natal|caixa de bolinha natal|bolinha.*natal|jogo americano|projetor natal|estrela.*natal|caixa de natal|arvore de natal|toalha de mesa)\b',
    "Gancho": r'\b(gancho|ganho)\b',
    "Transição": r'\b(transi[cç][aã]o|rtansi[cç]ao)\b',
    "POV": r'\b(pov|poiv)\b',
    "Unboxing": r'\b(unboxing|abrindo pacote|abrindo o saco)\b',
    "Movimento": r'\b(movimento|movimentos)\b',
    "Modelo": r'\b(modelo|manequim|desfilando)\b',
    "Casal": r'\b(casal|couple)\b',
    "Masculino": r'\b(masculino|mascuilino)\b',
}

# Compile patterns
CATEGORY_PATTERNS = {k: re.compile(v, re.IGNORECASE) for k, v in CATEGORY_MAP.items()}

# Section header pattern
SECTION_HEADER_RE = re.compile(
    r'^\s*(CATEGORIA\s*[-–]\s*|SECCAO\s*|SEÇÃO\s*)(.+?)\s*[-–]?\s*$',
    re.IGNORECASE
)

# Prompt start markers (ordered by specificity)
PROMPT_START_MARKERS = [
    re.compile(r'View\s+Prompt\s*→\s*', re.IGNORECASE),
    re.compile(r'padrao\s+prompts\s*[-–]?\s*', re.IGNORECASE),
    re.compile(r'PROMPT\s+GERAL\s*[-–]?\s*', re.IGNORECASE),
    re.compile(r'PROMPT\s*[-–]\s*', re.IGNORECASE),  # "PROMPT -" or "PROMPT –"
]

# Variant prompt markers (these are alternative versions, not the main prompt)
VARIANT_MARKERS = re.compile(
    r'(?:'
    r'(?:__\s*)?PROMPT\s+PARA\s+O\s+FLOW'
    r'|(?:__\s*)?prompt\s+para\s+o\s+flow'
    r'|(?:__\s*)?PROMPT\s+FLOW'
    r'|(?:__\s*)?prompt\s+flow'
    r'|(?:__\s*)?PROMPT\s+GROK'
    r'|(?:__\s*)?prompt\s+grok'
    r'|(?:__\s*)?PROMPT\s+PRO\s+KLING'
    r'|(?:__\s*)?prompt\s+pro\s+kling'
    r'|(?:__\s*)?PROMPT\s+KLING'
    r'|PROMPT\s+PARA\s+O\s+GROK'
    r'|Copiar\s+prompt'
    r')',
    re.IGNORECASE
)


def extract_all_text(pdf_path):
    """Extract text from all pages."""
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        total = len(pdf.pages)
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            pages.append((i + 1, text))
            if (i + 1) % 200 == 0:
                print(f"  Extracted page {i+1}/{total}", file=sys.stderr)
    return pages


def split_into_blocks(all_text):
    """
    Split document text into blocks separated by separator lines.
    Separators: lines that are mostly —, -, =, ━, ═ chars (at least 10).
    """
    lines = all_text.split('\n')
    sep_re = re.compile(r'^[\s]*[—–_]?[—–_=━═\-\s]{10,}$')
    
    blocks = []
    current_lines = []
    
    for line in lines:
        stripped = line.strip()
        if sep_re.match(stripped) and len(stripped) >= 10:
            if current_lines:
                blocks.append('\n'.join(current_lines))
                current_lines = []
        else:
            current_lines.append(line)
    
    if current_lines:
        blocks.append('\n'.join(current_lines))
    
    return blocks


def extract_title(block_text):
    """Extract the title from a block - first meaningful line."""
    lines = block_text.split('\n')
    skip_words = {'Before', 'After', 'LISTA ATUALIZADA PROMPTS ACADEMY'}
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if stripped in skip_words:
            continue
        return stripped
    return ""


def extract_link(block_text):
    """Extract reference link from block."""
    m = re.search(
        r'(?:LINK\s+IMAGEM(?:\s+OU\s+VIDEO|\s+E\s+VIDEO)?|link\s+imagem(?:\s+ou\s+video|\s+E\s+VIDEO)?)\s*[-–]?\s*\n?\s*(https?://[^\s]+)',
        block_text, re.IGNORECASE
    )
    if m:
        return m.group(1).strip()
    # Also try LINKL variant
    m = re.search(r'LINKL?\s+IMAGEM.*?\n\s*[-–]?\s*(https?://[^\s]+)', block_text, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    return ""


def extract_detail_note(block_text):
    """
    Extract DETALHE note - these are short tips/instructions.
    The DETALHE marker appears as a section label (on its own line or with a dash),
    NOT as the word "detalhes" embedded in prompt text.
    """
    # Require DETALHE to be at start of a line or after newline, with word boundary
    # This avoids matching "detalhes" (plural) inside prompt text
    m = re.search(r'(?:^|\n)\s*DETALHE\b\s*[-–]?\s*\n?\s*💡?\s*', block_text, re.IGNORECASE)
    if not m:
        return ""
    
    start = m.end()
    remaining = block_text[start:]
    
    # The detail note ends at the next structural element:
    end_patterns = [
        r'(?:link|LINK)\s+(?:imagem|IMAGEM)',
        r'(?:padrao|PADRAO)\s+(?:prompts|PROMPTS)',
        r'\bPROMPT\b',
        r'View\s+Prompt',
        r'https?://',
        r'\n\s*[-—–_=]{5,}',  # separator-like line
    ]
    end_re = re.compile('|'.join(f'({p})' for p in end_patterns), re.IGNORECASE)
    
    end_match = end_re.search(remaining)
    if end_match:
        note = remaining[:end_match.start()].strip()
    else:
        # Take first paragraph
        parts = re.split(r'\n\s*\n', remaining, maxsplit=1)
        note = parts[0].strip()
    
    # Detail notes are short tips - if we captured >250 chars, it's likely wrong
    if len(note) > 250:
        # Truncate at first newline or 200 chars
        first_line = note.split('\n')[0].strip()
        if len(first_line) <= 200:
            note = first_line
        else:
            note = note[:200].strip()
    
    return note


def extract_prompt_text(block_text, title=""):
    """
    Extract the MAIN prompt text from a block.
    The main prompt is the first/primary one (not FLOW/GROK/KLING variants).
    Strips the title, link, and DETALHE prefix from the beginning if no explicit
    prompt marker is found.
    """
    # Find the earliest prompt start marker
    best_start = None
    best_end = None
    
    for marker_re in PROMPT_START_MARKERS:
        m = marker_re.search(block_text)
        if m:
            if best_start is None or m.start() < best_start:
                best_start = m.start()
                best_end = m.end()
    
    if best_start is None:
        # No explicit marker found. Look for common prompt opening phrases.
        fallback_patterns = [
            re.compile(r'Crie um vídeo', re.IGNORECASE),
            re.compile(r'Create a\s+\d', re.IGNORECASE),
            re.compile(r'Create an?\s+\d', re.IGNORECASE),
            re.compile(r'Use\s+(?:the\s+)?(?:provided\s+)?reference\s+image', re.IGNORECASE),
            re.compile(r'Crie um', re.IGNORECASE),
            re.compile(r'Create an?\s+\w', re.IGNORECASE),
        ]
        for pat in fallback_patterns:
            m = pat.search(block_text)
            if m:
                if best_start is None or m.start() < best_start:
                    best_start = m.start()
                    best_end = m.start()  # Don't skip the opening text
    
    if best_start is None:
        # No prompt marker or fallback found.
        # Try to strip title/link/detalhe prefix and return the rest.
        prompt_text = _strip_prefix(block_text, title)
    else:
        # Extract from prompt start to end of block or until a variant marker
        remaining = block_text[best_end:]
        
        # Find the first variant marker in the remaining text
        variant_match = VARIANT_MARKERS.search(remaining)
        if variant_match:
            prompt_text = remaining[:variant_match.start()].strip()
        else:
            prompt_text = remaining.strip()
    
    # Clean trailing "Copiar prompt"
    prompt_text = re.sub(r'\s*Copiar\s+prompt\s*$', '', prompt_text, flags=re.IGNORECASE)
    
    # Strip title from start if accidentally included
    if title and prompt_text.startswith(title):
        prompt_text = prompt_text[len(title):].strip()
    
    return prompt_text.strip()


def _strip_prefix(text, title=""):
    """Strip title, link, DETALHE prefix from block text to get the prompt body."""
    lines = text.split('\n')
    skip_prefixes = [
        'Before', 'After', 'LISTA ATUALIZADA',
        'LINK IMAGEM', 'link imagem', 'LINKL IMAGEM',
        'DETALHE', 'https://', 'http://',
    ]
    
    # Find the first line that looks like prompt content
    start_idx = 0
    past_title = False
    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            continue
        # Skip known prefixes
        if any(stripped.lower().startswith(sp.lower()) for sp in skip_prefixes if not sp.startswith('http')):
            start_idx = i + 1
            continue
        if stripped.startswith('http://') or stripped.startswith('https://'):
            start_idx = i + 1
            continue
        # Skip the title line
        if not past_title and title and stripped.startswith(title[:20]):
            past_title = True
            start_idx = i + 1
            continue
        # Skip 💡 emoji line
        if stripped == '💡' or stripped == '':
            start_idx = i + 1
            continue
        # This looks like content - stop skipping
        break
    
    return '\n'.join(lines[start_idx:]).strip()


def identify_category(title, current_category):
    """Determine category from title or current context."""
    # Check if it's a section header
    m = SECTION_HEADER_RE.match(title)
    if m:
        return m.group(2).strip()
    
    # Check category patterns in title
    for cat_name, pattern in CATEGORY_PATTERNS.items():
        if pattern.search(title):
            return cat_name
    
    return current_category


def normalize_category(cat):
    """Normalize category names (e.g., 'GANCHO' -> 'Gancho')."""
    if not cat:
        return ""
    # Title case
    cat = cat.strip()
    # Known normalizations
    normalizations = {
        "GANCHO": "Gancho",
        "Gancho": "Gancho",
        "POV": "POV",
        "Natal": "Natal",
        "NATAL": "Natal",
        "Transição": "Transição",
        "TRANSICAO": "Transição",
        "TRANSIÇÃO": "Transição",
        "Modelo": "Modelo",
        "Casal": "Casal",
        "CASAL": "Casal",
        "Masculino": "Masculino",
        "MASCULINO": "Masculino",
        "Movimento": "Movimento",
        "Unboxing": "Unboxing",
        "CENARIOS": "Cenários",
        "ACESSORIOS": "Acessórios",
        "POV ROUPA FEMININA": "POV Roupa Feminina",
        "POV CALCADOS": "POV Calçados",
        "MOVIMENTOS LIVRES": "Movimentos Livres",
    }
    return normalizations.get(cat, cat)


def clean_title(title):
    """Clean up title."""
    title = title.strip()
    # Remove trailing dashes
    title = re.sub(r'\s*[-–]\s*$', '', title)
    # Normalize whitespace
    title = re.sub(r'\s+', ' ', title)
    # Remove leading special chars
    title = re.sub(r'^[\s_—–-]+', '', title)
    return title.strip()


def is_section_header(title):
    """Check if title is a section/category header, not a prompt."""
    return bool(SECTION_HEADER_RE.match(title))


def is_garbage_title(title):
    """Check if title is garbage/not a real prompt title."""
    cleaned = clean_title(title)
    if not cleaned:
        return True
    if len(cleaned) <= 2 and not re.search(r'[a-zA-Z]{2,}', cleaned):
        return True
    if cleaned in ('=', '---', '—'):
        return True
    return False


def main():
    print("Step 1: Extracting text from all pages...")
    pages = extract_all_text(PDF_PATH)
    print(f"  Extracted {len(pages)} pages")
    
    print("\nStep 2: Combining text and splitting into blocks...")
    all_text = ""
    for page_num, text in pages:
        all_text += f"\n{text}\n"
    
    blocks = split_into_blocks(all_text)
    print(f"  Found {len(blocks)} raw blocks")
    
    print("\nStep 3: Parsing blocks into prompts...")
    prompts = []
    current_category = ""
    order = 0
    
    for block in blocks:
        title = extract_title(block)
        
        # Skip garbage titles
        if is_garbage_title(title):
            continue
        
        title = clean_title(title)
        
        # Check if this is a section/category header
        if is_section_header(title):
            m = SECTION_HEADER_RE.match(title)
            if m:
                current_category = normalize_category(m.group(2).strip())
                print(f"  Category: '{current_category}'")
            continue
        
        # Determine category
        category = identify_category(title, current_category)
        category = normalize_category(category)
        
        # Extract components
        link = extract_link(block)
        detail_note = extract_detail_note(block)
        prompt_text = extract_prompt_text(block, title)
        # Check Before/After only in the first few lines (header area)
        header_lines = '\n'.join(block.split('\n')[:10])
        has_before = bool(re.search(r'\bBefore\b', header_lines))
        has_after = bool(re.search(r'\bAfter\b', header_lines))
        
        # Skip entries that have no real content
        if len(prompt_text) < 20 and not title:
            continue
        
        order += 1
        entry = {
            "title": title,
            "category": category,
            "prompt": prompt_text,
            "detailNote": detail_note,
            "hasBeforeImage": has_before,
            "hasAfterImage": has_after,
            "order": order,
        }
        
        if link:
            entry["referenceLink"] = link
        
        prompts.append(entry)
    
    print(f"\n  Parsed {len(prompts)} prompts")
    
    # Save
    print(f"\nStep 4: Saving to {OUTPUT_PATH}...")
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(prompts, f, ensure_ascii=False, indent=2)
    
    # Summary
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Total prompts: {len(prompts)}")
    
    # Category distribution
    cats = {}
    for p in prompts:
        cat = p["category"] or "(uncategorized)"
        cats[cat] = cats.get(cat, 0) + 1
    print(f"\nCategories:")
    for cat, count in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")
    
    # Stats
    prompt_lengths = [len(p["prompt"]) for p in prompts]
    print(f"\nPrompt text length stats:")
    print(f"  Min: {min(prompt_lengths)} chars")
    print(f"  Max: {max(prompt_lengths)} chars")
    print(f"  Avg: {sum(prompt_lengths)//len(prompt_lengths)} chars")
    
    detail_count = sum(1 for p in prompts if p["detailNote"])
    print(f"\nPrompts with detail notes: {detail_count}")
    link_count = sum(1 for p in prompts if "referenceLink" in p)
    print(f"Prompts with reference links: {link_count}")
    
    # Print first 5 as sample
    print(f"\nFirst 5 prompts (sample):")
    for p in prompts[:5]:
        print(f"\n  [{p['order']}] {p['title']}")
        print(f"      Category: {p['category']}")
        print(f"      Prompt length: {len(p['prompt'])} chars")
        print(f"      Detail: {p['detailNote'][:100] if p['detailNote'] else '(none)'}")
        print(f"      Before/After: {p['hasBeforeImage']}/{p['hasAfterImage']}")
        print(f"      Prompt preview: {p['prompt'][:200]}...")


if __name__ == "__main__":
    main()
