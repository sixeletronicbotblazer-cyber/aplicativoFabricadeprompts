#!/usr/bin/env python3
"""Parse the PromptVault docx (converted to markdown) into structured prompts."""
import json
import os
import re
import shutil

SRC_MD = "/tmp/docx_md.md"
SRC_MEDIA = "/tmp/docx_md_media/media"
DST_MEDIA = "/home/z/my-project/public/prompts/doc"
OUT_JSON = "/home/z/my-project/parsed_prompts.json"

os.makedirs(DST_MEDIA, exist_ok=True)

with open(SRC_MD, "r", encoding="utf-8") as f:
    md = f.read()

# Split into blocks by the "Copiar prompt" separator
raw_blocks = re.split(r"^Copiar prompt\s*$", md, flags=re.MULTILINE)

IMG_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)(?:\{[^}]*\})?")
TYPE_RE = re.compile(r"^(Imagem|Vídeo|Video)\s*$", re.MULTILINE)
HEADING_RE = re.compile(r"^###\s+(.+?)\s*$", re.MULTILINE)


def unescape_pandoc(s: str) -> str:
    s = s.replace(r"\[", "[").replace(r"\]", "]")
    s = s.replace(r"\"", '"').replace(r"\\", "\\")
    s = s.replace(r"\_", "_").replace(r"\*", "*").replace(r"\-", "-")
    s = s.replace("---", "—").replace("--", "–")
    return s


def clean_body(text: str) -> str:
    text = unescape_pandoc(text)
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    paragraphs = re.split(r"\n\s*\n", text)
    out = []
    for p in paragraphs:
        lines = [ln.strip() for ln in p.split("\n") if ln.strip()]
        if lines:
            out.append(" ".join(lines))
    return "\n\n".join(out).strip()


def infer_type_category(title: str, raw_type: str, body: str):
    t = title.lower()
    specific_type = raw_type
    category = "Imagem" if raw_type == "Imagem" else "Vídeo"

    if "selfie" in t:
        specific_type = "Selfie"
        category = "Selfie"
    elif t.startswith("pov") or "pov " in t or "pov:" in t or "pov-" in t:
        specific_type = "POV"
        category = "POV"
    elif t.startswith("ugc") or "ugc " in t:
        specific_type = "UGC"
        category = "UGC"
    elif "tiktok" in t or "carrinho" in t or "cta" in t or "promo" in t:
        specific_type = raw_type
        category = "TikTok Shop"
    elif "shopee" in t:
        specific_type = raw_type
        category = "Shopee"
    elif any(k in t for k in ["calçado", "sapato", "tênis", "suplemento", "garrafa", "capinha", "pet", "tenis"]):
        specific_type = "Produto"
        category = "Produto"
    elif any(k in t for k in ["roupa", "camisa", "langerie", "camisola", "meias", "meia", "lingerie", "cabide", "kit pov"]):
        specific_type = raw_type
        category = "Roupas"
    return specific_type, category


def infer_tags(title: str, specific_type: str, category: str, body: str) -> list:
    tags = []
    t = title.lower()
    if specific_type.lower() not in tags:
        tags.append(specific_type.lower())
    if category.lower() not in tags:
        tags.append(category.lower())

    kws = {
        "ugc": "ugc", "pov": "pov", "selfie": "selfie",
        "calçado": "calcado", "sapato": "sapato", "tênis": "tenis", "tenis": "tenis",
        "roupa": "roupa", "camisa": "camisa", "meia": "meia", "meias": "meias",
        "langerie": "langerie", "camisola": "camisola",
        "suplemento": "suplemento", "garrafa": "garrafa", "capinha": "capinha",
        "pet": "pet", "academia": "academia", "loja": "loja",
        "tiktok": "tiktokshop", "carrinho": "cta", "cta": "cta",
        "espelho": "espelho", "cama": "cama", "cozinha": "cozinha",
        "restaurante": "restaurante", "carro": "carro",
        "movimento": "movimento", "giro": "giro", "dancinha": "dancinha",
        "cabide": "cabide", "mala": "mala", "caixa": "caixa",
    }
    for kw, tag in kws.items():
        if kw in t and tag not in tags:
            tags.append(tag)
    seen = []
    for tg in tags:
        if tg not in seen:
            seen.append(tg)
    return seen[:5]


