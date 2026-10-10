#!/usr/bin/env python3
"""Comprehensive prompt parser for both PDF documents - v2."""

import json
import re


def clean(line):
    """Remove zero-width spaces and strip."""
    return line.replace('\u200b', '').strip()


def is_separator(line, min_len=30):
    """Check if a line is a horizontal rule separator."""
    cl = clean(line)
    if not cl:
        return False
    if len(cl) >= min_len and re.match(r'^[—–―\-_═━=]+$', cl):
        return True
    return False


def parse_faceless(content):
    """Parse FACELESS PDF prompts using multiple detection strategies."""
    prompts = {}
    lines = content.split('\n')
    
    # Strategy: Find all prompt entry points using multiple signals:
    # 1. "prompts -" marker (the name is the previous non-empty line)
    # 2. 💡 marker (the name is the previous non-empty line)
    # 3. Long dividers followed by a name
    
    # First, find all positions where a new prompt starts
    prompt_starts = []  # (line_index, name)
    
    # Strategy 1: Find "prompts -" markers
    for i, line in enumerate(lines):
        cl = clean(line)
        if re.match(r'^prompts\s*-', cl, re.IGNORECASE):
            # Name is the previous non-empty line
            for j in range(i-1, max(i-5, -1), -1):
                candidate = clean(lines[j])
                if candidate and candidate != '💡' and not is_separator(lines[j], 10):
                    prompt_starts.append((j, candidate))
                    break
    
    # Strategy 2: Find 💡 markers where the previous line is a name
    for i, line in enumerate(lines):
        cl = clean(line)
        if cl == '💡' or cl.startswith('💡'):
            # Name is the previous non-empty line
            for j in range(i-1, max(i-5, -1), -1):
                candidate = clean(lines[j])
                if candidate and candidate != '💡' and not is_separator(lines[j], 10):
                    # Skip document-level elements
                    if 'PROMPTS DOS VIDEOS FACELESS' in candidate:
                        continue
                    if candidate.startswith('Novidades'):
                        continue
                    prompt_starts.append((j, candidate))
                    break
    
    # Strategy 3: After long dividers, find the name
    for i, line in enumerate(lines):
        if is_separator(line, 50):
            # Look for name after this line
            for j in range(i+1, min(i+10, len(lines))):
                candidate = clean(lines[j])
                if not candidate:
                    continue
                # Skip short dash lines
                if is_separator(lines[j], 10):
                    continue
                if candidate == '💡':
                    continue
                # Skip document title
                if 'PROMPTS DOS VIDEOS FACELESS' in candidate:
                    continue
                if candidate.startswith('Novidades'):
                    continue
                prompt_starts.append((j, candidate))
                break
    
    # Deduplicate and sort by line position
    seen_positions = set()
    unique_starts = []
    for pos, name in sorted(prompt_starts, key=lambda x: x[0]):
        if pos not in seen_positions:
            seen_positions.add(pos)
            unique_starts.append((pos, name))
    
    # Now collect text for each prompt: from the name line to the next name line (or end)
    for idx, (start_pos, name) in enumerate(unique_starts):
        # End is the start of the next prompt, or end of document
        if idx + 1 < len(unique_starts):
            end_pos = unique_starts[idx + 1][0]
        else:
            end_pos = len(lines)
        
        # Collect text: from the line after the name to end_pos
        # Skip the 💡 line and any short description line right after it
        text_lines = []
        started = False
        for i in range(start_pos + 1, end_pos):
            cl = clean(lines[i])
            # Skip the 💡 line
            if not started and (cl == '💡' or cl.startswith('💡')):
                continue
            # Skip short description lines like "coloque sua modelo..." or "neutro para..."
            # These are tips, not part of the actual prompt
            if not started and cl and (cl.startswith('coloque') or cl.startswith('neutro') 
                                       or cl.startswith('adicione') or cl.startswith('use a imagem')
                                       or cl.startswith('sempre') or cl.startswith('ideal')
                                       or cl.startswith('imagem sempre') or cl.startswith('deixe sempre')
                                       or cl.startswith('use sempre') or cl.startswith('sempre coloque')):
                continue
            started = True
            if cl:
                text_lines.append(cl)
            else:
                text_lines.append('')
        
        # Clean up: remove leading/trailing blank lines
        while text_lines and not text_lines[0]:
            text_lines.pop(0)
        while text_lines and not text_lines[-1]:
            text_lines.pop()
        
        text = '\n'.join(text_lines).strip()
        
        # Clean up name
        name = name.rstrip('​').strip()
        
        if name and text and len(text) > 50:  # Skip very short fragments
            # Handle duplicates
            if name in prompts:
                suffix = 2
                while f"{name} ({suffix})" in prompts:
                    suffix += 1
                name = f"{name} ({suffix})"
            prompts[name] = text
    
    return prompts


