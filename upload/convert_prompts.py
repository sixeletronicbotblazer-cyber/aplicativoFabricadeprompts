#!/usr/bin/env python3
"""
Convert 59 parsed prompts into the prompts-data.json format and append to existing data.
"""

import json
import re
import sys


def clean_link(link: str) -> str:
    """Strip 'Copiar' from end of URLs."""
    if link.endswith("Copiar"):
        link = link[: -len("Copiar")]
    return link


def is_video_url(link: str) -> bool:
    """Check if link is a video URL (Supabase video or catbox)."""
    return (
        "object/sign/prompt-media/video/" in link
        or "catbox.moe" in link
    )


def is_image_url(link: str) -> bool:
    """Check if link is an image URL (Supabase image or imgur)."""
    return (
        "render/image/sign/" in link
        or "imgur" in link
    )


def truncate_description(text: str, max_len: int = 150) -> str:
    """Truncate to max_len chars at word boundary."""
    if len(text) <= max_len:
        return text
    truncated = text[:max_len]
    # Find last space to break at word boundary
    last_space = truncated.rfind(" ")
    if last_space > max_len * 0.6:  # Only break at word if it's not too far back
        truncated = truncated[:last_space]
    return truncated + "…"


def generate_tags(title: str, prompt: str) -> list[str]:
    """Derive 2-4 lowercase tags from title and prompt content."""
    tags = set()
    title_lower = title.lower()
    prompt_lower = prompt.lower()

    # Title-based keyword mapping
    keyword_tag_map = [
        ("pov", "pov"),
        ("anel", "anel"),
        ("joia", "joia"),
        ("colar", "colar"),
        ("pulseira", "pulseira"),
        ("brincos", "brincos"),
        ("relogio", "relógio"),
        ("óculos", "óculos"),
        ("oculos", "óculos"),
        ("perfume", "perfume"),
        ("skin care", "skin care"),
        ("beleza", "beleza"),
        ("fronha", "fronha"),
        ("lençol", "lençol"),
        ("lencol", "lençol"),
        ("cama", "cama"),
        ("fruteira", "fruteira"),
        ("mobiliário", "mobiliário"),
        ("mobiliario", "mobiliário"),
        ("pet", "pet"),
        ("comedouro", "comedouro"),
        ("bebedouro", "bebedouro"),
        ("ração", "ração"),
        ("racao", "ração"),
        ("crianças", "infantil"),
        ("crianca", "infantil"),
        ("infantil", "infantil"),
        ("brinquedo", "brinquedos"),
        ("loja infantil", "infantil"),
        ("movimento", "movimento"),
        ("selfie", "selfie"),
        ("carro", "carro"),
        ("ugc", "ugc"),
        ("eletro", "eletro"),
        ("air fryer", "air fryer"),
        ("suplemento", "suplemento"),
        ("garrafa", "garrafa"),
        ("pacote", "pacote"),
        ("abrindo", "unboxing"),
        ("camisola", "camisola"),
        ("lingerie", "lingerie"),
        ("calçado", "calçado"),
        ("calcado", "calçado"),
        ("tênis", "tênis"),
        (("tenis", "calçado")),
        ("camiseta", "camiseta"),
        ("roupa", "roupa"),
        ("bolsa", "bolsa"),
        ("unha", "unhas"),
        ("produto", "produto"),
        ("banheiro", "banheiro"),
        ("conjunto", "conjunto"),
        ("cabide", "cabide"),
        ("caixa", "caixa"),
        ("elasticidade", "elasticidade"),
        ("transição", "transição"),
        ("transicao", "transição"),
        ("trocador", "trocador"),
        ("guia", "guia"),
        ("mão", "mão"),
        ("mao", "mão"),
    ]

    for keyword, tag in keyword_tag_map:
        if keyword in title_lower and tag not in tags:
            tags.add(tag)

    # Also check prompt for additional context
    prompt_keywords = [
        ("fotorrealista", "fotorrealista"),
        ("ultra-realista", "ultra-realista"),
        ("4k", "4k"),
        ("premium", "premium"),
        ("natural", "natural"),
        ("produto", "produto"),
        ("detalhe", "detalhes"),
        ("slow motion", "slow motion"),
        ("slow-motion", "slow motion"),
    ]
    for keyword, tag in prompt_keywords:
        if keyword in prompt_lower and tag not in tags and len(tags) < 5:
            tags.add(tag)

    # Ensure at least 2 tags
    if len(tags) < 2:
        if "pov" not in tags:
            tags.add("pov")
        if "produto" not in tags:
            tags.add("produto")

    # Limit to 4 tags
    tags = list(tags)[:4]
    return tags


