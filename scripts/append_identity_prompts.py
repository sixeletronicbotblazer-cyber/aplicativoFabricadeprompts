#!/usr/bin/env python3
"""
Append 5 identity-preservation prompts (with explanations) to prompts-data.json.

These prompts cover Nano Banana 2 / Veo 3 techniques for preserving character
identity across two reference images (Image 1 = identity, Image 2 = scene).
"""
import json
from pathlib import Path

JSON_PATH = Path(__file__).resolve().parent.parent / "src" / "lib" / "prompts-data.json"

# --- Prompt 1: Master Frame (long version) ---
PROMPT_1 = """OBJECTIVE

Use IMAGE 1 as the ONLY identity reference for the character.
Use IMAGE 2 ONLY as the composition, pose, framing and styling reference.

The final result MUST look as if the character from IMAGE 1 was photographed in the exact same moment shown in IMAGE 2.

IDENTITY PRESERVATION (MANDATORY)

Preserve 100% of the facial identity from IMAGE 1.

Do NOT redesign the face.
Do NOT change facial proportions.
Do NOT change eye shape.
Do NOT change nose shape.
Do NOT change lips.
Do NOT change jawline.
Do NOT change skin tone.
Do NOT change hairstyle unless IMAGE 2 explicitly requires it.
Do NOT make the character younger or older.
Do NOT alter body proportions.

The person in the final image must be immediately recognizable as the exact same person from IMAGE 1.

FRAME REPLICATION (MANDATORY)

Recreate the EXACT frame from IMAGE 2.

Match EXACTLY:

• camera angle
• camera height
• lens perspective
• framing
• crop
• body position
• head position
• shoulder position
• torso rotation
• arm placement
• hand placement
• finger position
• leg position
• facial direction
• eye direction
• facial expression
• body language

The composition should be virtually identical to IMAGE 2.

CLOTHING & ACCESSORIES

Replicate every visible clothing item and accessory from IMAGE 2 exactly.

If IMAGE 2 shows sunglasses, the character MUST wear the exact same sunglasses.

If IMAGE 2 shows prescription glasses, recreate the same glasses.

If IMAGE 2 shows earrings, necklace, rings, watch, bracelets, hat, cap, headphones, scarf or any other accessory, reproduce them exactly.

Replicate:

• clothing colors
• clothing materials
• clothing fit
• clothing folds
• textures
• accessories
• positioning of every accessory

BACKGROUND

Recreate the background from IMAGE 2 as accurately as possible.

Match:

• environment
• lighting
• shadows
• reflections
• colors
• depth of field
• perspective
• weather
• atmosphere

LIGHTING

Match the lighting from IMAGE 2 exactly.

Replicate:

• light direction
• light intensity
• color temperature
• highlights
• shadows
• contrast
• reflections

IMAGE QUALITY

Ultra photorealistic.
Natural skin texture.
Realistic hair strands.
Accurate fabric physics.
Realistic reflections.
Natural shadows.
Professional photography.
Ultra detailed.
8K.
HDR.
High dynamic range.
Cinematic realism.

IMPORTANT PRIORITY

Priority #1:
Maintain the exact identity of IMAGE 1.

Priority #2:
Recreate the exact frame, pose, composition, clothing, accessories and environment from IMAGE 2.

The final image should appear as if IMAGE 1's character had actually posed for the original photograph shown in IMAGE 2."""

EXPLANATION_1 = """O segredo é tratar a Imagem 2 como um frame mestre (master frame) e instruir o modelo a preservar 100% da identidade da Imagem 1, copiando apenas a composição da Imagem 2. Este prompt foi pensado para Nano Banana 2 / Veo 3, com linguagem forte para minimizar alterações.

Esse tipo de prompt costuma dar resultados mais consistentes porque estabelece uma hierarquia clara:

• Imagem 1 = identidade (rosto e corpo).
• Imagem 2 = pose, enquadramento, roupa, acessórios, iluminação e cenário.

Isso reduz bastante as chances do modelo "misturar" os rostos ou criar uma pessoa diferente."""