def parse_novos(content):
    """Parse LISTA DE PROMPTS NOVOS prompts."""
    prompts = {}
    lines = content.split('\n')
    
    # Similar multi-strategy approach
    prompt_starts = []  # (line_index, name)
    
    # Strategy 1: 💡 markers
    for i, line in enumerate(lines):
        cl = clean(line)
        if cl == '💡' or cl.startswith('💡'):
            for j in range(i-1, max(i-5, -1), -1):
                candidate = clean(lines[j])
                if candidate and candidate != '💡' and not is_separator(lines[j], 10):
                    if candidate.startswith('LISTA DE PROMPTS'):
                        continue
                    if candidate in ('NOME', 'PROMPT'):
                        continue
                    prompt_starts.append((j, candidate))
                    break
    
    # Strategy 2: Long dividers
    for i, line in enumerate(lines):
        if is_separator(line, 50):
            for j in range(i+1, min(i+10, len(lines))):
                candidate = clean(lines[j])
                if not candidate:
                    continue
                if is_separator(lines[j], 10):
                    continue
                if candidate == '💡':
                    continue
                if candidate.startswith('LISTA DE PROMPTS'):
                    continue
                if candidate in ('NOME', 'PROMPT'):
                    continue
                if candidate.startswith('CATEGORIA'):
                    continue
                if candidate.startswith('FLUXO'):
                    continue
                prompt_starts.append((j, candidate))
                break
    
    # Strategy 3: Look for prompt names without 💡 that appear after short dividers or standalone
    # In the NOVOS doc, some prompts don't have 💡 and are just name followed by text
    # Let's look for short lines that are followed by longer text blocks
    # and aren't part of an existing prompt
    
    # Deduplicate and sort
    seen_positions = set()
    unique_starts = []
    for pos, name in sorted(prompt_starts, key=lambda x: x[0]):
        if pos not in seen_positions:
            seen_positions.add(pos)
            unique_starts.append((pos, name))
    
    # Collect text for each prompt
    for idx, (start_pos, name) in enumerate(unique_starts):
        if idx + 1 < len(unique_starts):
            end_pos = unique_starts[idx + 1][0]
        else:
            end_pos = len(lines)
        
        text_lines = []
        started = False
        for i in range(start_pos + 1, end_pos):
            cl = clean(lines[i])
            if not started and (cl == '💡' or cl.startswith('💡')):
                continue
            if not started and cl and (cl.startswith('coloque') or cl.startswith('neutro') 
                                       or cl.startswith('adicione') or cl.startswith('use a imagem')
                                       or cl.startswith('sempre') or cl.startswith('ideal')
                                       or cl.startswith('use a modelo') or cl.startswith('NEUTRO')):
                continue
            started = True
            if cl:
                text_lines.append(cl)
            else:
                text_lines.append('')
        
        while text_lines and not text_lines[0]:
            text_lines.pop(0)
        while text_lines and not text_lines[-1]:
            text_lines.pop()
        
        text = '\n'.join(text_lines).strip()
        name = name.rstrip('​').strip()
        
        # Clean up names that start with dashes
        name = re.sub(r'^[—–―\-_═━=]+\s*', '', name).strip()
        
        if name and text and len(text) > 50:
            if name in prompts:
                suffix = 2
                while f"{name} ({suffix})" in prompts:
                    suffix += 1
                name = f"{name} ({suffix})"
            prompts[name] = text
    
    return prompts


def main():
    faceless_text = open('/home/z/my-project/tool-results/faceless_full.txt', 'r', encoding='utf-8').read()
    novos_text = open('/home/z/my-project/tool-results/novos_full.txt', 'r', encoding='utf-8').read()
    
    print("=== Parsing FACELESS ===")
    faceless = parse_faceless(faceless_text)
    print(f"Found {len(faceless)} prompts")
    for name in faceless:
        print(f"  - {name} ({len(faceless[name])} chars)")
    
    print(f"\n=== Parsing NOVOS ===")
    novos = parse_novos(novos_text)
    print(f"Found {len(novos)} prompts")
    for name in novos:
        print(f"  - {name} ({len(novos[name])} chars)")
    
    # Save
    result = {"faceless": faceless, "novos": novos}
    with open('/home/z/my-project/parsed_prompts.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"\nTotal: {len(faceless)} faceless + {len(novos)} novos = {len(faceless)+len(novos)} prompts")


if __name__ == '__main__':
    main()
