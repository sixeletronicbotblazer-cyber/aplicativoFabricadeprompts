#!/usr/bin/env python3
"""Comprehensive prompt parser for both PDF documents - v3 (final)."""

import json
import re
import sys


def clean(line):
    """Remove zero-width spaces and strip."""
    return line.replace('\u200b', '').strip()


def is_separator(line, min_len=5):
    """Check if a line is a horizontal rule separator."""
    cl = clean(line)
    if not cl or len(cl) < min_len:
        return False
    return bool(re.match(r'^[—–―\-_═━=]+$', cl))


def is_long_separator(line, min_len=50):
    return is_separator(line, min_len)


def find_prompt_names_faceless(lines):
    """Find all prompt entry points in the FACELESS document."""
    entries = []  # (name_line_idx, name_text)
    
    # Strategy 1: "prompts -" marker → name is the line before
    for i, line in enumerate(lines):
        cl = clean(line)
        if re.match(r'^prompts\s*-', cl, re.IGNORECASE):
            for j in range(i-1, max(i-5, -1), -1):
                candidate = clean(lines[j])
                if candidate and not is_separator(lines[j], 3):
                    entries.append((j, candidate))
                    break
    
    # Strategy 2: 💡 marker → name is the line before
    for i, line in enumerate(lines):
        cl = clean(line)
        if '💡' in cl:
            for j in range(i-1, max(i-5, -1), -1):
                candidate = clean(lines[j])
                if candidate and candidate != '💡' and not is_separator(lines[j], 3):
                    if 'PROMPTS DOS VIDEOS FACELESS' in candidate:
                        continue
                    if candidate.startswith('Novidades'):
                        continue
                    entries.append((j, candidate))
                    break
    
    # Strategy 3: After long dividers → look for name (may have short dash lines in between)
    for i, line in enumerate(lines):
        if is_long_separator(line, 50):
            # Look for name after this divider, skip short dashes and 💡
            for j in range(i+1, min(i+15, len(lines))):
                candidate = clean(lines[j])
                if not candidate:
                    continue
                if is_separator(lines[j], 3):
                    continue
                if candidate == '💡' or candidate.startswith('💡'):
                    continue
                if 'PROMPTS DOS VIDEOS FACELESS' in candidate:
                    continue
                if candidate.startswith('Novidades'):
                    continue
                # Skip structural keywords
                if candidate in ('NOME', 'PROMPT', 'FLUXO ESTRUTURA'):
                    continue
                entries.append((j, candidate))
                break
    
    # Deduplicate by line position, sort
    seen = set()
    unique = []
    for pos, name in sorted(entries, key=lambda x: x[0]):
        if pos not in seen:
            seen.add(pos)
            # Clean name: remove leading/trailing dashes and whitespace
            name = re.sub(r'^[—–―\-_═━=]+\s*', '', name).strip()
            name = re.sub(r'\s*[—–―\-_═━=]+$', '', name).strip()
            if name and not re.match(r'^[—–‖\-_═━=]+$', name):  # Skip if name is just dashes
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
                if candidate and candidate != '💡' and not is_separator(lines[j], 3):
                    if candidate.startswith('LISTA DE PROMPTS'):
                        continue
                    if candidate in ('NOME', 'PROMPT', 'FLUXO ESTRUTURA'):
                        continue
                    entries.append((j, candidate))
                    break
    
    # Strategy 2: Long dividers
    for i, line in enumerate(lines):
        if is_long_separator(line, 50):
            for j in range(i+1, min(i+15, len(lines))):
                candidate = clean(lines[j])
                if not candidate:
                    continue
                if is_separator(lines[j], 3):
                    continue
                if candidate == '💡' or candidate.startswith('💡'):
                    continue
                if candidate.startswith('LISTA DE PROMPTS'):
                    continue
                if candidate.startswith('CATEGORIA'):
                    continue
                if candidate in ('NOME', 'PROMPT', 'FLUXO ESTRUTURA'):
                    continue
                entries.append((j, candidate))
                break
    
    # Strategy 3: First prompt (Gancho oculos + CTA) - may not have a divider before it
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
            name = re.sub(r'^[—–‖\-_═━=]+\s*', '', name).strip()
            name = re.sub(r'\s*[—–‖\-_═━=]+$', '', name).strip()
            if name and not re.match(r'^[—–‖\-_═━=]+$', name):
                unique.append((pos, name))
    
    return unique


def collect_prompt_text(lines, start_pos, end_pos, skip_tip_lines=True):
    """Collect the prompt text between start_pos and end_pos.
    
    Skips the 💡 line and short tip/description lines at the beginning.
    """
    tip_prefixes = [
        'coloque', 'neutro', 'adicione', 'use a imagem', 'sempre',
        'ideal', 'imagem sempre', 'deixe sempre', 'use sempre',
        'sempre coloque', 'use a modelo', 'NEUTRO', 'coloque a foto',
        'caso a peça', 'se quiser',
    ]
    
    text_lines = []
    started = False
    
    for i in range(start_pos, end_pos):
        cl = clean(lines[i])
        
        # Skip 💡 lines
        if not started and ('💡' in cl):
            continue
        
        # Skip tip/description lines at the beginning
        if skip_tip_lines and not started and cl:
            is_tip = any(cl.lower().startswith(p) for p in tip_prefixes)
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


def parse_document(lines, find_names_fn, doc_name):
    """Parse a document and extract all prompts."""
    entries = find_names_fn(lines)
    prompts = {}
    
    print(f"\n{doc_name}: Found {len(entries)} prompt entries")
    
    for idx, (start_pos, name) in enumerate(entries):
        # End position: start of next prompt
        if idx + 1 < len(entries):
            end_pos = entries[idx + 1][0]
        else:
            end_pos = len(lines)
        
        # Collect text AFTER the name line
        text = collect_prompt_text(lines, start_pos + 1, end_pos)
        
        if name and text and len(text) > 30:
            # Handle duplicates
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
    
    # Parse FACELESS
    faceless = parse_document(faceless_lines, find_prompt_names_faceless, "FACELESS")
    for name in faceless:
        print(f"  - {name} ({len(faceless[name])} chars)")
    
    # Parse NOVOS
    novos = parse_document(novos_lines, find_prompt_names_novos, "NOVOS")
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
    print(f"Saved to: /home/z/my-project/parsed_prompts.json")


if __name__ == '__main__':
    main()
