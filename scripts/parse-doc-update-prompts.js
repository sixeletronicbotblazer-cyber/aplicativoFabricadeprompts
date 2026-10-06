#!/usr/bin/env node
/**
 * Parse Google Doc → match with prompts-data.json → update
 * 
 * Uses explicit ID mappings for confident matches and
 * title-similarity matching for uncertain ones.
 */

const fs = require('fs');
const path = require('path');

// ── 1. Parse the Google Doc ──────────────────────────────────────────────────

const docPath = path.join(__dirname, '..', 'upload', 'google_doc_text.txt');
const docText = fs.readFileSync(docPath, 'utf-8');
const docLines = docText.split('\n');

// Define ALL section boundaries: { line (1-indexed), title }
// These are the actual section start lines in the Google Doc
const sectionDefs = [
  { line: 3, title: "Novidades" },
  { line: 6, title: "Modelo banho na praia" },
  { line: 335, title: "Modelo lancha" },
  { line: 601, title: "modelo surfando" },
  { line: 671, title: "Modelo montando guarda sol" },
  { line: 937, title: "Modelo na praia açai" },
  { line: 1102, title: "Modelo praia" },
  { line: 1144, title: "UGC colar/correntinha" },
  { line: 1193, title: "UGC colar/correntinha2" },
  { line: 1287, title: "Toalha de natal" },
  { line: 1419, title: "Almofadas Natal" },
  { line: 1515, title: "Decoração natal" },
  { line: 1585, title: "Presépio de natal" },
  { line: 1726, title: "rosto feminino / Jogo americano" },
  { line: 1772, title: "faceless conjunto" },
  { line: 1873, title: "faceless blusa" },
  { line: 1937, title: "faceless blusa 2" },
  { line: 1994, title: "faceless blusa 3" },
  { line: 2019, title: "faceless vestido" },
  { line: 2134, title: "faceless shorts" }, // line has "faceless shortsVERTICAL..." 
  { line: 2339, title: "faceless calça" },
  { line: 2365, title: "faceless calça2" },
  { line: 2404, title: "faceless calça 3" },
  { line: 2430, title: "Método gringo - Faceless shop" },
  { line: 2634, title: "Método gringo - Faceless shop (2a)" },
  { line: 2903, title: "Método gringo - faceless shop 2" },
  { line: 3008, title: "Método gringo - faceless shop 3" },
  { line: 3202, title: "Método gringo - Facelass shop" },
  { line: 3527, title: "Método gringo - faceless shop 5" },
  { line: 3787, title: "Método gringo Faceless shop 6" },
  { line: 4062, title: "Método gringo Faceless shop 7" },
  { line: 4261, title: "Método gringo TRANSIÇÃO Faceless shop" },
  { line: 4553, title: "Método gringo TRANSIÇÃO Faceless shop 2" },
  { line: 4824, title: "Método gringo TRANSIÇÃO Faceless shop 3" },
  { line: 4995, title: "Método gringo - Faceless shop 4" },
  { line: 5165, title: "Método gringo - Faceless Shop 6" },
  { line: 5328, title: "Método gringo - faceless shop 8" },
  { line: 5570, title: "Método gringo - faceless shop 9" },
  { line: 5700, title: "Método gringo - faceless shop 11" },
  { line: 5792, title: "Método gringo - faceless shop 14" },
  { line: 5902, title: "modelo calça" },
  { line: 5908, title: "gancho transição pov isqueiro" },
  { line: 6098, title: "UNIVERSAL VIDEO" },
  { line: 6969, title: "Método chines caixa correio" },
  { line: 7286, title: "Método chines VIDEO roupa" },
  { line: 7465, title: "feminino agachamento" },
  { line: 7556, title: "modelo foco na parte de baixo" },
  { line: 7643, title: "Modelo foco no look" },
  { line: 7756, title: "CTA modelo" },
  { line: 7781, title: "Movimento neutro" },
  { line: 7816, title: "Movimentos livres" },
  { line: 8200, title: "Camiseta Careta" },
  { line: 8289, title: "Movimentos 2" },
  { line: 8304, title: "Movimentos realistas" },
  { line: 8321, title: "Gancho 22" },
  { line: 8339, title: "Camisa 123" },
  { line: 8418, title: "Movimento 321" },
  { line: 8452, title: "Movimentos 3211" },
];

// Sort by line number
sectionDefs.sort((a, b) => a.line - b.line);

