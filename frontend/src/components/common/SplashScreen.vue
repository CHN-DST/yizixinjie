<template>
  <Teleport to="body">
    <div
      class="splash-overlay"
      :class="{ exiting }"
      @click="handleSkip"
      ref="overlayRef"
    >
      <canvas ref="canvasRef" class="splash-canvas"></canvas>
      <span v-if="showSkipHint" class="skip-hint">点击跳过</span>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const emit = defineEmits(['done'])

// ── Refs ──
const canvasRef = ref(null)
const overlayRef = ref(null)
const exiting = ref(false)
const showSkipHint = ref(false)

// ── State ──
let animId = null
let startTime = 0
let canvasW = 0
let canvasH = 0
let ctx = null
let particles = []
let paperCanvas = null
let charConfigs = []
let layoutData = null  // { dotX, dotY, mainFontSize }
let frameCount = 0
let fontLoaded = false

// ── Constants ──
const MAIN_TEXT = '一字心解'
const SUB_TEXT = '一字见心'
const FONT_FAMILY = '"Ma Shan Zheng", "KaiTi", "STKaiti", "楷体", serif'
const PAPER_COLOR = '#F7F2E4'
const INK_COLOR = '#1A1A1A'
const INK_LIGHT = 'rgba(26,26,26,0.12)'
const ACCENT_COLOR = '#916F47'

// Timeline (ms)
const T_FADE_IN = 800
const T_WRITE_MAIN = 2200
const T_WRITE_SUB = 3000
const T_FINALE = 3500
const T_EXIT = 3800

// ── Noise helpers ──
function hash(x, y) {
  let h = x * 374761393 + y * 668265263
  h = (h ^ (h >> 13)) * 1274126177
  return ((h ^ (h >> 16)) / 4294967296 + 0.5)
}

function smoothNoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = x - ix, fy = y - iy
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)
  const n00 = hash(ix, iy)
  const n10 = hash(ix + 1, iy)
  const n01 = hash(ix, iy + 1)
  const n11 = hash(ix + 1, iy + 1)
  const nx0 = n00 + (n10 - n00) * sx
  const nx1 = n01 + (n11 - n01) * sx
  return nx0 + (nx1 - nx0) * sy
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)) }
function lerp(a, b, t) { return a + (b - a) * t }
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3) }
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 }

// ── Canvas sizing ──
function sizeCanvas(canvas, ctx2d) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'
  ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0)
  return { w, h, dpr }
}

// ── Paper texture (pre-rendered once) ──
function createPaperTexture(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const pctx = c.getContext('2d')

  // Base color
  pctx.fillStyle = PAPER_COLOR
  pctx.fillRect(0, 0, w, h)

  // Grain noise (sampled, not every pixel)
  const step = 4
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const n = (Math.random() - 0.5) * 8
      pctx.fillStyle = `rgba(210,200,180,${Math.abs(n) / 40})`
      pctx.fillRect(x, y, step, step)
    }
  }

  // Subtle age spots
  for (let i = 0; i < 5; i++) {
    const sx = Math.random() * w
    const sy = Math.random() * h
    const sr = Math.random() * 100 + 40
    const grad = pctx.createRadialGradient(sx, sy, 0, sx, sy, sr)
    grad.addColorStop(0, 'rgba(190,175,150,0.08)')
    grad.addColorStop(1, 'rgba(190,175,150,0)')
    pctx.fillStyle = grad
    pctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2)
  }

  // Mountain silhouettes (very faint)
  pctx.fillStyle = 'rgba(160,150,135,0.04)'
  pctx.beginPath()
  pctx.moveTo(0, h * 0.75)
  pctx.quadraticCurveTo(w * 0.12, h * 0.45, w * 0.22, h * 0.7)
  pctx.quadraticCurveTo(w * 0.3, h * 0.55, w * 0.42, h * 0.72)
  pctx.quadraticCurveTo(w * 0.5, h * 0.5, w * 0.58, h * 0.73)
  pctx.quadraticCurveTo(w * 0.72, h * 0.38, w * 0.85, h * 0.7)
  pctx.quadraticCurveTo(w * 0.92, h * 0.52, w, h * 0.68)
  pctx.lineTo(w, h)
  pctx.lineTo(0, h)
  pctx.closePath()
  pctx.fill()

  return c
}

