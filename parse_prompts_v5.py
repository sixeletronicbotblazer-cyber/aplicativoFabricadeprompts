#!/usr/bin/env python3
"""Comprehensive prompt parser for both PDF documents - v5 (final)."""

import json
import re


def clean(line):
    """Remove zero-width spaces and strip."""
    return line.replace('\u200b', '').strip()


def is_prompt_divider(line, min_len=50):
    """Check if a line is a prompt-boundary divider (em-dash/hyphen based, NOT equals)."""
    cl = clean(line)
    if not cl or len(cl) < min_len:
        return False
    return bool(re.match(r'^[—–‖\-_═━]+$', cl))


def is_decorative_separator(line):
    """Check for short decorative dash lines (2-10 chars of dashes/equals)."""
    cl = clean(line)
    if not cl or len(cl) < 1:
        return False
    return bool(re.match(r'^[—–‖\-_═━=]+$', cl))


def skip_to_name(lines, start, max_look=15):
    """Skip decorative separators, 💡, and empty lines to find the actual prompt name."""
    skip_words = {'NOME', 'PROMPT', 'FLUXO ESTRUTURA'}
    skip_starts = ('LISTA DE PROMPTS', 'CATEGORIA', 'Novidades', 'PROMPTS DOS VIDEOS FACELESS')
    
    for j in range(start, min(start + max_look, len(lines))):
        candidate = clean(lines[j])
        if not candidate:
            continue
        if is_decorative_separator(lines[j]):
            continue
        if candidate == '💡' or candidate.startswith('💡'):
            continue
        if candidate in skip_words:
            continue
        if any(candidate.startswith(s) for s in skip_starts):
            continue
        # Found the name
        # Clean leading/trailing dashes
        name = re.sub(r'^[—–‖\-_═━=]+\s*', '', candidate).strip()
        name = re.sub(r'\s*[—–‖\-_═━=]+$', '', name).strip()
        if name and not re.match(r'^[—–‖\-_═━=]+$', name) and len(name) > 1:
            return j, name
    return None, None


# AI model names that appear in UI selectors, never actual prompt names
UI_MODEL_NAMES = {'Flow', 'Grok', 'Gemini', 'Kling', 'Aurora', 'Por Defecto'}


def find_prompt_names_faceless(lines):
    """Find all prompt entry points in the FACELESS document."""
    entries = []  # (name_line_idx, name_text)
    
    # Strategy 1: "prompts -" marker → name is the line before
    for i, line in enumerate(lines):
        cl = clean(line)
        if re.match(r'^prompts\s*-', cl, re.IGNORECASE):
            for j in range(i-1, max(i-5, -1), -1):
                candidate = clean(lines[j])
                if candidate and not is_decorative_separator(lines[j]):
                    entries.append((j, candidate))
                    break
    
    # Strategy 2: 💡 marker → name is the line before
    for i, line in enumerate(lines):
        cl = clean(line)
        if '💡' in cl:
            for j in range(i-1, max(i-5, -1), -1):
                candidate = clean(lines[j])
                if candidate and candidate != '💡' and not is_decorative_separator(lines[j]):
                    if 'PROMPTS DOS VIDEOS FACELESS' in candidate:
                        continue
                    if candidate.startswith('Novidades'):
                        continue
                    if candidate in UI_MODEL_NAMES:
                        continue
                    entries.append((j, candidate))
                    break
    
    # Strategy 3: After PROMPT-BOUNDARY dividers
    for i, line in enumerate(lines):
        if is_prompt_divider(line, 50):
            name_pos, name = skip_to_name(lines, i + 1)
            if name_pos is not None:
                if name in UI_MODEL_NAMES:
                    continue
                entries.append((name_pos, name))
    
    # Deduplicate by line position, sort
    seen = set()
    unique = []
    for pos, name in sorted(entries, key=lambda x: x[0]):
        if pos not in seen:
            seen.add(pos)
            unique.append((pos, name))
    
    return unique


