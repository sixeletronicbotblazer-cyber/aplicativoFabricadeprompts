#!/usr/bin/env bash
# Generate 5 reference images for the new Identidade AI prompts.
# Runs SEQUENTIALLY with delays to avoid 429 rate limits, with retry logic.
set -u

OUT_DIR="/home/z/my-project/public/prompts/identity"
mkdir -p "$OUT_DIR"

generate() {
  local prompt="$1"
  local outfile="$2"
  local attempts=0
  local max=4
  while [ $attempts -lt $max ]; do
    attempts=$((attempts + 1))
    echo "  [attempt $attempts/$max] generating $(basename "$outfile")..."
    if z-ai image -p "$prompt" -o "$outfile" -s 1024x1024 2>&1 | tail -3; then
      if [ -s "$outfile" ]; then
        local sz
        sz=$(stat -c %s "$outfile" 2>/dev/null || echo 0)
        if [ "$sz" -gt 5000 ]; then
          echo "  OK: $(basename "$outfile") ($sz bytes)"
          return 0
        fi
      fi
    fi
    echo "  retry in 15s..."
    sleep 15
  done
  echo "  FAILED after $max attempts: $(basename "$outfile")"
  return 1
}

echo "=== [1/5] Frame Mestre — editorial fashion portrait ==="
generate "Ultra photorealistic editorial fashion portrait of a confident young woman, cinematic studio lighting with subtle purple and cyan rim light, dark premium moody background, professional photography, 8K, sharp focus on eyes, natural skin texture, serious fashion model expression, high detail" "$OUT_DIR/img_001.jpg"
sleep 8

echo "=== [2/5] Identity Replacement — woman in lifestyle scene ==="
generate "Ultra photorealistic portrait of a young woman standing in a stylish modern cafe, soft natural window light, candid lifestyle photography, shallow depth of field, premium aesthetic, warm neutral tones, 8K, natural skin texture, authentic moment" "$OUT_DIR/img_002.jpg"
sleep 8

echo "=== [3/5] Studio Master — clean beauty portrait ==="
generate "Ultra photorealistic studio beauty portrait of a young woman, clean light gray seamless studio background, minimalist fitted black crew-neck shirt, soft diffused beauty lighting, passport-style composition head and shoulders, 85mm portrait lens, ultra sharp focus on eyes, natural pores, catchlights in eyes, 8K, professional beauty photography" "$OUT_DIR/img_003.jpg"
sleep 8

echo "=== [4/5] Short Version — urban fashion editorial ==="
generate "Ultra photorealistic fashion portrait of a young woman wearing a stylish modern outfit, urban rooftop background at golden hour, professional photography, cinematic warm lighting, shallow depth of field, 8K, natural skin texture, fashion editorial style, confident pose" "$OUT_DIR/img_004.jpg"
sleep 8

echo "=== [5/5] Ultra Short — minimal interior candid ==="
generate "Ultra photorealistic candid portrait of a young woman in a minimal modern interior, soft natural daylight, neutral beige tones, lifestyle photography, shallow depth of field, 8K, authentic natural expression, premium aesthetic" "$OUT_DIR/img_005.jpg"

echo ""
echo "=== Summary ==="
ls -lh "$OUT_DIR" 2>&1