def classify_entry(title: str):
    """Return (category, default_type) based on title analysis."""
    t = title.lower()

    # UGC
    if "ugc" in t:
        return "UGC", "UGC"

    # Selfie
    if t == "selfie no carro = influencer (imagem)" or "selfie no carro" in t:
        return "Selfie", "Selfie"

    # Movimento → Vídeo
    if "movimento" in t:
        return "Vídeo", "Vídeo"

    # PET
    pet_keywords = [
        "pet", "caixa de transporte pet", "comedouro",
        "bebedouro", "ração", "racao", "saco grande de ração",
        "saco grande de racao",
    ]
    for kw in pet_keywords:
        if kw in t:
            return "PET", "POV"

    # Crianças / infantil
    child_keywords = ["crianças", "infantil", "loja infantil", "brinquedos", "trocador"]
    for kw in child_keywords:
        if kw in t:
            return "Infantil", "POV"

    # POV patterns
    pov_prefixes = ["pov |", "pov -", "pov ", "ponto de vista |", "estilo pov"]
    for prefix in pov_prefixes:
        if t.startswith(prefix) or prefix.strip() + " " in t or prefix.strip() + "-" in t:
            break
    else:
        # Check non-POV-starting titles
        pov_prefixes_check = ["pov", "ponto de vista"]
        is_pov = any(p in t for p in pov_prefixes_check)

    # Check specific categories
    # Beleza/Perfume/Skin Care
    beauty_keywords = ["beleza", "perfume", "skin care"]
    for kw in beauty_keywords:
        if kw in t:
            return "POV Avançado", "POV"

    # Joias/Acessórios
    jewelry_keywords = [
        "brincos", "joia", "anel", "colar", "pulseira",
        "relogio", "relógio", "óculos", "oculos",
    ]
    for kw in jewelry_keywords:
        if kw in t:
            return "POV Avançado", "POV"

    # Roupa/Acessórios pessoais
    clothing_keywords = [
        "camisola", "lingerie", "calçado", "calcado", "camiseta",
        "roupa", "bolsa", "tênis", "tenis", "unha",
    ]
    for kw in clothing_keywords:
        if kw in t:
            return "POV Avançado", "POV"

    # Casa/POV keywords
    casa_keywords = ["fronha", "lençol", "lencol", "roupa de cama", "mobiliário", "mobiliario", "fruteira", "cama"]
    for kw in casa_keywords:
        if kw in t:
            return "POV Avançado", "POV"

    # Eletros
    if "eletro" in t:
        return "POV Avançado", "POV"

    # Suplemento
    if "suplemento" in t:
        return "POV Avançado", "POV"

    # Garrafa
    if "garrafa" in t:
        return "POV Avançado", "POV"

    # Pacote
    if "pacote" in t or "abrindo" in t:
        return "POV Avançado", "POV"

    # Default: POV prefix titles
    if any(p in t for p in ["pov |", "pov-", "ponto de vista"]):
        return "POV Avançado", "POV"

    # Casa prefix
    if "casa" in t:
        return "POV Avançado", "POV"

    return "POV Avançado", "POV"


