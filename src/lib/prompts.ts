export type PromptType = "Imagem" | "Vídeo" | "POV" | "Selfie" | "UGC";

export type PromptCategory =
  | "Selfie"
  | "POV"
  | "UGC"
  | "Roupas"
  | "Produto"
  | "Look no corpo"
  | "TikTok Shop"
  | "Shopee";

export interface Prompt {
  id: string;
  title: string;
  type: PromptType;
  category: PromptCategory;
  description: string;
  tags: string[];
  image: string;
  prompt: string;
  recommended?: boolean;
}

/**
 * Acervo de prompts — pronto para receber um documento real de imagens e prompts.
 * Cada item segue a estrutura solicitada. Para subir conteúdo novo, basta
 * adicionar objetos a este array (ou conectar a um JSON/CSV de importação).
 */
export const PROMPTS: Prompt[] = [
  {
    id: "p1",
    title: "Selfie UGC no espelho",
    type: "Imagem",
    category: "Selfie",
    description:
      "Prompt para criar selfie realista no espelho com celular cobrindo o rosto, mostrando o look completo.",
    tags: ["selfie", "ugc", "roupa"],
    image: "/prompts/p1.jpg",
    recommended: true,
    prompt:
      "UGC mirror selfie of a young woman holding a smartphone covering her face, wearing a [PIECE] in [COLOR], casual bathroom mirror setting, natural soft daylight, realistic smartphone photo, vertical composition, fashion content creator aesthetic, authentic, no studio lighting, shot on iPhone, sharp detail, 4k",
  },
  {
    id: "p2",
    title: "POV produto na mão",
    type: "POV",
    category: "POV",
    description:
      "Prompt para criar cena em primeira pessoa segurando o produto, ideal para abertura de vídeo de TikTok Shop.",
    tags: ["pov", "produto", "tiktokshop"],
    image: "/prompts/p2.jpg",
    recommended: true,
    prompt:
      "First person POV shot of a hand holding a [PRODUCT], soft natural window light, blurred cozy bedroom background, realistic UGC product photography, vertical, shallow depth of field, authentic smartphone look, warm tones, high detail, 4k",
  },
  {
    id: "p3",
    title: "Modelo IA usando roupa",
    type: "UGC",
    category: "UGC",
    description:
      "Prompt para criar modelo IA usando uma peça de roupa com aparência realista e natural.",
    tags: ["modelo", "roupa", "ia"],
    image: "/prompts/p3.jpg",
    recommended: true,
    prompt:
      "Realistic photo of a stylish female AI fashion model wearing a [PIECE] in [COLOR], neutral seamless studio background, soft cinematic lighting, full body fashion editorial, natural skin texture, authentic proportions, premium e-commerce look, high detail, 4k",
  },
  {
    id: "p4",
    title: "Movimento natural da peça",
    type: "Vídeo",
    category: "Roupas",
    description:
      "Prompt para animar a modelo com movimentos leves e naturais, mostrando o caimento da peça.",
    tags: ["movimento", "vídeo", "ugc"],
    image: "/prompts/p4.jpg",
    recommended: true,
    prompt:
      "Cinematic video of a fashion model mid gentle movement, the fabric of a [PIECE] flowing naturally with soft golden hour light, subtle motion blur on the dress, realistic video frame, slow elegant turn, 3 seconds, vertical 9:16, smooth motion, high detail",
  },
  {
    id: "p5",
    title: "Produto no cabide",
    type: "Imagem",
    category: "Produto",
    description:
      "Prompt para mostrar roupa no cabide em ambiente UGC, com luz natural e estética minimalista.",
    tags: ["cabide", "roupa", "produto"],
    image: "/prompts/p5.jpg",
    prompt:
      "Cozy UGC style photo of a single [PIECE] on a wooden hanger against a warm textured wall, soft natural light, minimalist aesthetic, vertical smartphone photo, shallow depth of field, authentic creator look, high detail, 4k",
  },
  {
    id: "p6",
    title: "CTA para TikTok Shop",
    type: "Vídeo",
    category: "TikTok Shop",
    description:
      "Prompt para criar cena com chamada para compra, ideal para o fechamento do vídeo de venda.",
    tags: ["tiktokshop", "cta", "venda"],
    image: "/prompts/p6.jpg",
    recommended: true,
    prompt:
      "Vibrant TikTok Shop product showcase scene, a [PRODUCT] on a glossy podium, neon cyan and magenta glow, shopping bag and price tag floating, ecommerce livestream aesthetic, dynamic camera push-in, 4 seconds, vertical 9:16, premium commercial look, high detail",
  },
  {
    id: "p7",
    title: "Selfie lobby com bolsa",
    type: "Selfie",
    category: "Selfie",
    description:
      "Selfie estilo UGC segurando uma bolsa, com fundo de lobby moderno e luz natural.",
    tags: ["selfie", "bolsa", "ugc"],
    image: "/prompts/p1.jpg",
    prompt:
      "UGC mirror selfie of a young woman holding a designer bag, wearing a [PIECE], modern hotel lobby mirror, bright natural daylight, realistic smartphone photo, vertical, fashion creator aesthetic, authentic, sharp detail, 4k",
  },
  {
    id: "p8",
    title: "POV abrindo embalagem",
    type: "POV",
    category: "POV",
    description:
      "POV em primeira pessoa abrindo a caixa do produto — perfeito para unboxing de TikTok Shop.",
    tags: ["pov", "unboxing", "tiktokshop"],
    image: "/prompts/p2.jpg",
    prompt:
      "First person POV shot of hands opening a product box, soft natural light, blurred cozy room background, realistic UGC unboxing photography, vertical, shallow depth of field, authentic smartphone look, warm tones, high detail, 4k",
  },
  {
    id: "p9",
    title: "Look no corpo — frontal",
    type: "UGC",
    category: "Look no corpo",
    description:
      "Modelo IA em pose frontal mostrando o look completo do corpo todo, estilo catálogo premium.",
    tags: ["look", "roupa", "ia"],
    image: "/prompts/p3.jpg",
    recommended: true,
    prompt:
      "Realistic full body photo of a female AI fashion model in a [PIECE], frontal pose, clean neutral background, soft studio lighting, natural skin texture, authentic proportions, premium catalog look, vertical, high detail, 4k",
  },
  {
    id: "p10",
    title: "Vídeo — virada de look",
    type: "Vídeo",
    category: "Roupas",
    description:
      "Vídeo com transição de virada trocando de look, ritmo ideal para TikTok e Reels.",
    tags: ["vídeo", "transição", "roupa"],
    image: "/prompts/p4.jpg",
    prompt:
      "Cinematic transition video of a fashion model spinning to reveal a new [PIECE], soft golden hour light, smooth whip pan transition, realistic video frame, 3 seconds, vertical 9:16, dynamic motion, high detail",
  },
  {
    id: "p11",
    title: "Produto em superfície UGC",
    type: "Imagem",
    category: "Produto",
    description:
      "Produto apoiado em uma superfície rústica com luz natural, estética autêntica de criador.",
    tags: ["produto", "ugc", "still"],
    image: "/prompts/p5.jpg",
    prompt:
      "Cozy UGC still life of a [PRODUCT] on a rustic wooden surface, warm natural light, soft shadows, minimalist aesthetic, vertical smartphone photo, shallow depth of field, authentic creator look, high detail, 4k",
  },
  {
    id: "p12",
    title: "CTA Shopee — promo relâmpago",
    type: "Vídeo",
    category: "Shopee",
    description:
      "Cena com chamada de promoção relâmpago para Shopee, com elementos visuais de urgência.",
    tags: ["shopee", "cta", "promoção"],
    image: "/prompts/p6.jpg",
    prompt:
      "Vibrant Shopee flash sale scene, a [PRODUCT] on a glossy orange podium, neon orange and pink glow, countdown timer and discount badge floating, ecommerce livestream aesthetic, dynamic zoom-in, 4 seconds, vertical 9:16, premium commercial look, high detail",
  },
  {
    id: "p13",
    title: "Selfie com café",
    type: "Selfie",
    category: "Selfie",
    description:
      "Selfie estilo UGC segurando um café, com look casual e luz de manhã suave.",
    tags: ["selfie", "lifestyle", "ugc"],
    image: "/prompts/p1.jpg",
    prompt:
      "UGC selfie of a young woman holding an iced coffee, wearing a [PIECE] in [COLOR], cozy cafe setting, soft morning daylight, realistic smartphone photo, vertical, lifestyle creator aesthetic, authentic, sharp detail, 4k",
  },
  {
    id: "p14",
    title: "POV aplicando produto",
    type: "POV",
    category: "POV",
    description:
      "POV em primeira pessoa aplicando produto skincare, com close nas mãos e textura real.",
    tags: ["pov", "skincare", "produto"],
    image: "/prompts/p2.jpg",
    prompt:
      "First person POV close up of hands applying skincare product, soft natural bathroom light, realistic UGC beauty photography, vertical, shallow depth of field, authentic smartphone look, fresh tones, high detail, 4k",
  },
  {
    id: "p15",
    title: "Look no corpo — de costas",
    type: "UGC",
    category: "Look no corpo",
    description:
      "Modelo IA de costas mostrando o detalhe da peça, ideal para destacar tecido e corte.",
    tags: ["look", "roupa", "ia"],
    image: "/prompts/p3.jpg",
    prompt:
      "Realistic photo of a female AI fashion model from the back wearing a [PIECE], clean neutral background, soft studio lighting, natural skin texture, premium catalog look, vertical, high detail, 4k",
  },
  {
    id: "p16",
    title: "Vídeo — caminhada natural",
    type: "Vídeo",
    category: "UGC",
    description:
      "Vídeo da modelo caminhando de forma natural, mostrando o movimento da peça ao vivo.",
    tags: ["vídeo", "movimento", "ugc"],
    image: "/prompts/p4.jpg",
    prompt:
      "Cinematic video of a fashion model walking naturally toward camera wearing a [PIECE], soft daylight, subtle fabric movement, realistic video frame, 4 seconds, vertical 9:16, smooth tracking motion, high detail",
  },
  {
    id: "p17",
    title: "Produto em cabide — premium",
    type: "Imagem",
    category: "Roupas",
    description:
      "Roupa em cabide com fundo gradiente suave, estética premium de e-commerce.",
    tags: ["cabide", "roupa", "premium"],
    image: "/prompts/p5.jpg",
    prompt:
      "Premium e-commerce photo of a [PIECE] on a minimal hanger, soft gradient background, studio lighting, crisp shadows, clean composition, vertical, high detail, 4k",
  },
  {
    id: "p18",
    title: "CTA TikTok Shop — depoimento",
    type: "Vídeo",
    category: "TikTok Shop",
    description:
      "Cena estilo depoimento com produto em destaque e chamada para comprar agora.",
    tags: ["tiktokshop", "cta", "depoimento"],
    image: "/prompts/p6.jpg",
    prompt:
      "Authentic testimonial style scene with a [PRODUCT] highlighted, soft cinematic light, subtle 'compre agora' call to action, realistic UGC video frame, 4 seconds, vertical 9:16, warm tones, high detail",
  },
];

export const CATEGORIES: PromptCategory[] = [
  "Selfie",
  "POV",
  "UGC",
  "Roupas",
  "Produto",
  "Look no corpo",
  "TikTok Shop",
  "Shopee",
];

export const TYPE_BADGES: PromptType[] = [
  "Imagem",
  "Vídeo",
  "POV",
  "Selfie",
  "UGC",
];
