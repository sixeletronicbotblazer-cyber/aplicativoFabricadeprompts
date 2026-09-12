#!/usr/bin/env python3
"""
Re-extract prompts from PDF with CORRECT grouping - v4.

Key insight: Title is always at the BEGINNING of a section (right after divider).
LINK IMAGEM markers come after the title.
Prompt text comes after the LINK markers/URLs.

Strategy:
1. Split text at divider lines into sections
2. For each section, extract title from the first few lines
3. Find LINK markers and URLs within the section
4. Extract prompt text after URLs
5. If section has multiple LINK markers, split into sub-prompts
"""

import fitz
import re
import json
import unicodedata

PDF_PATH = "/home/z/my-project/upload/LISTA ATUALIZADA PROMPTS ACADEMY .pdf"
OUTPUT_PATH = "/home/z/my-project/upload/re_extracted_prompts_v2.json"

def slugify(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'[^\w\s-]', '', text.lower())
    text = re.sub(r'[-\s]+', '-', text).strip('-')
    return text[:60]

def classify_url(url):
    if '/ref_' in url:
        if '.mp4' in url: return 'ref_video'
        return 'ref_image'
    if url.split('/')[-1].endswith('.mp4') or '.mp4#t=' in url: return 'video'
    return 'image'

def extract_timestamp(url):
    filename = url.split('/')[-1].replace('ref_', '')
    m = re.match(r'(\d+)_', filename)
    return m.group(1) if m else None

