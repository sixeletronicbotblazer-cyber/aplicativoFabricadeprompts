#!/usr/bin/env python3
"""Comprehensive prompt parser for both PDF documents."""

import json
import re


def load_full_text(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()


def find_long_dividers(lines):
    """Find indices of long horizontal rule lines (>30 chars of dashes)."""
    indices = []
    for i, line in enumerate(lines):
        stripped = line.strip().replace('\u200b', '')  # Remove zero-width spaces
        if stripped and len(stripped) > 30 and re.match(r'^[—–―\-_═━]+$', stripped):
            indices.append(i)
    return indices


def clean_line(line):
    """Remove zero-width spaces and strip."""
    return line.replace('\u200b', '').strip()


def parse_faceless(content):
    """Parse FACELESS PDF prompts."""
    prompts = {}
    lines = content.split('\n')
    
    # Strategy: Find prompt entry points using multiple signals:
    # 1. Long dividers (>30 chars horizontal rules)
    # 2. The very first prompt at the start
    
    divider_indices = find_long_dividers(lines)
    
    # Build section boundaries: start of each prompt section
    # First section starts at line 0 (after the document title)
    # Then each section starts after a divider
    
    # Find the start of the first actual prompt (skip title)
    first_prompt_start = None
    for i, line in enumerate(lines):
        cl = clean_line(line)
        if cl.lower().startswith('prompts -') or cl == 'Modelo banho na praia':
            # The name is on this line or the line before
            first_prompt_start = i
            break
    
    if first_prompt_start is None:
        first_prompt_start = 0
    
    # Build sections: each section is (start_line, end_line)
    sections = []
    
    # First section: from first_prompt_start to first divider
    if divider_indices:
        sections.append((first_prompt_start, divider_indices[0]))
    else:
        sections.append((first_prompt_start, len(lines)))
    
    # Subsequent sections: from after divider to next divider
    for di_idx in range(len(divider_indices)):
        start = divider_indices[di_idx] + 1
        end = divider_indices[di_idx + 1] if di_idx + 1 < len(divider_indices) else len(lines)
        sections.append((start, end))
    
    # Parse each section to extract prompt name and text
    for start, end in sections:
        section_lines = lines[start:end]
        
        # Find the prompt name: first non-empty, non-dash line
        name = None
        name_idx = None
        for i, line in enumerate(section_lines):
            cl = clean_line(line)
            if not cl:
                continue
            # Skip short dash lines
            if re.match(r'^[—–―\-_═━]+$', cl) and len(cl) < 30:
                continue
            # Skip 💡 on its own line
            if cl == '💡':
                continue
            # Skip document title
            if 'PROMPTS DOS VIDEOS FACELESS' in cl:
                continue
            if cl.startswith('Novidades'):
                continue
            # This should be the name
            name = cl
            name_idx = i
            break
        
        if not name:
            continue
        
        # Collect the prompt text: everything after the name line
        prompt_lines = []
        for i in range(name_idx + 1, len(section_lines)):
            cl = clean_line(section_lines[i])
            if cl:
                prompt_lines.append(cl)
            else:
                prompt_lines.append('')  # Preserve blank lines for readability
        
        # Also include the "prompts -" part if the name line has it
        # Check if name contains "prompts -"
        prompts_marker = re.match(r'^(.*?)\s*\nprompts\s*-', name + '\n' + '\n'.join(prompt_lines[:1]), re.IGNORECASE)
        
        # Clean up: remove leading/trailing blank lines
        while prompt_lines and not prompt_lines[0]:
            prompt_lines.pop(0)
        while prompt_lines and not prompt_lines[-1]:
            prompt_lines.pop()
        
        text = '\n'.join(prompt_lines).strip()
        
        if name and text:
            # Handle duplicate names
            if name in prompts:
                # Add suffix
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
    
    # Similar approach: split on long dividers
    divider_indices = find_long_dividers(lines)
    
    # Find first prompt start (skip title and structural elements)
    first_prompt_start = None
    for i, line in enumerate(lines):
        cl = clean_line(line)
        if cl == 'Gancho oculos + CTA':
            first_prompt_start = i
            break
    
    if first_prompt_start is None:
        first_prompt_start = 0
    
    # Build sections
    sections = []
    if divider_indices:
        sections.append((first_prompt_start, divider_indices[0]))
    else:
        sections.append((first_prompt_start, len(lines)))
    
    for di_idx in range(len(divider_indices)):
        start = divider_indices[di_idx] + 1
        end = divider_indices[di_idx + 1] if di_idx + 1 < len(divider_indices) else len(lines)
        sections.append((start, end))
    
    # Parse each section
    for start, end in sections:
        section_lines = lines[start:end]
        
        # Find prompt name
        name = None
        name_idx = None
        for i, line in enumerate(section_lines):
            cl = clean_line(line)
            if not cl:
                continue
            # Skip short dash lines
            if re.match(r'^[—–―\-_═━]+$', cl) and len(cl) < 30:
                continue
            # Skip 💡
            if cl == '💡':
                continue
            # Skip structural headers
            if cl.startswith('LISTA DE PROMPTS'):
                continue
            if cl.startswith('FLUXO ESTRUTURA'):
                continue
            if cl in ('NOME', 'PROMPT'):
                continue
            if cl.startswith('CATEGORIA'):
                continue
            # This should be the name
            name = cl
            name_idx = i
            break
        
        if not name:
            continue
        
        # Collect text after name
        prompt_lines = []
        for i in range(name_idx + 1, len(section_lines)):
            cl = clean_line(section_lines[i])
            if cl:
                prompt_lines.append(cl)
            else:
                prompt_lines.append('')
        
        # Clean up
        while prompt_lines and not prompt_lines[0]:
            prompt_lines.pop(0)
        while prompt_lines and not prompt_lines[-1]:
            prompt_lines.pop()
        
        text = '\n'.join(prompt_lines).strip()
        
        if name and text:
            if name in prompts:
                suffix = 2
                while f"{name} ({suffix})" in prompts:
                    suffix += 1
                name = f"{name} ({suffix})"
            prompts[name] = text
    
    return prompts


def main():
    faceless_text = load_full_text('/home/z/my-project/tool-results/faceless_full.txt')
    novos_text = load_full_text('/home/z/my-project/tool-results/novos_full.txt')
    
    print("=== Parsing FACELESS ===")
    faceless = parse_faceless(faceless_text)
    print(f"Found {len(faceless)} prompts")
    for name in faceless:
        print(f"  - {name} ({len(faceless[name])} chars)")
    
    print("\n=== Parsing NOVOS ===")
    novos = parse_novos(novos_text)
    print(f"Found {len(novos)} prompts")
    for name in novos:
        print(f"  - {name} ({len(novos[name])} chars)")
    
    # Save to JSON
    result = {
        "faceless": faceless,
        "novos": novos
    }
    
    with open('/home/z/my-project/parsed_prompts.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"\nSaved to parsed_prompts.json")
    print(f"Total faceless prompts: {len(faceless)}")
    print(f"Total novos prompts: {len(novos)}")


if __name__ == '__main__':
    main()