def convert_entries(parsed: list[dict]) -> list[dict]:
    """Convert parsed prompts to the target format."""
    results = []
    id_counter = 1

    for entry in parsed:
        title = entry["title"].strip()
        link = clean_link(entry.get("link", ""))
        image_prompt = entry.get("image_prompt") or ""
        video_prompt = entry.get("video_prompt") or ""

        has_img = bool(image_prompt)
        has_vid = bool(video_prompt)

        link_is_video = is_video_url(link)
        link_is_image = is_image_url(link)

        category, default_type = classify_entry(title)

        if has_img and has_vid:
            # Split into two entries
            # Image entry
            img_entry = {
                "id": f"aug22-{id_counter:03d}a",
                "title": title + " (Imagem)",
                "type": "Imagem",
                "category": category,
                "description": truncate_description(image_prompt),
                "tags": generate_tags(title, image_prompt),
                "image": link if link_is_image else "",
                "prompt": image_prompt,
                "isNew": True,
            }
            results.append(img_entry)

            # Video entry
            vid_entry = {
                "id": f"aug22-{id_counter:03d}b",
                "title": title + " (Vídeo)",
                "type": "Vídeo",
                "category": category,
                "description": truncate_description(video_prompt),
                "tags": generate_tags(title, video_prompt),
                "image": "",
                "prompt": video_prompt,
                "isNew": True,
                "videoUrl": link if link_is_video else "",
            }
            results.append(vid_entry)

        elif has_vid and not has_img:
            # Video-only entry — use default_type from classifier (e.g. UGC, Selfie)
            vid_entry = {
                "id": f"aug22-{id_counter:03d}",
                "title": title,
                "type": default_type,
                "category": category,
                "description": truncate_description(video_prompt),
                "tags": generate_tags(title, video_prompt),
                "image": "",
                "prompt": video_prompt,
                "isNew": True,
                "videoUrl": link if link_is_video else "",
            }
            results.append(vid_entry)

        elif has_img and not has_vid:
            # Image-only entry — use default_type from classifier (e.g. Selfie)
            img_entry = {
                "id": f"aug22-{id_counter:03d}",
                "title": title,
                "type": default_type,
                "category": category,
                "description": truncate_description(image_prompt),
                "tags": generate_tags(title, image_prompt),
                "image": link if link_is_image else "",
                "prompt": image_prompt,
                "isNew": True,
            }
            results.append(img_entry)

        id_counter += 1

    return results


def main():
    # Read parsed prompts
    with open("/home/z/my-project/upload/parsed_prompts.json", "r", encoding="utf-8") as f:
        parsed = json.load(f)

    print(f"Read {len(parsed)} parsed entries")

    # Read existing prompts data
    with open("/home/z/my-project/src/lib/prompts-data.json", "r", encoding="utf-8") as f:
        existing = json.load(f)

    print(f"Read {len(existing)} existing entries")

    # Convert
    new_entries = convert_entries(parsed)
    print(f"Generated {len(new_entries)} new entries")

    # Summary by type
    type_counts = {}
    cat_counts = {}
    for e in new_entries:
        t = e["type"]
        c = e["category"]
        type_counts[t] = type_counts.get(t, 0) + 1
        cat_counts[c] = cat_counts.get(c, 0) + 1
    print(f"By type: {json.dumps(type_counts)}")
    print(f"By category: {json.dumps(cat_counts)}")

    # Check for duplicate titles
    titles = [e["title"] for e in new_entries]
    seen = set()
    for t in titles:
        if t in seen:
            print(f"WARNING: Duplicate title: {t}")
        seen.add(t)

    # Append to existing
    combined = existing + new_entries
    print(f"Total combined: {len(combined)} entries")

    # Write output
    output_path = "/home/z/my-project/src/lib/prompts-data.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(combined, f, ensure_ascii=False, indent=2)

    print(f"Wrote {output_path}")

    # Validate JSON
    with open(output_path, "r", encoding="utf-8") as f:
        validated = json.load(f)
    print(f"Validated: {len(validated)} entries - JSON is valid")

    # Print first and last new entry for verification
    print("\n--- First 3 new entries ---")
    for e in new_entries[:3]:
        print(f'  {e["id"]}: {e["title"][:60]} | type={e["type"]} | cat={e["category"]} | image={"yes" if e["image"] else "no"} | videoUrl={"yes" if e.get("videoUrl") else "no"}')

    print("\n--- Last 3 new entries ---")
    for e in new_entries[-3:]:
        print(f'  {e["id"]}: {e["title"][:60]} | type={e["type"]} | cat={e["category"]} | image={"yes" if e["image"] else "no"} | videoUrl={"yes" if e.get("videoUrl") else "no"}')

    # Print entries with video URLs
    vid_entries = [e for e in new_entries if e.get("videoUrl")]
    print(f"\n--- Entries with videoUrl ({len(vid_entries)}) ---")
    for e in vid_entries:
        print(f'  {e["id"]}: {e["title"][:60]}')


if __name__ == "__main__":
    main()