def make_description(title: str, body: str, specific_type: str, category: str) -> str:
    b = body.strip()
    snippet = ""

    # JSON-style video prompts: try to extract a human sentence
    if b.startswith("{"):
        for field in ['"visual_prompt"', '"prompt"', '"description"']:
            m = re.search(field + r'\s*:\s*"([^"]{15,})"', b)
            if m:
                snippet = m.group(1)
                break
        # fallback: first long quoted string
        if not snippet:
            m = re.search(r'"([^"]{30,})"', b)
            if m:
                snippet = m.group(1)

    if not snippet:
        # Take first sentence that is NOT an all-caps header
        for cand in re.split(r"(?<=[.!?])\s", b):
            cand = cand.strip()
            if not cand:
                continue
            # skip ALL-CAPS-ish headers (mostly uppercase, short)
            letters = [c for c in cand if c.isalpha()]
            if letters and sum(1 for c in letters if c.isupper()) / len(letters) > 0.7 and len(cand) < 80:
                continue
            snippet = cand
            break

    snippet = re.sub(r"\s+", " ", snippet).strip()
    snippet = re.sub(r"^\{.*?\}\s*", "", snippet)
    if len(snippet) > 140:
        snippet = snippet[:137].rstrip() + "…"

    # If the snippet still looks like raw JSON / a config header, fall back
    jsonish = (
        snippet.startswith("{")
        or snippet.startswith('"')
        or "aspect_ratio" in snippet[:40]
        or "text_to_image" in snippet[:40]
        or "video_generation" in snippet[:40]
    )
    if not snippet or len(snippet) < 15 or jsonish:
        t = title.lower()
        type_label = specific_type
        if type_label in ("Imagem", "Vídeo"):
            snippet = f"Prompt de {category.lower()} — {t}."
        else:
            snippet = f"Prompt {type_label.lower()} para criar {t}."
    return snippet


prompts = []
idx = 0
for block in raw_blocks:
    block = block.strip()
    if not block:
        continue
    img_match = IMG_RE.search(block)
    image_path = ""
    if img_match:
        image_path = img_match.group(2).strip()
    type_match = TYPE_RE.search(block)
    if not type_match:
        continue
    raw_type = type_match.group(1)
    if raw_type == "Video":
        raw_type = "Vídeo"
    heading_match = HEADING_RE.search(block)
    if not heading_match:
        continue
    title = heading_match.group(1).strip()
    after = block[heading_match.end():]
    body = clean_body(after)
    if not body:
        continue

    specific_type, category = infer_type_category(title, raw_type, body)
    tags = infer_tags(title, specific_type, category, body)
    description = make_description(title, body, specific_type, category)

    image_url = ""
    if image_path and os.path.exists(image_path):
        idx += 1
        ext = os.path.splitext(image_path)[1] or ".jpg"
        dst_name = f"img_{idx:03d}{ext}"
        shutil.copy2(image_path, os.path.join(DST_MEDIA, dst_name))
        image_url = f"/prompts/doc/{dst_name}"
    else:
        idx += 1

    prompts.append({
        "id": f"doc-{idx:03d}",
        "title": title,
        "type": specific_type,
        "rawType": raw_type,
        "category": category,
        "description": description,
        "tags": tags,
        "image": image_url,
        "prompt": body,
        "hasImage": bool(image_url),
    })

from collections import Counter

# Dedupe by title: if duplicates exist, keep the one with an image.
deduped = {}
for p in prompts:
    key = p["title"]
    if key not in deduped:
        deduped[key] = p
    else:
        # prefer the one that has an image
        if p["hasImage"] and not deduped[key]["hasImage"]:
            deduped[key] = p
prompts = list(deduped.values())

cat_counts = Counter(p["category"] for p in prompts)
type_counts = Counter(p["type"] for p in prompts)
no_img = sum(1 for p in prompts if not p["hasImage"])

print(f"Total prompts parsed: {len(prompts)}")
print(f"Prompts with image: {sum(1 for p in prompts if p['hasImage'])}")
print(f"Prompts without image: {no_img}")
print("Category counts:", dict(cat_counts))
print("Type counts:", dict(type_counts))

with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(prompts, f, ensure_ascii=False, indent=2)
print(f"\nWrote {OUT_JSON}")
print(f"Images copied to {DST_MEDIA}")