// ── Particle system ──
function spawnParticle(x, y, type) {
  const p = {
    x, y,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5 - 0.8,
    life: 1,
    decay: 0.005 + Math.random() * 0.02,
    size: 1 + Math.random() * 3,
    type, // 'ink' | 'mist' | 'gold'
  }
  if (type === 'mist') {
    p.size = 0.5 + Math.random() * 1.5
    p.vy = -0.3 - Math.random() * 0.8
    p.vx = (Math.random() - 0.5) * 0.6
    p.decay = 0.003 + Math.random() * 0.008
  }
  if (type === 'gold') {
    p.size = 0.5 + Math.random() * 1
    p.vy = -0.5 - Math.random() * 1
    p.vx = (Math.random() - 0.5) * 0.5
    p.decay = 0.004 + Math.random() * 0.01
  }
  particles.push(p)
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx
    p.y += p.vy
    p.life -= p.decay
    if (p.life <= 0) {
      particles.splice(i, 1)
    }
  }
}

function drawParticles(ctx2d) {
  for (const p of particles) {
    const alpha = p.life
    if (p.type === 'ink') {
      ctx2d.fillStyle = `rgba(26,26,26,${alpha * 0.4})`
      ctx2d.beginPath()
      ctx2d.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx2d.fill()
    } else if (p.type === 'mist') {
      ctx2d.fillStyle = `rgba(40,35,30,${alpha * 0.1})`
      ctx2d.beginPath()
      ctx2d.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
      ctx2d.fill()
    } else if (p.type === 'gold') {
      ctx2d.fillStyle = `rgba(200,170,120,${alpha * 0.5})`
      ctx2d.beginPath()
      ctx2d.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx2d.fill()
    }
  }
}

// ── Character layout ──
function buildCharConfigs(ctx2d, w, h) {
  const mainFontSize = Math.min(w * 0.17, h * 0.1, 96)
  const subFontSize = mainFontSize * 0.52
  const configs = []

  // Measure & position main text
  ctx2d.font = `${mainFontSize}px ${FONT_FAMILY}`
  const mainChars = MAIN_TEXT.split('')
  const mainWidths = mainChars.map(c => ctx2d.measureText(c).width)
  const mainTotalW = mainWidths.reduce((a, b) => a + b, 0) + (mainChars.length - 1) * mainFontSize * 0.08
  const mainStartX = (w - mainTotalW) / 2
  const mainY = h * 0.36

  let cx = mainStartX
  mainChars.forEach((char, i) => {
    const cw = mainWidths[i]
    configs.push({
      char,
      x: cx + cw / 2,
      y: mainY,
      width: cw,
      height: mainFontSize * 1.15,
      fontSize: mainFontSize,
      direction: char === '一' ? 'lr' : 'tb',
      start: T_WRITE_START + i * 380,
      end: T_WRITE_START + (i + 1) * 380 - 40,
    })
    cx += cw + mainFontSize * 0.08
  })

  // Separator dot position (after main text, at same level)
  const dotX = cx + mainFontSize * 0.2
  const dotY = mainY

  // Measure & position sub text (below and right of main)
  ctx2d.font = `${subFontSize}px ${FONT_FAMILY}`
  const subChars = SUB_TEXT.split('')
  const subWidths = subChars.map(c => ctx2d.measureText(c).width)
  const subTotalW = subWidths.reduce((a, b) => a + b, 0) + (subChars.length - 1) * subFontSize * 0.06

  // Sub text starts near the dot position
  const subStartX = Math.min(dotX + mainFontSize * 0.3, w - subTotalW - 40)
  const subY = mainY + mainFontSize * 1.3

  let sx = subStartX
  subChars.forEach((char, i) => {
    const cw = subWidths[i]
    configs.push({
      char,
      x: sx + cw / 2,
      y: subY,
      width: cw,
      height: subFontSize * 1.15,
      fontSize: subFontSize,
      direction: char === '一' ? 'lr' : 'tb',
      start: 2280 + i * 180,
      end: 2280 + (i + 1) * 180 - 20,
    })
    sx += cw + subFontSize * 0.06
  })

  return { configs, mainY, mainFontSize, dotX, dotY, subY, subFontSize }
}

// ── Pre-render characters to offscreen canvases ──
function preRenderChars(configs) {
  configs.forEach(cfg => {
    const off = document.createElement('canvas')
    const padX = cfg.width * 0.2
    const padY = cfg.height * 0.3
    off.width = cfg.width + padX * 2
    off.height = cfg.height + padY * 2
    const offCtx = off.getContext('2d')
    offCtx.font = `${cfg.fontSize}px ${FONT_FAMILY}`
    offCtx.fillStyle = INK_COLOR
    offCtx.textAlign = 'center'
    offCtx.textBaseline = 'middle'
    offCtx.fillText(cfg.char, off.width / 2, off.height / 2)
    cfg.offCanvas = off
  })
}