def clean_text(text):
    text = re.sub(r'[\u200b\u200c\u200d\ufeff\u200e\u200f\u200a\u00ad\u200e\u200f‌​‌​‌​‌​‌​‌​‌​‌​‌​‌​‌​‌​‌​‌​‌​‌​‌​‌​‌​‌⁠]', '', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    lines = [l.strip() for l in text.split('\n')]
    return '\n'.join(lines).strip()

def clean_prompt(text):
    text = clean_text(text)
    # Remove UI elements
    for pat in [r'Copiar prompt\s*', r'View Prompt\s*→\s*', r'^Before\s*', r'^After\s*']:
        text = re.sub(pat, '', text, flags=re.IGNORECASE)
    # Remove LINK markers
    text = re.sub(r'LINK\s+IMAGEM[A-Zs]*\s*(?:[EÉ]\s*VIDEO\s*)?[-–—]?\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'link\s+imagem\s+ou\s+video\s*[-–—]?\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'LINK\s+VIDEO\s*[-–—]?\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'LINK\s+IMAGEM\s+0[-–—]\s*', '', text, flags=re.IGNORECASE)
    # Remove URLs
    text = re.sub(r'https?://[^\s\​\"\'\)\}>]+', '', text)
    text = re.sub(r'\bVIDEO\s*[-–—]\s*', '', text)
    text = re.sub(r'[—\-=]{15,}', '', text)
    text = re.sub(r'[💡🎯🔥⭐✨🎉🎁🎄🎅📌🎬]', '', text)
    return clean_text(text)

def infer_category(title):
    t = title.upper().strip()
    
    # Natal
    natal_kws = ['NATAL', 'PAPAI NOEL', 'NAVIDAD', 'XICARA', 'TOALHA', 
                 'ARVORE DE NATAL', 'CAIXA BOLINHA', 'GUIRLANDA', 
                 'ESTRELA.*NATAL', 'BOLINHA.*NATAL', 'PACOTE.*NATAL']
    is_natal = any(k in t for k in natal_kws)
    if 'ARVORE' in t and 'NATAL' in t: is_natal = True
    if 'ESTRELA' in t and ('NATAL' in t or 'ARVORE' in t): is_natal = True
    if 'CAIXA' in t and 'NATAL' in t: is_natal = True
    if 'BOLINHA' in t and ('NATAL' in t or 'ARVORE' in t): is_natal = True
    if 'PACOTE' in t and 'NATAL' in t: is_natal = True
    
    if is_natal:
        if any(k in t for k in ['PET', 'GATO', 'GATINHO', 'CACHORRO', 'DOG']):
            if 'GANCHO' in t: return 'Natal Gancho Pet'
            if 'POV' in t: return 'Natal POV Pet'
            return 'Natal Pet'
        if 'GANCHO' in t: return 'Natal Gancho'
        if 'POV' in t: return 'Natal POV'
        if 'TRANSI' in t: return 'Natal Transição'
        return 'Natal'
    
    if any(k in t for k in ['GANCHO', 'GANCHOS']) or t.startswith('GANHO'):
        if 'MASCULINO' in t or 'HOMEM' in t: return 'Gancho Masculino'
        if 'PET' in t: return 'Gancho Pet'
        return 'Gancho'
    
    if any(k in t for k in ['TRANSI', 'TROCA', 'RTANSICAO']): return 'Transição'
    
    if 'POV' in t or 'POIV' in t:
        if 'CENARIO' in t or 'CENÁRIO' in t: return 'POV Cenário'
        return 'POV'
    
    if 'CENARIO' in t or 'CENÁRIO' in t: return 'Cenário'
    
    if any(k in t for k in ['MODA', 'VESTIDO', 'LOOK', 'FIT']):
        if 'MOTO' in t: return 'Moda Moto'
        return 'Moda'
    
    if 'CASAL' in t: return 'Casal'
    if any(k in t for k in ['MASCULINO', 'MASCUILINO', 'MASCULI']): return 'Masculino'
    if 'MOVIMENTO' in t: return 'Movimento'
    if any(k in t for k in ['LINGERIE', 'BIKINI', 'PIJAMA', 'BODY SPLA', 'CINTA']): return 'Lingerie'
    if 'SELFIE' in t: return 'Selfie'
    if 'UGC' in t: return 'UGC'
    if any(k in t for k in ['PRODUTO', 'PRODUCT', 'LIVRO', 'MALA', 'BOLSA', 
                              'GARRAFINHA', 'OCULOS', 'RELOGIO', 'LIQUIDIFICADOR',
                              'VIDEO GAME']): return 'Produto'
    if any(k in t for k in ['PET', 'GATO', 'GATINHO', 'CACHORRO', 'DOG']): return 'PET'
    if any(k in t for k in ['INFANTIL', 'CRIANÇA', 'CRIANCA', 'BEBE', 'BEBÊ']): return 'Infantil'
    
    # More Moda/Gancho catches
    if any(k in t for k in ['MODELO', 'MANEQUIM', 'CAMISA', 'BLUSA', 'CROPPED', 
                              'REGATA', 'TOP', 'BERMUDA', 'CONJUNTO', 'KIT',
                              'ROUPA', 'ROUPI', 'FRONTAL', 'CAMISETA', 'SHORTINHO',
                              'CAMISTA', 'PACOTE', 'SEGURANDO']):
        if 'MOTO' in t or 'JET' in t: return 'Moda Moto'
        if 'MASCULINO' in t: return 'Masculino'
        if 'GANCHO' in t or 'GANHO' in t: return 'Gancho'
        if 'TRANSI' in t: return 'Transição'
        if 'CINTA' in t: return 'Lingerie'
        if 'PACOTE' in t or 'SEGURANDO' in t: return 'Gancho'
        return 'Moda'
    
    if 'CORACAO' in t or 'CORAÇÃO' in t: return 'Gancho'
    if 'ELEVADOR' in t: return 'Gancho'
    if 'BOLHAS' in t: return 'Movimento'
    if 'CHAP' in t: return 'Moda'
    if 'COCHICHANDO' in t: return 'Gancho'
    
    # Catch typos from PDF
    if any(k in t for k in ['JAQUETA', 'JAQUELA', 'MASCCULINO', 'MASCUKLINA', 'MASCUOLINA',
                              'CHURRASQUEIRA', 'MANEQUIM', 'MANEQUIN']):
        if any(k in t for k in ['MASC', 'JAQUETA', 'JAQUELA']): return 'Masculino'
        if 'CHURRASQUEIRA' in t: return 'Produto'
        return 'Moda'
    
    return 'Outro'

def infer_tags(title, category, has_video, has_ref):
    cat_map = {
        'Natal':'natal','Natal Pet':'natal-pet','Natal Gancho':'natal-gancho',
        'Natal Gancho Pet':'natal-gancho-pet','Natal POV':'natal-pov',
        'Natal POV Pet':'natal-pov-pet','Natal Transição':'natal-transicao',
        'Gancho':'gancho','Gancho Masculino':'gancho-masculino','Gancho Pet':'gancho-pet',
        'Transição':'transição','POV':'pov','POV Avançado':'pov-avancado',
        'POV Cenário':'pov-cenario','Moda':'moda','Moda Moto':'moda-moto',
        'Casal':'casal','Masculino':'masculino','Movimento':'movimento',
        'Lingerie':'lingerie','Selfie':'selfie','UGC':'ugc',
        'Produto':'produto','PET':'pet','Infantil':'infantil',
        'Cenário':'cenário','Acessório':'acessorio','Beleza':'beleza','Outro':'outro'
    }
    tags = [cat_map.get(category, 'outro')]
    tags.append('video' if has_video else 'imagem')
    if has_ref: tags.append('com-referencia')
    seen = set()
    return [t for t in tags if not (t in seen or seen.add(t))][:6]


def extract_prompts():
    doc = fitz.open(PDF_PATH)
    print(f"PDF: {len(doc)} pages")
    
    # Build full text
    full_text = ""
    for pn in range(len(doc)):
        page = doc[pn]
        text = page.get_text()
        text = re.sub(r'[\u200b\u200c\u200d\ufeff\u200e\u200f\u200a\u00ad]', '', text)
        full_text += text + "\n"
    
    # Remove header
    full_text = re.sub(r'^LISTA ATUALIZADA PROMPTS ACADEMY\s*', '', full_text)
    
    # Split at dividers - match lines that are primarily dashes/equals
    # Use a line-based approach to avoid matching divider lines with stray characters
    divider_pat = r'^[—\-=]{15,}[^\w]*$'  # Must be mostly dashes, no trailing word chars
    lines = full_text.split('\n')
    sections = []
    current_section_lines = []
    
    for line in lines:
        line_stripped = line.strip()
        # Also handle dividers with stray characters (like "===...W")
        if re.match(r'^[—\-=]{15,}', line_stripped):
            # This is a divider line - save current section and start new one
            section_text = '\n'.join(current_section_lines).strip()
            if section_text:
                sections.append(section_text)
            current_section_lines = []
        else:
            current_section_lines.append(line)
    
    # Don't forget the last section
    last_section = '\n'.join(current_section_lines).strip()
    if last_section:
        sections.append(last_section)
    
    print(f"Sections: {len(sections)}")
    
    # URL pattern
    url_pat = r'https?://auroraprompts\.com/storage/prompts/[^\s\​\"\'\)\}>]+'
    
    # Process each section
    prompts = []
    for sec_idx, sec_text in enumerate(sections):
        sec_text_clean = clean_text(sec_text)
        
        # Skip very short sections
        if len(sec_text_clean) < 20:
            continue
        
        # Extract title from the BEGINNING of the section
        title = extract_title(sec_text_clean)
        
        # Find all LINK markers
        link_pat = r'(?:LINK\s+IMAGEM[Ss]?\s*(?:[EÉ]\s*VIDEO\s*)?[-–—]?|link\s+imagem\s+ou\s+video\s*[-–—]?|LINK\s+VIDEO\s*[-–—]?|LINK\s+IMAGEM\s+0[-–—])'
        link_markers = list(re.finditer(link_pat, sec_text_clean, re.IGNORECASE))
        
        # Find all URLs
        url_matches = [(m.start(), m.end(), m.group().rstrip('​').rstrip('}')) 
                       for m in re.finditer(url_pat, sec_text_clean)]
        
        if not link_markers and not url_matches:
            # Section with text only, no media - skip
            continue
        
        # If there's only one LINK marker (or none), this is a single prompt
        if len(link_markers) <= 1:
            # Collect all URLs
            all_urls = [(url, classify_url(url)) for _, _, url in url_matches]
            
            # Extract prompt text
            prompt_text = extract_prompt_from_section(sec_text_clean, link_markers, url_matches)
            
            # Build entry
            entries = build_entries(title, all_urls, prompt_text, len(prompts) + 1)
            prompts.extend(entries)
        
        else:
            # Multiple LINK markers - split into sub-sections
            # Each sub-section is a separate prompt
            for i, lm in enumerate(link_markers):
                # Determine sub-section boundaries
                sub_start = lm.start()
                sub_end = link_markers[i+1].start() if i+1 < len(link_markers) else len(sec_text_clean)
                
                # Extract title for this sub-section
                # Look for title between previous LINK marker and this one
                if i == 0:
                    # First sub-section: title from section beginning
                    sub_title = title
                else:
                    # Look for title between previous LINK marker and this one
                    prev_lm_end = link_markers[i-1].end()
                    between = sec_text_clean[prev_lm_end:lm.start()].strip()
                    sub_title = extract_title_from_between(between)
                    if sub_title == "Sem título" or len(sub_title) < 3:
                        sub_title = title  # Fall back to section title
                
                # Collect URLs for this sub-section
                sub_urls = []
                for url_start, url_end, url in url_matches:
                    if sub_start <= url_start < sub_end:
                        sub_urls.append((url, classify_url(url)))
                
                # Extract prompt text
                sub_text = sec_text_clean[sub_start:sub_end]
                sub_prompt = extract_prompt_from_subsection(sub_text, lm.end() - sub_start)
                
                entries = build_entries(sub_title, sub_urls, sub_prompt, len(prompts) + 1)
                prompts.extend(entries)
    
    doc.close()
    return prompts


def extract_title(text):
    """Extract title from the beginning of a section."""
    lines = text.split('\n')
    title_parts = []
    
    for line in lines[:10]:  # Check first 10 lines
        line = line.strip()
        if not line:
            if title_parts:
                break  # Empty line after title = end of title
            continue
        
        # Skip non-title lines
        if re.match(r'^(Before|After|View\s+Prompt|Copiar|PROMPT|DETALHE|http|LINK)', line, re.IGNORECASE):
            if title_parts:
                break
            continue
        if re.match(r'^[—\-=\s]+$', line):
            continue
        if re.match(r'^[💡🎯🔥⭐✨🎉🎁🎄🎅📌🎬\s]+$', line):
            continue
        if line.startswith('Sim —'):
            continue
        # Skip lines that are just punctuation/braces
        if re.match(r'^[\}\{\]\[\(\)\s]+$', line):
            continue
        # Skip lines that start with divider chars
        if re.match(r'^[—\-=+_]+', line) and len(re.sub(r'[—\-=+_\s]', '', line)) < 5:
            continue
        
        # Very long lines are likely prompt text, not title
        if len(line) > 80 and title_parts:
            break
        # Single character titles (except known ones) are likely noise
        if len(line) <= 2 and not re.match(r'^[A-Z]\d*$', line):
            continue
        
        title_parts.append(line)
        
        # Most titles are 1-3 lines
        if len(title_parts) >= 3:
            break
    
    if not title_parts:
        return "Sem título"
    
    title = ' '.join(title_parts).strip()
    # Clean up stray divider chars from title
    title = re.sub(r'^[—\-=+_\s]+', '', title)
    title = re.sub(r'[—\-=+_\s]+$', '', title)
    title = re.sub(r'\s*[-–—]\s*$', '', title).strip()
    title = title.rstrip('.')
    return title if title else "Sem título"


def extract_title_from_between(text):
    """Extract title from text between two LINK markers."""
    lines = text.split('\n')
    title_parts = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if re.match(r'^(http|PROMPT|DETALHE|LINK|💡)', line, re.IGNORECASE):
            break
        if len(line) > 80:
            break
        if re.match(r'^[—\-=\s]+$', line):
            continue
        title_parts.append(line)
        if len(title_parts) >= 3:
            break
    
    if not title_parts:
        return "Sem título"
    
    title = ' '.join(title_parts).strip()
    title = re.sub(r'\s*[-–—]\s*$', '', title).strip()
    return title if title else "Sem título"


def extract_prompt_from_section(sec_text, link_markers, url_matches):
    """Extract prompt text from a section."""
    # Find PROMPT markers
    prompt_pat = (r'(PROMPT\s+PARA\s+O\s+\w+|PROMPT\s+GERAL|PROMPT\s+PADR[AÃ]O|PROMPT\s+GROK|'
                  r'PROMPT\s*[-–—]|PROMPT\s+[A-Z]|PROMMPT\s*[-–—]|PROMTP\s*[-–—]|'
                  r'padr[aã]o\s+prompts?\s*[-–—]|PROMPT-|PROMPT\s+-\s+```|'
                  r'PROMPT\s*[-–—]\s*UNIVERSAL|PROMPT\s*[-–—]\s*```|DETALHE\s+NO\s+COMANDO)')
    prompt_markers = list(re.finditer(prompt_pat, sec_text, re.IGNORECASE))
    
    if prompt_markers:
        # Use the first prompt marker
        return clean_prompt(sec_text[prompt_markers[0].start():])
    
    # No PROMPT marker - find text after URLs
    if url_matches:
        last_url_end = max(m[1] for m in url_matches)  # url_matches are tuples (start, end, url)
        after = sec_text[last_url_end:].strip()
        if len(after) > 30:
            return clean_prompt(after)
    
    # Use text after LINK marker if present
    if link_markers:
        after_link = sec_text[link_markers[0].end():].strip()
        # Skip past URLs
        url_pat = r'https?://[^\s\​\"\'\)\}>]+'
        url_in_after = list(re.finditer(url_pat, after_link))
        if url_in_after:
            after_urls = after_link[url_in_after[-1].end():].strip()
            if len(after_urls) > 30:
                return clean_prompt(after_urls)
    
    # Use the whole section as prompt text (minus title)
    return clean_prompt(sec_text)


def extract_prompt_from_subsection(sub_text, link_end_offset):
    """Extract prompt text from a sub-section."""
    # Find PROMPT markers after the link marker
    after_link = sub_text[link_end_offset:] if link_end_offset < len(sub_text) else ""
    
    prompt_pat = (r'(PROMPT\s+PARA\s+O\s+\w+|PROMPT\s+GERAL|PROMPT\s+PADR[AÃ]O|PROMPT\s+GROK|'
                  r'PROMPT\s*[-–—]|PROMPT\s+[A-Z]|PROMMPT\s*[-–—]|PROMTP\s*[-–—]|'
                  r'padr[aã]o\s+prompts?\s*[-–—]|PROMPT-|PROMPT\s+-\s+```|'
                  r'PROMPT\s*[-–—]\s*UNIVERSAL|PROMPT\s*[-–—]\s*```|DETALHE\s+NO\s+COMANDO)')
    prompt_markers = list(re.finditer(prompt_pat, after_link, re.IGNORECASE))
    
    if prompt_markers:
        return clean_prompt(after_link[prompt_markers[0].start():])
    
    # Skip past URLs
    url_pat = r'https?://[^\s\​\"\'\)\}>]+'
    url_matches = list(re.finditer(url_pat, after_link))
    if url_matches:
        after_urls = after_link[url_matches[-1].end():].strip()
        if len(after_urls) > 30:
            return clean_prompt(after_urls)
    
    return clean_prompt(after_link)


def build_entries(title, urls_with_type, prompt_text, counter_start):
    """Build prompt entries, handling multiple videos by splitting into separate prompts."""
    ref_images = []
    ref_videos = []
    videos = []
    images = []
    
    for url, url_type in urls_with_type:
        if url_type == 'ref_image': ref_images.append(url)
        elif url_type == 'ref_video': ref_videos.append(url)
        elif url_type == 'video': videos.append(url)
        else: images.append(url)
    
    # Smart re-classification: generic images sharing timestamps with videos are ref images
    if images and (videos or ref_images):
        known_ts = {extract_timestamp(v) for v in videos} | {extract_timestamp(r) for r in ref_images}
        reclassified = []
        remaining = []
        for img in images:
            ts = extract_timestamp(img)
            if ts and ts in known_ts:
                reclassified.append(img)
            else:
                remaining.append(img)
        ref_images.extend(reclassified)
        images = remaining
    
    # If no ref images but we have images and a video, and the image is not a result,
    # it's likely a reference image (for prompts that say "use the provided reference image")
    if not ref_images and images and videos:
        # Images that share timestamps with videos are likely ref images
        video_timestamps = {extract_timestamp(v) for v in videos}
        reclassified = []
        remaining = []
        for img in images:
            ts = extract_timestamp(img)
            if ts and ts in video_timestamps:
                reclassified.append(img)
            else:
                remaining.append(img)
        if reclassified:
            ref_images.extend(reclassified)
            images = remaining
        elif len(images) == 1 and len(videos) == 1:
            # Single image with single video - likely a ref
            ref_images = images
            images = []
    
    # Also: if we have images but no video, and the prompt says "reference image",
    # the image is likely a ref image
    if not ref_images and images and not videos:
        # If there's exactly 1 image and no video, it's likely a ref image
        # (used as a reference for generating a video with another tool)
        if len(images) == 1:
            ref_images = images
            images = []
    
    entries = []
    
    # Handle multiple videos
    if len(videos) > 1:
        groups = {}
        for v in videos:
            ts = extract_timestamp(v) or f'unk_{len(groups)}'
            groups.setdefault(ts, {'refs': [], 'vids': [], 'imgs': []})
            groups[ts]['vids'].append(v)
        
        for r in ref_images + ref_videos:
            ts = extract_timestamp(r) or 'unknown'
            matched = False
            for gts, g in groups.items():
                if gts == ts or (ts and gts[:8] == ts[:8]):
                    g['refs'].append(r)
                    matched = True
                    break
            if not matched:
                next(iter(groups.values()))['refs'].append(r)
        
        for img in images:
            ts = extract_timestamp(img) or 'unknown'
            matched = False
            for gts, g in groups.items():
                if gts == ts or (ts and gts[:8] == ts[:8]):
                    g['refs'].append(img)
                    matched = True
                    break
            if not matched:
                next(iter(groups.values()))['imgs'].append(img)
        
        for gts, g in groups.items():
            e = _make_entry(title, g['refs'], g['vids'], g['imgs'], prompt_text, counter_start + len(entries))
            if e: entries.append(e)
    else:
        all_refs = ref_images + ref_videos
        e = _make_entry(title, all_refs, videos, images, prompt_text, counter_start)
        if e: entries.append(e)
    
    return entries


def _make_entry(title, ref_images, videos, images, prompt_text, counter):
    primary = ref_images[0] if ref_images else (images[0] if images else "")
    video = videos[0] if videos else ""
    ptype = "Vídeo" if video else "Imagem"
    cat = infer_category(title)
    tags = infer_tags(title, cat, bool(video), bool(ref_images))
    desc = re.sub(r'[💡🎯🔥⭐✨🎉🎁🎄🎅📌🎬]', '', title).strip()
    
    if not primary and not video and len(prompt_text) < 20:
        return None
    
    # Remove title from start of prompt
    pt = prompt_text
    if pt.startswith(title):
        rest = pt[len(title):].strip()
        if len(rest) > 50: pt = rest
    
    return {
        "id": f"pdf-v2-{counter:03d}-{slugify(title)}",
        "title": title.strip(),
        "type": ptype,
        "category": cat,
        "description": desc,
        "tags": tags,
        "image": primary,
        "referenceImages": ref_images,
        "videoUrl": video,
        "prompt": pt,
        "isNew": True,
        "recommended": False
    }


def main():
    print("=" * 60)
    print("PDF Prompt Extraction v4")
    print("=" * 60)
    
    prompts = extract_prompts()
    print(f"\nExtracted: {len(prompts)} prompts")
    
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(prompts, f, ensure_ascii=False, indent=2)
    print(f"Saved to: {OUTPUT_PATH}")
    
    # Stats
    total = len(prompts)
    wv = sum(1 for p in prompts if p['videoUrl'])
    wr = sum(1 for p in prompts if p['referenceImages'])
    wb = sum(1 for p in prompts if p['videoUrl'] and p['referenceImages'])
    io = sum(1 for p in prompts if p['image'] and not p['videoUrl'])
    vo = sum(1 for p in prompts if p['videoUrl'] and not p['referenceImages'])
    wt = sum(1 for p in prompts if len(p['prompt']) > 50)
    em = sum(1 for p in prompts if not p['prompt'] and not p['image'] and not p['videoUrl'])
    
    cats = {}
    for p in prompts:
        cats[p['category']] = cats.get(p['category'], 0) + 1
    rc = {}
    for p in prompts:
        c = len(p['referenceImages'])
        rc[c] = rc.get(c, 0) + 1
    
    print(f"\n{'='*60}\nSTATISTICS\n{'='*60}")
    print(f"Total:       {total}")
    print(f"Video:       {wv}")
    print(f"Ref imgs:    {wr}")
    print(f"Both:        {wb}")
    print(f"Img only:    {io}")
    print(f"Vid only:    {vo}")
    print(f"W/ text:     {wt}")
    print(f"Empty:       {em}")
    
    print(f"\n--- Categories ---")
    for c, n in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"  {c:25s} {n:3d}")
    
    print(f"\n--- Ref counts ---")
    for c, n in sorted(rc.items()):
        print(f"  {c} refs: {n}")
    
    print(f"\n--- First 5 ---")
    for p in prompts[:5]:
        print(f"  {p['id']}")
        print(f"    {p['title']}")
        print(f"    {p['category']} | {p['type']} | refs={len(p['referenceImages'])} | vid={'yes' if p['videoUrl'] else 'no'} | prompt={len(p['prompt'])}c")
    
    mr = [p for p in prompts if len(p['referenceImages']) > 1]
    print(f"\n--- Multi-ref ({len(mr)}) ---")
    for p in mr[:8]:
        print(f"  {p['title']}: {len(p['referenceImages'])} refs, vid={'yes' if p['videoUrl'] else 'no'}")
    
    out = [p for p in prompts if p['category'] == 'Outro']
    if out:
        print(f"\n--- Outro ({len(out)}) ---")
        for p in out[:12]:
            print(f"  {p['title'][:65]} | {p['type']} | refs={len(p['referenceImages'])} | vid={'yes' if p['videoUrl'] else 'no'}")


if __name__ == '__main__':
    main()