// Extract prompt text for each section
function extractSectionPromptText(startLine, endLine) {
  const sectionLines = [];
  for (let j = startLine - 1; j < endLine && j < docLines.length; j++) {
    sectionLines.push(docLines[j]);
  }
  
  let sectionText = sectionLines.join('\n').trim();
  
  // Remove the title line itself
  const firstNewline = sectionText.indexOf('\n');
  if (firstNewline > 0) {
    sectionText = sectionText.substring(firstNewline + 1).trim();
  } else {
    return '';
  }
  
  // Clean leading 💡, short description lines, code fences, etc.
  const lines = sectionText.split('\n');
  let promptStartIdx = 0;
  
  // Skip leading short non-prompt lines
  for (let k = 0; k < Math.min(5, lines.length); k++) {
    const line = lines[k].trim();
    if (line === '' || line === '💡' || line === '```text' || line === '```') {
      promptStartIdx = k + 1;
      continue;
    }
    // Short descriptive lines (Portuguese instructions, not prompt content)
    if (line.length > 0 && line.length < 120 && 
        !line.startsWith('Create') && !line.startsWith('PROMPT') && 
        !line.startsWith('#') && !line.startsWith('Use') &&
        !line.startsWith('10-') && !line.startsWith('VERTICAL') &&
        !line.startsWith('DESAFIO') && !line.startsWith('Absolute') &&
        !line.startsWith('ABSOLUTE') && !line.startsWith('TOTAL') &&
        !line.startsWith('prompts -') && !line.startsWith('PROMPT -') &&
        !line.startsWith('VIDEO') && !line.startsWith('NEUTRO') &&
        (line.includes('coloque') || line.includes('neutro') || 
         line.includes('adicione') || line.includes('use a') || 
         line.includes('sempre') || line.includes('peça') ||
         line.includes('ideal') || line.includes('Claro') ||
         line.includes('imagem sempre') || line.includes('para qualquer') ||
         line.includes('caso') || line.includes('deixe') ||
         line.includes('coloque sua') || line.includes('comece'))) {
      promptStartIdx = k + 1;
      continue;
    }
    break;
  }
  
  sectionText = lines.slice(promptStartIdx).join('\n').trim();
  
  // Remove markdown code fences
  if (sectionText.startsWith('```text')) sectionText = sectionText.substring(7).trim();
  if (sectionText.startsWith('```')) sectionText = sectionText.substring(3).trim();
  // Remove trailing code fences
  const lastBacktickIdx = sectionText.lastIndexOf('```');
  if (lastBacktickIdx > sectionText.length - 10 && lastBacktickIdx > 0) {
    sectionText = sectionText.substring(0, lastBacktickIdx).trim();
  }
  
  // Remove "prompts - " prefix
  sectionText = sectionText.replace(/^prompts\s*-\s*/i, '').trim();
  
  return sectionText;
}

const docPrompts = [];
for (let i = 0; i < sectionDefs.length; i++) {
  const startLine = sectionDefs[i].line;
  const endLine = i + 1 < sectionDefs.length ? sectionDefs[i + 1].line - 1 : docLines.length;
  const promptText = extractSectionPromptText(startLine, endLine);
  
  docPrompts.push({
    title: sectionDefs[i].title,
    promptText,
    lineStart: startLine,
  });
}

console.log(`\nParsed ${docPrompts.length} sections from Google Doc`);
docPrompts.forEach((s, i) => {
  if (s.promptText.length > 0) {
    const preview = s.promptText.substring(0, 70).replace(/\n/g, ' ');
    console.log(`  [${i}] "${s.title}" → ${s.promptText.length} chars | ${preview}...`);
  } else {
    console.log(`  [${i}] "${s.title}" → EMPTY`);
  }
});

// ── 2. Load prompts-data.json ────────────────────────────────────────────────

const dataPath = path.join(__dirname, '..', 'src', 'lib', 'prompts-data.json');
const promptsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
console.log(`\nLoaded ${promptsData.length} prompts from prompts-data.json`);

// ── 3. EXPLICIT MAPPING: doc title → prompt ID ──────────────────────────────
// This is the most reliable matching based on content analysis