// ── Draw a single character with reveal ──
function drawChar(ctx2d, cfg, elapsed) {
  const rawProgress = (elapsed - cfg.start) / (cfg.end - cfg.start)
  const progress = clamp(rawProgress, 0, 1)
  if (progress <= 0) return null // Not started
  if (progress >= 1) {
    // Fully revealed
    const off = cfg.offCanvas
    ctx2d.drawImage(off, cfg.x - off.width / 2, cfg.y - off.height / 2)
    return { x: cfg.x, y: cfg.y, done: true }
  }

  const easedProgress = easeOutCubic(progress)
  const off = cfg.offCanvas
  const offW = off.width
  const offH = off.height
  const destX = cfg.x - offW / 2
  const destY = cfg.y - offH / 2

  if (cfg.direction === 'lr') {
    // Reveal left to right
    const revealW = offW * easedProgress
    ctx2d.drawImage(off, 0, 0, revealW, offH, destX, destY, revealW, offH)

    // Brush edge noise
    const edgeX = destX + revealW
    for (let py = destY; py < destY + offH; py += 4) {
      const n = smoothNoise(py * 0.1, elapsed * 0.003) * 6
      if (Math.random() < 0.35) {
        ctx2d.fillStyle = `rgba(26,26,26,${0.15 + Math.random() * 0.2})`
        ctx2d.beginPath()
        ctx2d.arc(edgeX + n, py, 0.8 + Math.random() * 2.5, 0, Math.PI * 2)
        ctx2d.fill()
      }
    }
    return { x: edgeX, y: destY + offH / 2, done: false }
  } else if (cfg.direction === 'tb') {
    // Reveal top to bottom
    const revealH = offH * easedProgress
    ctx2d.drawImage(off, 0, 0, offW, revealH, destX, destY, offW, revealH)

    // Brush edge noise
    const edgeY = destY + revealH
    for (let px = destX; px < destX + offW; px += 4) {
      const n = smoothNoise(px * 0.1, elapsed * 0.003) * 6
      if (Math.random() < 0.35) {
        ctx2d.fillStyle = `rgba(26,26,26,${0.15 + Math.random() * 0.2})`
        ctx2d.beginPath()
        ctx2d.arc(px, edgeY + n, 0.8 + Math.random() * 2.5, 0, Math.PI * 2)
        ctx2d.fill()
      }
    }
    return { x: destX + offW / 2, y: edgeY, done: false }
  }
  return null
}

// ── Draw brush cursor ──
function drawBrush(ctx2d, x, y, angle, alpha = 1) {
  if (alpha <= 0) return
  ctx2d.save()
  ctx2d.globalAlpha = alpha
  ctx2d.translate(x, y)
  ctx2d.rotate(angle)

  const s = 1

  // Handle
  ctx2d.strokeStyle = ACCENT_COLOR
  ctx2d.lineWidth = 2.5 * s
  ctx2d.lineCap = 'round'
  ctx2d.beginPath()
  ctx2d.moveTo(0, -35 * s)
  ctx2d.lineTo(0, -8 * s)
  ctx2d.stroke()

  // Ferrule
  ctx2d.strokeStyle = '#6b5030'
  ctx2d.lineWidth = 4 * s
  ctx2d.beginPath()
  ctx2d.moveTo(0, -10 * s)
  ctx2d.lineTo(0, -6 * s)
  ctx2d.stroke()

  // Brush tip
  ctx2d.fillStyle = INK_COLOR
  ctx2d.beginPath()
  ctx2d.moveTo(-5 * s, -6 * s)
  ctx2d.quadraticCurveTo(-7 * s, -1 * s, -1 * s, 6 * s)
  ctx2d.quadraticCurveTo(0, 8 * s, 1 * s, 6 * s)
  ctx2d.quadraticCurveTo(7 * s, -1 * s, 5 * s, -6 * s)
  ctx2d.closePath()
  ctx2d.fill()

  // Ink on tip
  ctx2d.fillStyle = 'rgba(26,26,26,0.6)'
  ctx2d.beginPath()
  ctx2d.arc(0, 3 * s, 2.5 * s, 0, Math.PI * 2)
  ctx2d.fill()

  ctx2d.restore()
}

