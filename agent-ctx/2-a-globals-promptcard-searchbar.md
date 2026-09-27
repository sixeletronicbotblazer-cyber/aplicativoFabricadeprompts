# Task 2-a: globals.css + PromptCard + SearchBar Premium Redesign

## Agent
Sub-agent (globals.css + PromptCard + SearchBar premium redesign)

## Task
Redesign globals.css, PromptCard.tsx, and SearchBar.tsx to match premium dark Aurora Prompts style

## Files Modified
- `src/app/globals.css`
- `src/components/promptvault/PromptCard.tsx`
- `src/components/promptvault/SearchBar.tsx`

## Summary of Changes

### globals.css
- Added 6 premium surface color tokens to @theme, :root, and .dark
- Updated .bg-brand-gradient to 135deg with new oklch values
- Updated .glow-purple to tighter glow shadow
- Added .pv-card utility class (premium card base)
- Added .chip-tool utility class (tool chip base)
- All existing utilities preserved

### PromptCard.tsx
- Compact card: pv-card, p-4, h-12 w-12 type icon, h-9 rounded-xl copy button with glow on hover
- Full card: pv-card, aspect-[3/4], rounded-t-2xl, NOVO badge, video loading spinner, h-9 action buttons with rounded-xl
- Missing prompt badge and all existing logic preserved

### SearchBar.tsx
- Search input: h-11, rounded-xl, bg-surface-card, border-border-card, purple focus ring
- Added 6 format filter pills (Imagem/Vídeo/POV/Selfie/UGC/Produto) with active/inactive states
- Pill click toggles type filter; scrollable row

## Verification
- `bun run lint`: zero errors
- Dev server compiling successfully
- All existing functionality preserved