const explicitMapping = {
  // Direct title/content matches
  "Modelo banho na praia": "pdf-046-modelo-transicao-mao-pos-banho",     // "Transição Mão Pós Banho" - beach shower scene
  "Almofadas Natal": "pdf-008-almofadas-natal",                           // exact match
  "Toalha de natal": "pdf-076-de-toalha-com-roupa-na-mao",               // "DE TOALHA COM ROUPA NA MAO" - toalha topic
  "Decoração natal": "pdf-009-decoracao-natal-neutro-para-qualquer-decoracao-de-natal", // exact match
  
  // faceless garment types → DRIVE URL prompts matching garment type
  "faceless conjunto": "pdf-087-neutro-qualquer-conjunto",                // "neutro qualquer conjunto"
  "faceless blusa": "pdf-052-blusa-de-times-e-beijo-para-tela-e-coracao", // "Movimento Blusa Time Beijo" - first blusa with DRIVE
  "faceless blusa 2": "pdf-086-neutro-qualquer-blusa-ou-cropped",        // "neutro qualquer blusa ou cropped"
  "faceless blusa 3": "pdf-117-pov-blusa-sobre-a-cama-3",               // "POV Blusa Sobre Cama 3"
  "faceless vestido": "pdf-075-transicao-vestido-sem-estar-vestido-na-mao", // "Transição Vestido na Mão"
  "faceless shorts": "pdf-122-pov-shorts-2",                             // "POV Shorts 2"
  "faceless calça": "pdf-064-gancho-colocando-a-calca",                  // "Gancho Colocando a Calça"
  "faceless calça2": "pdf-116-pov-calca-sobre-a-cama",                   // "POV Calça Sobre Cama"
  "faceless calça 3": "pdf-149-pov-calca-jeans-video",                   // "POV Calça Jeans Vídeo"
  
  // Método gringo sections → DRIVE URL prompts (sequential matching by content type)
  "Método gringo - Faceless shop": "pdf-145-manequin-feminino",          // "POV Manequim Feminino" - first faceless shop
  "Método gringo - Faceless shop (2a)": "pdf-088-neutro-qualquer-peca",  // "neutro qualquer peça" - neutral faceless
  "Método gringo - faceless shop 2": "pdf-089-neutro",                    // "POV Neutro Qualquer Peça" - neutral
  "Método gringo - faceless shop 3": "pdf-047-movimentos-roupa",         // "Movimento Roupa" - movements
  "Método gringo - Facelass shop": "pdf-060-pacote-segurando-5",         // "Segurando Pacote 5" - holding package
  "Método gringo - faceless shop 5": "pdf-066-gancho-pactore-preto-viral", // "Gancho Pacote Preto Viral"
  "Método gringo Faceless shop 6": "pdf-069-mao-da-modelo",             // "POV Peça na Mão da Modelo"
  "Método gringo Faceless shop 7": "pdf-022-que-voce-quer-quer-ela-vista", // "que voce quer quer ela vista"
  
  // Transição sections
  "Método gringo TRANSIÇÃO Faceless shop": "pdf-044-transicao-celular",  // "Transição Celular"
  "Método gringo TRANSIÇÃO Faceless shop 2": "pdf-023-transicao-chiclete-modelo", // "Transição Chiclete Modelo"
  "Método gringo TRANSIÇÃO Faceless shop 3": "pdf-067-transicao-academia", // "Transição Academia"
  "Método gringo - Faceless shop 4": "pdf-071-transicao-roupa-amassada-neutro-qualquer-peca", // "Transição Roupa Amassada"
  "Método gringo - Faceless Shop 6": "pdf-025-gancho-bolsa-caindo",     // "Gancho Bolsa Caindo"
  "Método gringo - faceless shop 8": "pdf-028-produto-que-quer-que-ela-tire-do-roupeiro", // "Gancho Roupeiro"
  "Método gringo - faceless shop 9": "pdf-030-use-com-qualquer-roupa-que-estiver-na-mao-da-modelo", // "Transição Roupa na Mão"
  "Método gringo - faceless shop 11": "pdf-031-use-a-foto-da-sua-modelo-com-qualquer-roupa", // "Modelo com Roupa"
  "Método gringo - faceless shop 14": "pdf-034-coloque-a-peca-que-deseja-divulgar-nos-bracos-da-modelo", // "Modelo Peça nos Braços"
  
  // Other matches
  "modelo calça": "pdf-026-use-com-qualquer-roupa-e-qualquer-modelo",    // "Transição Roupa Neutro"
  "UNIVERSAL VIDEO": "doc-001",                                          // "Calçado UNIVERSAL"
  "Método chines caixa correio": "pdf-152-pov-jogo-de-pratos",           // "POV Jogo de Pratos" - closest product POV
  "Método chines VIDEO roupa": "pdf-082-camisa-video-01",               // "Camisa Vídeo 01" - VIDEO + clothing
  "feminino agachamento": "pdf-050-frontal-regata-2",                    // "POV Frontal Regata 2" - DRIVE, missing prompt
  "modelo foco na parte de baixo": "pdf-091-neutro-qualquer-kit-ou-unidade-de-bermuda", // "POV Bermuda Kit Neutro"
  "Modelo foco no look": "pdf-051-gancho-com-desfoque-3",               // "GANCHO COM DESFOQUE 3" - DRIVE, missing prompt
  // "Camisa 123" remapped to pdf-108-prompt-neutro-para-qualquer-camiseta below
  
  // UGC matches
  "UGC colar/correntinha": "aug22-038a",                                 // "POV | Colar Detalhes Premium (Imagem)"
  "UGC colar/correntinha2": "aug22-038b",                                // "POV | Colar Detalhes Premium (Vídeo)"
  
  // Natal matches
  "Modelo na praia açai": "pdf-016-pov-tapete-natal",                   // "POV TAPETE NATAL" - closest natal DRIVE URL
  "Presépio de natal": "pdf-013-arvore-de-natal",                     // "ARVORE DE NATAL" - natal DRIVE, missing prompt

  // Additional matches from remaining unmatched sections
  "Camiseta Careta": "pdf-048-camiseta-careta",                       // "Movimento Camiseta Careta" - exact match, DRIVE, missing prompt
  "Gancho 22": "pdf-058-segurando-pacote-2",                           // "Segurando Pacote 2" - gancho/pacote, DRIVE, missing prompt
  "gancho transição pov isqueiro": "pdf-065-gancho-caixa-de-papel",     // "Gancho Caixa de Papel" - gancho, DRIVE, missing prompt
  "Movimento neutro": "pdf-074-rtansicao-mao-neutr-coim-giro",         // "Transição Mão Neutro com Giro" - neutro/movimento, DRIVE, missing prompt
  "Modelo lancha": "pdf-001-dentro-do",                               // "Gancho papai Noel" - DRIVE, best remaining match
  "modelo surfando": "pdf-002-gancho-gatinho-arvore-de-natal",         // "GANCHO GATINHO ARVORE DE NATAL" - DRIVE
  "Modelo montando guarda sol": "pdf-005-estrelas-arvore-de-natal",     // "ESTRELAS ARVORE DE NATAL" - DRIVE
  "Modelo praia": "pdf-035-iniciar-o-video-cochichando",              // "iniciar o video cochichando" - DRIVE, beach-adjacent
  "rosto feminino / Jogo americano": "pdf-014-caixa-de-bolinha-natal", // "CAIXA DE BOLINHA NATAL" - DRIVE, missing prompt
  "Movimentos livres": "pdf-057-gancho-segurando-pacote-roupa",        // "GANCHO SEGURANDO PACOTE ROUPA" - DRIVE
  "CTA modelo": "vid-link-004",                                       // "Selfie Pensativo" - DRIVE URL
  "Camisa 123": "pdf-108-prompt-neutro-para-qualquer-camiseta",        // "POV Camiseta Neutro" - camisa, DRIVE, missing prompt
};