# --- Prompt 2: Identity Replacement Task ---
PROMPT_2 = """TASK: IDENTITY REPLACEMENT

IMAGE 1 is the ONLY source of identity.

IMAGE 2 is NOT a person reference.
IMAGE 2 is ONLY a reference for composition.

Replace the person in IMAGE 2 completely with the character from IMAGE 1.

The person from IMAGE 2 must NOT appear in any way.

IDENTITY LOCK (ABSOLUTE PRIORITY)

Use the exact character from IMAGE 1.

Lock and preserve:

• facial identity
• facial proportions
• head shape
• jawline
• nose
• lips
• eyes
• eyebrows
• hairstyle
• skin tone
• body proportions

Do NOT blend identities.

Do NOT average the two faces.

Do NOT reinterpret the face.

Do NOT create a new person.

Do NOT use any facial feature from IMAGE 2.

The final person must be unmistakably the same character as IMAGE 1.

IMAGE 2 ONLY PROVIDES

• exact pose
• exact body position
• exact camera angle
• exact framing
• exact perspective
• exact expression
• exact lighting
• exact environment
• exact background
• exact clothing
• exact accessories

If IMAGE 2 contains glasses, sunglasses, jewelry, hat, watch or any accessory, place those exact accessories onto the character from IMAGE 1.

The accessories are copied.
The identity is NEVER copied.

IMPORTANT

Imagine the character from IMAGE 1 physically standing where the person in IMAGE 2 is standing.

Everything remains identical to IMAGE 2 except the human identity.

The final image should look like someone photographed the character from IMAGE 1 in the exact moment captured by IMAGE 2.

Ultra photorealistic.
8K.
Natural skin texture.
Professional photography.
No face morphing.
No identity mixing.
No resemblance to IMAGE 2.
100% identity preservation from IMAGE 1."""

EXPLANATION_2 = """Use este formato quando o modelo estiver "misturando" os rostos das duas referências. A estrutura declara explicitamente que IMAGE 2 NÃO é uma referência de personagem — apenas de composição.

Dica que faz muita diferença no Nano Banana 2: em vez de chamar de "Image 2", chame de "Scene Reference". Muitos modelos entendem "Image 2" como outra referência de personagem e acabam fundindo os rostos.

Use esta estrutura mental:

• Reference Character (Image 1) = identidade.
• Scene Reference (Image 2) = cenário, pose e enquadramento.

Essa simples mudança de nomenclatura costuma aumentar bastante a fidelidade da personagem. Além disso, se o Nano Banana 2 permitir definir pesos para as imagens, configure Imagem 1 com peso máximo e Imagem 2 com peso baixo, usando-a apenas como referência de composição."""

# --- Prompt 3: Studio Portrait Master Frame ---
PROMPT_3 = """Use the uploaded reference image as the ONLY identity reference.

Create a highly realistic studio portrait of the exact same woman.

This is NOT a reinterpretation. Preserve her identity with maximum fidelity.

Maintain exactly:
- facial structure
- face proportions
- eye shape
- eyebrow shape
- nose
- lips
- jawline
- chin
- ears
- skin tone
- hairstyle
- hairline

Her lips are naturally full with a subtle lip filler appearance and a glossy finish. Preserve this characteristic exactly without exaggeration.

Expression:
Neutral, confident, serious fashion model expression.
Lips gently closed.
Eyes looking directly into the camera.

Pose:
Straight posture.
Head centered.
Shoulders squared.
Perfect passport-style composition.
Upper chest and head visible.
Face perfectly aligned to the camera.

Lighting:
Professional beauty studio lighting.
Soft, diffused key light.
Balanced fill light.
Natural skin rendering.
Subtle catchlights in the eyes.

Background:
Clean light gray seamless studio background.

Wardrobe:
Minimalist fitted black crew-neck shirt with no logos, patterns, or accessories.

Photography:
85mm portrait lens.
Eye-level camera.
Ultra-sharp focus on the eyes.
Extremely realistic skin texture.
Natural pores.
Realistic hair strands.
Professional beauty photography.
Ultra photorealistic.
8K resolution.
HDR.
No beauty filter.
No face morphing.
No facial redesign.
No stylization.
No makeup changes.
No identity alteration.

The final portrait must be immediately recognizable as the exact same woman from the uploaded reference image."""

EXPLANATION_3 = """Esse retrato funciona muito bem como "imagem mestra". Depois, quando você quiser colocá-la em qualquer pose, roupa ou cenário, use essa imagem gerada como a nova referência de identidade.

Isso normalmente produz resultados mais consistentes do que partir sempre da foto original, porque a imagem mestra já está "limpa", bem iluminada e padronizada — o modelo consegue replicá-la com muito mais fidelidade do que uma foto amadora com sombras ruins ou ângulos estranhos.

Fluxo recomendado:
1. Gere a imagem mestra com este prompt a partir da foto original.
2. Salve essa imagem mestra.
3. Use-a como IMAGE 1 (identidade) nos outros prompts de substituição de cena."""

# --- Prompt 4: Short Version ---
PROMPT_4 = """Replace the person in Image 2 with the character from Image 1.

Image 1 is the ONLY identity reference.

Keep 100% of the face, body, skin tone, hair, facial features, and proportions from Image 1.

Copy ONLY the pose, camera angle, framing, clothing, accessories, lighting, and background from Image 2.

Do not use the face or body from Image 2.

The final image must look like the character from Image 1 was photographed in the exact scene from Image 2.

Ultra photorealistic.
8K.
Natural skin texture.
Realistic lighting.
Maximum identity preservation."""