def find_prompt_names_novos(lines):
    """Find all prompt entry points in the NOVOS document."""
    entries = []
    
    # Strategy 1: 💡 marker
    for i, line in enumerate(lines):
        cl = clean(line)
        if '💡' in cl:
            for j in range(i-1, max(i-5, -1), -1):
                candidate = clean(lines[j])
                if candidate and candidate != '💡' and not is_decorative_separator(lines[j]):
                    if candidate.startswith('LISTA DE PROMPTS'):
                        continue
                    if candidate in ('NOME', 'PROMPT', 'FLUXO ESTRUTURA'):
                        continue
                    entries.append((j, candidate))
                    break
    
    # Strategy 2: PROMPT-BOUNDARY dividers
    for i, line in enumerate(lines):
        if is_prompt_divider(line, 50):
            name_pos, name = skip_to_name(lines, i + 1)
            if name_pos is not None:
                entries.append((name_pos, name))
    
    # Strategy 3: First prompt explicitly
    for i, line in enumerate(lines):
        cl = clean(line)
        if cl == 'Gancho oculos + CTA':
            entries.append((i, cl))
            break
    
    # Deduplicate
    seen = set()
    unique = []
    for pos, name in sorted(entries, key=lambda x: x[0]):
        if pos not in seen:
            seen.add(pos)
            # Fix garbled names
            if name.startswith('}POV cropped/blu'):
                name = 'POV cropped/blusa'
            unique.append((pos, name))
    
    return unique


def collect_prompt_text(lines, start_pos, end_pos, skip_tips=True):
    """Collect prompt text between positions, skipping tips and UI elements."""
    tip_prefixes = [
        'coloque', 'neutro para', 'neutro qualquer', 'adicione', 'use a imagem',
        'sempre', 'ideal', 'imagem sempre', 'deixe sempre', 'use sempre',
        'sempre coloque', 'use a modelo', 'NEUTRO PARA', 'NEUTRO QUALQUER',
        'coloque a foto', 'caso a peça', 'se quiser',
    ]
    
    # UI selector elements to skip (model selector: a:, Por Defecto, ✦ Aurora, etc.)
    ui_patterns = {'a:', 'Por Defecto'}
    ui_names = {'Aurora', 'Grok', 'Gemini', 'Kling', 'Flow'}
    
    text_lines = []
    started = False
    
    for i in range(start_pos, end_pos):
        cl = clean(lines[i])
        
        # Skip 💡 lines at the beginning
        if not started and ('💡' in cl):
            continue
        
        # Skip UI selector elements at the beginning
        if not started and cl:
            if cl in ui_patterns or cl in ui_names:
                continue
            if cl.startswith('✦'):
                continue
        
        # Skip tip lines at the beginning
        if skip_tips and not started and cl:
            is_tip = any(cl.startswith(p) for p in tip_prefixes)
            if is_tip:
                continue
        
        started = True
        text_lines.append(cl)
    
    # Remove leading/trailing blank lines
    while text_lines and not text_lines[0]:
        text_lines.pop(0)
    while text_lines and not text_lines[-1]:
        text_lines.pop()
    
    return '\n'.join(text_lines).strip()


def parse_document(lines, find_names_fn, skip_tips=True):
    """Parse a document and extract all prompts."""
    entries = find_names_fn(lines)
    prompts = {}
    
    for idx, (start_pos, name) in enumerate(entries):
        # End: start of next prompt
        if idx + 1 < len(entries):
            end_pos = entries[idx + 1][0]
        else:
            end_pos = len(lines)
        
        # Collect text AFTER the name line
        text = collect_prompt_text(lines, start_pos + 1, end_pos, skip_tips=skip_tips)
        
        if name and text and len(text) > 30:
            final_name = name
            if final_name in prompts:
                suffix = 2
                while f"{final_name} ({suffix})" in prompts:
                    suffix += 1
                final_name = f"{final_name} ({suffix})"
            prompts[final_name] = text
    
    return prompts


def main():
    faceless_text = open('/home/z/my-project/tool-results/faceless_full.txt', 'r', encoding='utf-8').read()
    novos_text = open('/home/z/my-project/tool-results/novos_full.txt', 'r', encoding='utf-8').read()
    
    faceless_lines = faceless_text.split('\n')
    novos_lines = novos_text.split('\n')
    
    print("=== Parsing FACELESS ===")
    faceless = parse_document(faceless_lines, find_prompt_names_faceless, skip_tips=True)
    print(f"Found {len(faceless)} prompts:")
    for name in faceless:
        print(f"  - {name} ({len(faceless[name])} chars)")
    
    print(f"\n=== Parsing NOVOS ===")
    novos = parse_document(novos_lines, find_prompt_names_novos, skip_tips=False)
    print(f"Found {len(novos)} prompts:")
    for name in novos:
        print(f"  - {name} ({len(novos[name])} chars)")
    
    # Save result
    result = {"faceless": faceless, "novos": novos}
    with open('/home/z/my-project/parsed_prompts.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"\n=== SUMMARY ===")
    print(f"Faceless: {len(faceless)} prompts")
    print(f"Novos: {len(novos)} prompts")
    print(f"Total: {len(faceless) + len(novos)} prompts")


if __name__ == '__main__':
    main()