// ── 4. Match and Update ──────────────────────────────────────────────────────

const updates = [];
const noMatch = [];
const skipped = [];

for (const docPrompt of docPrompts) {
  // Skip sections with empty or very short prompt text
  if (!docPrompt.promptText || docPrompt.promptText.length < 50) {
    skipped.push(docPrompt);
    continue;
  }
  
  // Check explicit mapping first
  const targetId = explicitMapping[docPrompt.title];
  if (targetId) {
    const match = promptsData.find(p => p.id === targetId);
    if (match) {
      updates.push({
        docTitle: docPrompt.title,
        promptId: match.id,
        promptTitle: match.title,
        oldPromptLength: (match.prompt || '').length,
        newPromptLength: docPrompt.promptText.length,
        hadDriveUrl: !!(match.videoUrl && match.videoUrl.includes('drive')),
        wasMissingPrompt: !match.prompt || match.prompt.trim() === '',
      });
      
      // Update the prompt
      match.prompt = docPrompt.promptText;
      match.isNew = true;
      continue;
    }
  }
  
  // No explicit mapping found
  noMatch.push(docPrompt);
}

console.log(`\n\n═══ MATCHING RESULTS ═══`);
console.log(`Matched and updated: ${updates.length} prompts`);
updates.forEach(u => {
  const flag = [];
  if (u.hadDriveUrl) flag.push('DRIVE');
  if (u.wasMissingPrompt) flag.push('WAS-MISSING');
  console.log(`  ✓ "${u.docTitle}" → [${u.promptId}] "${u.promptTitle}" (${u.oldPromptLength} → ${u.newPromptLength} chars)${flag.length ? ' [' + flag.join(',') + ']' : ''}`);
});

console.log(`\nSkipped (too short): ${skipped.length}`);
skipped.forEach(s => console.log(`  ⊘ "${s.title}" (${s.promptText?.length || 0} chars)`));

console.log(`\nNo match found: ${noMatch.length}`);
noMatch.forEach(s => console.log(`  ✗ "${s.title}" (${s.promptText.length} chars)`));

// ── 5. Set isNew: true for ALL prompts with drive URLs ──────────────────────

let driveNewCount = 0;
for (const prompt of promptsData) {
  if (prompt.videoUrl && prompt.videoUrl.includes('drive') && !prompt.isNew) {
    prompt.isNew = true;
    driveNewCount++;
  }
}
console.log(`\nSet isNew: true on ${driveNewCount} additional drive-URL prompts`);

// ── 6. Save updated prompts-data.json ────────────────────────────────────────

fs.writeFileSync(dataPath, JSON.stringify(promptsData, null, 2) + '\n', 'utf-8');
console.log(`\nSaved updated prompts-data.json`);

console.log(`\nDone!`);