// ── Draw warm glow ──
function drawGlow(ctx2d, w, h, elapsed) {
  const alpha = clamp((elapsed - 300) / 600, 0, 0.06)
  if (alpha <= 0) return
  const grad = ctx2d.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.7)
  grad.addColorStop(0, `rgba(245,233,192,${alpha * 1.5})`)
  grad.addColorStop(0.5, `rgba(245,233,192,${alpha})`)
  grad.addColorStop(1, 'rgba(245,233,192,0)')
  ctx2d.fillStyle = grad
  ctx2d.fillRect(0, 0, w, h)
}

// ── Draw vignette ──
function drawVignette(ctx2d, w, h, elapsed) {
  const alpha = clamp(elapsed / 500, 0, 0.25)
  const grad = ctx2d.createRadialGradient(w * 0.5, h * 0.4, Math.min(w, h) * 0.35, w * 0.5, h * 0.5, Math.max(w, h) * 0.8)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(1, `rgba(20,15,8,${alpha})`)
  ctx2d.fillStyle = grad
  ctx2d.fillRect(0, 0, w, h)
}

// ── Ink mist during finale ──
function drawInkMist(ctx2d, elapsed, w, h) {
  const progress = clamp((elapsed - T_FINALE) / (T_EXIT - T_FINALE), 0, 1)
  if (progress <= 0) return
  const alpha = progress * 0.06
  ctx2d.fillStyle = `rgba(26,26,26,${alpha})`
  ctx2d.fillRect(0, 0, w, h)
}

// ── Main animation loop ──
function animate(timestamp) {
  if (!startTime) startTime = timestamp
  const elapsed = timestamp - startTime
  frameCount++

  const canvas = canvasRef.value
  if (!canvas) return
  ctx.clearRect(0, 0, canvasW, canvasH)

  // 1. Paper background
  if (paperCanvas) {
    // Slight floating paper motion
    const floatX = Math.sin(elapsed * 0.0003) * 2
    const floatY = Math.cos(elapsed * 0.0004) * 2
    ctx.drawImage(paperCanvas, floatX, floatY, canvasW + 4, canvasH + 4)
  } else {
    ctx.fillStyle = PAPER_COLOR
    ctx.fillRect(0, 0, canvasW, canvasH)
  }

  // 2. Fade-in from black
  if (elapsed < T_FADE_IN) {
    const alpha = 1 - clamp(elapsed / T_FADE_IN, 0, 1)
    ctx.fillStyle = `rgba(0,0,0,${alpha})`
    ctx.fillRect(0, 0, canvasW, canvasH)
  }

  // 3. Warm glow
  drawGlow(ctx, canvasW, canvasH, elapsed)

  // 4. Draw characters
  let brushPos = null
  let brushAngle = -0.3
  let anyWriting = false

  for (const cfg of charConfigs) {
    const result = drawChar(ctx, cfg, elapsed)
    if (result && !result.done) {
      brushPos = { x: result.x, y: result.y }
      brushAngle = cfg.direction === 'lr' ? 0 : -0.4
      anyWriting = true

      // Spawn particles at brush tip
      if (frameCount % 2 === 0) {
        spawnParticle(result.x, result.y, 'ink')
        if (Math.random() < 0.4) spawnParticle(result.x, result.y, 'mist')
      }
    }
  }

  // 5. Ink dot separator — appear after main text done
  const MAIN_DONE = T_WRITE_START + 3 * 380 + 380 - 40  // ~2260ms, when "解" finishes
  const dotElapsed = elapsed - MAIN_DONE
  if (dotElapsed > 0 && dotElapsed < 500 && layoutData) {
    const dotProgress = clamp(dotElapsed / 400, 0, 1)
    const ds = easeOutCubic(dotProgress)
    const { dotX, dotY, mainFontSize } = layoutData
    const dotR = Math.max(mainFontSize * 0.07, 5) * ds
    ctx.fillStyle = INK_COLOR
    ctx.beginPath()
    ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2)
    ctx.fill()
    // Ink bleed around dot
    ctx.fillStyle = 'rgba(26,26,26,0.08)'
    ctx.beginPath()
    ctx.arc(dotX, dotY, dotR * 3, 0, Math.PI * 2)
    ctx.fill()
  }

  // 6. Finale ink spread effects
  if (elapsed > T_FINALE) {
    if (frameCount % 3 === 0) {
      const cx = canvasW * 0.5 + (Math.random() - 0.5) * canvasW * 0.4
      const cy = canvasH * 0.35 + (Math.random() - 0.5) * canvasH * 0.3
      spawnParticle(cx, cy, Math.random() < 0.3 ? 'gold' : 'mist')
    }
  }

  // 7. Update & draw particles
  updateParticles()
  drawParticles(ctx)

  // 8. Ink mist overlay during finale
  drawInkMist(ctx, elapsed, canvasW, canvasH)

  // 9. Brush cursor
  if (brushPos && anyWriting) {
    const brushAlpha = clamp((elapsed - T_WRITE_START) / 300, 0, 1) *
      (1 - clamp((elapsed - T_WRITE_SUB) / 400, 0, 1))
    // Offset brush to appear behind the tip
    const bx = brushPos.x + (brushAngle === 0 ? -30 : 0)
    const by = brushPos.y - 10
    drawBrush(ctx, bx, by, brushAngle, brushAlpha)
  }

  // 10. Vignette
  drawVignette(ctx, canvasW, canvasH, elapsed)

  // 11. Exit check
  if (elapsed >= T_EXIT && !exiting.value) {
    exiting.value = true
    setTimeout(() => {
      if (animId) cancelAnimationFrame(animId)
      emit('done')
    }, 700)
  }

  if (!exiting.value) {
    animId = requestAnimationFrame(animate)
  }
}