EXPLANATION_4 = """Modelos como o Nano Banana 2 muitas vezes obedecem melhor prompts curtos do que instruções enormes. Quando o prompt fica muito detalhado, ele acaba "misturando" as duas referências e o resultado é uma pessoa nova, parecida com ambas mas idêntica a nenhuma.

Use esta versão curta quando:

• o modelo já recebeu as duas imagens como referência anexada,
• você quer apenas instruir o que fazer com cada uma,
• a versão longa estiver gerando resultados "fundidos".

A regra geral: quanto mais detalhe você adiciona sobre a identidade, mais o modelo se sente "autorizado" a reinterpretá-la. Prompt curto + referências claras costuma trancar melhor a identidade."""

# --- Prompt 5: Ultra Short Version ---
PROMPT_5 = """Use Image 1 as the character.

Use Image 2 as the scene.

Replace the person in Image 2 with the person from Image 1.

Keep the exact identity of Image 1.

Copy only the pose, clothing, accessories, camera angle, framing, lighting and background from Image 2.

Do not copy the identity of Image 2.

Ultra realistic."""

EXPLANATION_5 = """Versão enxuta para modelos que se confundem com instruções longas. Ideal quando você já carregou as duas imagens como referência e só precisa de uma instrução direta sobre o que fazer com cada uma.

Esta versão é especialmente útil em ferramentas com janela de contexto limitada ou quando o modelo começa a ignorar partes do prompt longo. A simplicidade aqui é uma feature, não uma limitação: cada linha carrega uma única instrução não-negociável."""

NEW_PROMPTS = [
    {
        "id": "identity-001",
        "title": "Frame Mestre — Identidade + Composição",
        "type": "Imagem",
        "category": "Identidade AI",
        "description": "Prompt longo para Nano Banana 2 / Veo 3 que preserva 100% da identidade da Imagem 1 e copia apenas a composição (pose, enquadramento, roupa, acessórios, iluminação e cenário) da Imagem 2.",
        "tags": ["nano-banana-2", "veo-3", "identidade", "frame-mestre", "composicao"],
        "image": "/prompts/identity/img_001.jpg",
        "prompt": PROMPT_1,
        "explanation": EXPLANATION_1,
        "recommended": True,
        "referencia": False,
    },
    {
        "id": "identity-002",
        "title": "Identity Replacement Task",
        "type": "Imagem",
        "category": "Identidade AI",
        "description": "Substitui completamente a pessoa da Imagem 2 pela personagem da Imagem 1. Declara explicitamente que a Imagem 2 NÃO é referência de pessoa — apenas de composição, pose, cenário e acessórios.",
        "tags": ["nano-banana-2", "identity-replacement", "scene-reference", "pesos"],
        "image": "/prompts/identity/img_002.jpg",
        "prompt": PROMPT_2,
        "explanation": EXPLANATION_2,
        "recommended": True,
        "referencia": False,
    },
    {
        "id": "identity-003",
        "title": "Retrato Estúdio — Imagem Mestra",
        "type": "Imagem",
        "category": "Identidade AI",
        "description": "Gera um retrato de estúdio clean e padronizado a partir de uma foto de referência. Use o resultado como 'imagem mestra' para alimentar os demais prompts de substituição de cena.",
        "tags": ["studio-portrait", "master-frame", "identidade", "passport", "beauty"],
        "image": "/prompts/identity/img_003.jpg",
        "prompt": PROMPT_3,
        "explanation": EXPLANATION_3,
        "recommended": True,
        "referencia": False,
    },
    {
        "id": "identity-004",
        "title": "Substituição de Pessoa — Versão Curta",
        "type": "Imagem",
        "category": "Identidade AI",
        "description": "Versão enxuta do prompt de substituição de identidade. Ideal quando o modelo está 'misturando' os rostos das duas referências por causa de instruções longas demais.",
        "tags": ["nano-banana-2", "curto", "substituicao", "identidade"],
        "image": "/prompts/identity/img_004.jpg",
        "prompt": PROMPT_4,
        "explanation": EXPLANATION_4,
        "recommended": False,
        "referencia": False,
    },
    {
        "id": "identity-005",
        "title": "Substituição de Pessoa — Ultra Curta",
        "type": "Imagem",
        "category": "Identidade AI",
        "description": "Mínimo viável: 8 linhas diretas declarando qual imagem é a personagem, qual é a cena, e o que copiar de cada uma. Use quando o modelo ignora prompts longos.",
        "tags": ["nano-banana-2", "ultra-curto", "substituicao", "identidade"],
        "image": "/prompts/identity/img_005.jpg",
        "prompt": PROMPT_5,
        "explanation": EXPLANATION_5,
        "recommended": False,
        "referencia": False,
    },
]


def main():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    existing_ids = {p["id"] for p in data}
    added = 0
    for p in NEW_PROMPTS:
        if p["id"] in existing_ids:
            print(f"SKIP (already exists): {p['id']}")
            continue
        data.append(p)
        added += 1
        print(f"ADD : {p['id']} - {p['title']}")

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nTotal prompts now: {len(data)} (added {added})")


if __name__ == "__main__":
    main()