// ── Skip handler ──
function handleSkip() {
  if (exiting.value) return
  exiting.value = true
  if (animId) cancelAnimationFrame(animId)
  setTimeout(() => emit('done'), 500)
}

// ── Font loading ──
async function loadFont() {
  try {
    if (!document.fonts) { fontLoaded = false; return }
    // Try loading Ma Shan Zheng, with 2.5s timeout
    const fontPromise = document.fonts.load(`120px "Ma Shan Zheng"`)
    const timeout = new Promise(resolve => setTimeout(resolve, 1500))
    await Promise.race([fontPromise, timeout])
    fontLoaded = document.fonts.check('120px "Ma Shan Zheng"')
  } catch {
    fontLoaded = false
  }
}

// ── Resize handler ──
function handleResize() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return
  const { w, h } = sizeCanvas(canvas, ctx)
  canvasW = w
  canvasH = h
  paperCanvas = createPaperTexture(w * 2, h * 2)
  // Rebuild layout
  const layout = buildCharConfigs(ctx, w, h)
  charConfigs = layout.configs
  layoutData = layout
  preRenderChars(charConfigs)
}

// ── Lifecycle ──
onMounted(async () => {
  await nextTick()

  const canvas = canvasRef.value
  if (!canvas) return

  ctx = canvas.getContext('2d')
  const { w, h } = sizeCanvas(canvas, ctx)
  canvasW = w
  canvasH = h

  // Paper texture & layout ready BEFORE font (no blocking)
  paperCanvas = createPaperTexture(w * 2, h * 2)
  const layout = buildCharConfigs(ctx, w, h)
  charConfigs = layout.configs
  layoutData = layout
  preRenderChars(charConfigs)

  // Start animation immediately — characters use KaiTi fallback until Ma Shan Zheng loads
  startTime = 0
  animId = requestAnimationFrame(animate)

  // Font loads in background, re-render chars when ready
  loadFont().then(() => {
    if (fontLoaded) {
      const layout2 = buildCharConfigs(ctx, w, h)
      charConfigs = layout2.configs
      layoutData = layout2
      preRenderChars(charConfigs)
    }
  })

  // Show skip hint after 1 second
  setTimeout(() => { showSkipHint.value = true }, 1000)

  // Handle resize
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.splash-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #000;
  cursor: pointer;
  transition: opacity 0.7s var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1));
  opacity: 1;
  -webkit-tap-highlight-color: transparent;
}

.splash-overlay.exiting {
  opacity: 0;
  pointer-events: none;
}

.splash-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.skip-hint {
  position: fixed;
  bottom: 36px;
  right: 28px;
  font-family: var(--font-kai, 'KaiTi', 'STKaiti', serif);
  font-size: 14px;
  color: rgba(140, 114, 89, 0.5);
  letter-spacing: 0.15em;
  animation: fadeInHint 0.6s var(--ease-out, ease-out) both;
  pointer-events: none;
  z-index: 100001;
}

@keyframes fadeInHint {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
