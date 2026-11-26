import React, { useState, useRef, useEffect, useCallback } from 'react';
import MiniGameShell from '../../components/MiniGameShell';
import { getMiniGameById, queueMiniGameReward } from '../../config/minigamesConfig';
import { CHARACTER_SPRITES } from '../../data/characterSprites';

const BEST_SCORE_KEY = 'TTSB_FLAPPY_BEST_V1';
const DAILY_REWARD_GOAL = 24;

// Đường dẫn ảnh tùy chỉnh trong public/images/minigames/ (thả ảnh vào sẽ tự động thay thế)
const CUSTOM_ASSETS = {
  player: '/images/minigames/flappy-player.webp',
  lightning: '/images/minigames/flappy-lightning.webp',
  cactus: '/images/minigames/flappy-cactus.webp',
};

const WORLD_H = 600;
const BIRD_RADIUS = 20;
const GRAVITY = 1220;
const FLAP_VELOCITY = -405;
const OBSTACLE_W = 64;
const OBSTACLE_GAP = 178;
const OBSTACLE_SPAWN_DIST = 250;
const GROUND_H = 54;

function loadBestScore() {
  try {
    return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBestScore(val) {
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(val));
  } catch {
    // ignore
  }
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawLightningFallback(ctx, x, topH) {
  const cx = x + OBSTACLE_W / 2;
  const zigSteps = Math.max(3, Math.floor(topH / 38));
  const segH = topH / zigSteps;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - 14, 0);
  for (let i = 1; i < zigSteps; i += 1) {
    const offset = i % 2 === 1 ? -20 : 8;
    ctx.lineTo(cx + offset, i * segH);
  }
  ctx.lineTo(cx, topH);
  for (let i = zigSteps - 1; i >= 1; i -= 1) {
    const offset = i % 2 === 1 ? 6 : 22;
    ctx.lineTo(cx + offset, i * segH - 4);
  }
  ctx.lineTo(cx + 16, 0);
  ctx.closePath();

  const grad = ctx.createLinearGradient(x, 0, x, topH);
  grad.addColorStop(0, '#FEF08A');
  grad.addColorStop(0.55, '#FACC15');
  grad.addColorStop(1, '#F59E0B');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#593A47';
  ctx.lineJoin = 'round';
  ctx.stroke();

  ctx.fillStyle = '#94A3B8';
  ctx.beginPath();
  ctx.arc(cx - 18, 10, 18, 0, Math.PI * 2);
  ctx.arc(cx + 18, 10, 18, 0, Math.PI * 2);
  ctx.arc(cx, 6, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#593A47';
  ctx.stroke();
  ctx.restore();
}

function drawCactusFallback(ctx, x, bottomY, groundY) {
  const h = groundY - bottomY;
  const cx = x + OBSTACLE_W / 2;
  const trunkW = 36;
  const trunkX = cx - trunkW / 2;

  ctx.save();
  ctx.strokeStyle = '#593A47';
  ctx.lineWidth = 3;

  if (h > 85) {
    const armY = bottomY + Math.min(52, h * 0.36);
    ctx.fillStyle = '#4ADE80';
    drawRoundedRect(ctx, trunkX - 18, armY - 22, 22, 16, 8);
    ctx.fill();
    ctx.stroke();
    drawRoundedRect(ctx, trunkX - 18, armY - 40, 14, 34, 7);
    ctx.fill();
    ctx.stroke();
  }

  if (h > 110) {
    const armY2 = bottomY + Math.min(82, h * 0.54);
    ctx.fillStyle = '#4ADE80';
    drawRoundedRect(ctx, trunkX + trunkW - 4, armY2 - 20, 22, 16, 8);
    ctx.fill();
    ctx.stroke();
    drawRoundedRect(ctx, trunkX + trunkW + 4, armY2 - 38, 14, 34, 7);
    ctx.fill();
    ctx.stroke();
  }

  const cGrad = ctx.createLinearGradient(trunkX, bottomY, trunkX + trunkW, bottomY);
  cGrad.addColorStop(0, '#86EFAC');
  cGrad.addColorStop(0.5, '#4ADE80');
  cGrad.addColorStop(1, '#22C55E');
  ctx.fillStyle = cGrad;
  drawRoundedRect(ctx, trunkX, bottomY, trunkW, h + 6, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FF85A9';
  ctx.strokeStyle = '#593A47';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx - 6, bottomY + 2, 5.5, 0, Math.PI * 2);
  ctx.arc(cx + 6, bottomY + 2, 5.5, 0, Math.PI * 2);
  ctx.arc(cx, bottomY - 4, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FFE066';
  ctx.beginPath();
  ctx.arc(cx, bottomY + 1, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export default function FlappyMiniGame() {
  const game = getMiniGameById('flappy');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(loadBestScore);
  const [phase, setPhase] = useState('ready'); // 'ready' | 'playing' | 'gameover'
  const [result, setResult] = useState(null);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef({
    playerDefault: null,
    playerCustom: null,
    lightning: null,
    cactus: null,
  });
  const worldWRef = useRef(820);
  const phaseRef = useRef('ready');
  phaseRef.current = phase;
  const bestRef = useRef(bestScore);
  bestRef.current = bestScore;

  const stateRef = useRef({
    birdY: WORLD_H * 0.44,
    birdVy: 0,
    pipes: [],
    score: 0,
    sparkles: [],
    cloudOffset: 0,
    bobTime: 0,
  });

  // Preload ảnh mặc định + 3 ảnh tùy chỉnh (nhân vật, tia sét, xương rồng)
  useEffect(() => {
    const defPlayer = new Image();
    defPlayer.src = CHARACTER_SPRITES.user_character;
    defPlayer.onload = () => {
      imagesRef.current.playerDefault = defPlayer;
    };

    const customPlayer = new Image();
    customPlayer.src = CUSTOM_ASSETS.player;
    customPlayer.onload = () => {
      imagesRef.current.playerCustom = customPlayer;
    };

    const lightningImg = new Image();
    lightningImg.src = CUSTOM_ASSETS.lightning;
    lightningImg.onload = () => {
      imagesRef.current.lightning = lightningImg;
    };

    const cactusImg = new Image();
    cactusImg.src = CUSTOM_ASSETS.cactus;
    cactusImg.onload = () => {
      imagesRef.current.cactus = cactusImg;
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const computedW = Math.max(380, Math.min(1200, Math.round((rect.width / rect.height) * WORLD_H)));
      worldWRef.current = computedW;
      if (canvasRef.current) {
        canvasRef.current.width = computedW;
        canvasRef.current.height = WORLD_H;
      }
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const resetWorld = useCallback(() => {
    stateRef.current = {
      birdY: WORLD_H * 0.44,
      birdVy: 0,
      pipes: [],
      score: 0,
      sparkles: [],
      cloudOffset: 0,
      bobTime: 0,
    };
    setScore(0);
    setPhase('ready');
    setResult(null);
  }, []);

  const triggerGameOver = useCallback((finalScore) => {
    setPhase('gameover');
    phaseRef.current = 'gameover';

    let nextBest = bestRef.current;
    if (finalScore > nextBest) {
      nextBest = finalScore;
      setBestScore(nextBest);
      saveBestScore(nextBest);
    }

    if (finalScore >= DAILY_REWARD_GOAL) {
      const bonusTier = finalScore >= 40;
      const hearts = bonusTier ? 5 : game.rewardHearts;
      const stars = bonusTier ? 50 : game.rewardStars;
      queueMiniGameReward({
        gameId: game.id,
        gameTitle: `${game.title} (${finalScore}⭐)`,
        hearts,
        stars,
      });
      setResult({
        won: true,
        title: bonusTier ? 'Huyền Thoại Lướt Mây! 🌟🏆' : 'Hoàn Thành Mốc 24 Sao! 🪽',
        summary: `Bạn đã né Tia Sét & Cây Xương Rồng ghi được ${finalScore} sao (Kỷ lục: ${nextBest} sao)!`,
        rewardHearts: hearts,
        rewardStars: stars,
      });
    } else {
      setResult({
        won: false,
        title: 'Ối! Chạm Chướng Ngại Vật Rồi! ⚡🌵',
        summary: `Bạn ghi được ${finalScore}/${DAILY_REWARD_GOAL} sao (Kỷ lục: ${nextBest}). Thu thập đủ ${DAILY_REWARD_GOAL} sao để hoàn thành nhiệm vụ ngày & nhận thưởng nhé!`,
      });
    }
  }, [game]);

  const flap = useCallback(() => {
    if (phaseRef.current === 'gameover') return;
    if (phaseRef.current === 'ready') {
      setPhase('playing');
      phaseRef.current = 'playing';
    }
    const st = stateRef.current;
    st.birdVy = FLAP_VELOCITY;
    const birdX = Math.min(200, Math.max(96, worldWRef.current * 0.22));
    for (let i = 0; i < 4; i += 1) {
      st.sparkles.push({
        x: birdX - 18,
        y: st.birdY + (Math.random() * 14 - 7),
        vx: -80 - Math.random() * 50,
        vy: Math.random() * 60 - 30,
        life: 0.45,
      });
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (!e.repeat) flap();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [flap]);

  useEffect(() => {
    let rafId = null;
    let lastTs = performance.now();

    const loop = (ts) => {
      const dt = Math.min(0.035, (ts - lastTs) / 1000);
      lastTs = ts;

      const worldW = worldWRef.current;
      const birdX = Math.min(200, Math.max(96, worldW * 0.22));
      const st = stateRef.current;
      const curPhase = phaseRef.current;

      if (curPhase === 'ready') {
        st.bobTime += dt * 4.2;
        st.birdY = WORLD_H * 0.44 + Math.sin(st.bobTime) * 10;
        st.cloudOffset = (st.cloudOffset + 42 * dt) % (worldW + 140);
      } else if (curPhase === 'playing') {
        const speed = Math.min(270, 180 + st.score * 2.4);
        st.cloudOffset = (st.cloudOffset + speed * 0.32 * dt) % (worldW + 140);

        st.birdVy += GRAVITY * dt;
        st.birdY += st.birdVy * dt;

        const lastPipe = st.pipes[st.pipes.length - 1];
        if (!lastPipe || lastPipe.x <= worldW - OBSTACLE_SPAWN_DIST) {
          const minTop = 76;
          const maxTop = WORLD_H - GROUND_H - OBSTACLE_GAP - 76;
          const topH = minTop + Math.random() * (maxTop - minTop);
          st.pipes.push({
            x: worldW + 30,
            topH,
            passed: false,
          });
        }

        let collided = false;
        for (let i = st.pipes.length - 1; i >= 0; i -= 1) {
          const p = st.pipes[i];
          p.x -= speed * dt;

          if (!p.passed && p.x + OBSTACLE_W < birdX) {
            p.passed = true;
            st.score += 1;
            setScore(st.score);
          }

          const hitR = BIRD_RADIUS - 4;
          const inX = birdX + hitR > p.x + 8 && birdX - hitR < p.x + OBSTACLE_W - 8;
          if (inX) {
            if (st.birdY - hitR < p.topH || st.birdY + hitR > p.topH + OBSTACLE_GAP) {
              collided = true;
            }
          }

          if (p.x + OBSTACLE_W < -40) {
            st.pipes.splice(i, 1);
          }
        }

        if (st.birdY - BIRD_RADIUS < 0) {
          st.birdY = BIRD_RADIUS;
          st.birdVy = 0;
        }
        if (st.birdY + BIRD_RADIUS >= WORLD_H - GROUND_H) {
          collided = true;
        }

        for (let i = st.sparkles.length - 1; i >= 0; i -= 1) {
          const sp = st.sparkles[i];
          sp.x += sp.vx * dt;
          sp.y += sp.vy * dt;
          sp.life -= dt;
          if (sp.life <= 0) st.sparkles.splice(i, 1);
        }

        if (collided) {
          triggerGameOver(st.score);
        }
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, worldW, WORLD_H);

        const skyGrad = ctx.createLinearGradient(0, 0, 0, WORLD_H);
        skyGrad.addColorStop(0, '#60A5FA');
        skyGrad.addColorStop(0.58, '#BAE6FD');
        skyGrad.addColorStop(1, '#FEF3C7');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, worldW, WORLD_H);

        // Mây trôi nền
        ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
        const cloudSpacing = 240;
        const count = Math.ceil((worldW + 200) / cloudSpacing);
        for (let i = 0; i < count; i += 1) {
          const baseX = i * cloudSpacing + 80;
          const cy = 90 + (i % 3) * 45;
          const cr = 28 + (i % 2) * 10;
          const drawX =
            (((baseX - st.cloudOffset) % (worldW + 140)) + (worldW + 140)) % (worldW + 140) - 70;
          ctx.beginPath();
          ctx.arc(drawX, cy, cr, 0, Math.PI * 2);
          ctx.arc(drawX + cr * 0.75, cy + 5, cr * 0.75, 0, Math.PI * 2);
          ctx.arc(drawX - cr * 0.75, cy + 6, cr * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }

        // Chướng ngại vật: ưu tiên ảnh tùy chỉnh (flappy-lightning.webp / flappy-cactus.webp), fallback vẽ canvas
        const groundY = WORLD_H - GROUND_H;
        const { lightning, cactus, playerCustom, playerDefault } = imagesRef.current;
        st.pipes.forEach((p) => {
          if (lightning) {
            ctx.drawImage(lightning, p.x, 0, OBSTACLE_W, p.topH);
          } else {
            drawLightningFallback(ctx, p.x, p.topH);
          }

          const bottomY = p.topH + OBSTACLE_GAP;
          const bottomH = groundY - bottomY;
          if (cactus) {
            ctx.drawImage(cactus, p.x, bottomY, OBSTACLE_W, bottomH);
          } else {
            drawCactusFallback(ctx, p.x, bottomY, groundY);
          }

          if (!p.passed) {
            ctx.font = '22px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⭐', p.x + OBSTACLE_W / 2, p.topH + OBSTACLE_GAP / 2);
          }
        });

        st.sparkles.forEach((sp) => {
          ctx.fillStyle = `rgba(255, 224, 102, ${Math.max(0, sp.life * 2)})`;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, 4.5, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle = '#FDE68A';
        ctx.fillRect(0, groundY, worldW, GROUND_H);
        ctx.fillStyle = '#593A47';
        ctx.fillRect(0, groundY, worldW, 3.5);

        // Nhân vật (ưu tiên ảnh flappy-player.webp nếu có)
        const activePlayerImg = playerCustom || playerDefault;
        ctx.save();
        ctx.translate(birdX, st.birdY);
        const angle = curPhase === 'ready' ? 0 : Math.max(-0.45, Math.min(0.65, st.birdVy / 580));
        ctx.rotate(angle);
        if (activePlayerImg) {
          ctx.drawImage(activePlayerImg, -28, -28, 56, 56);
        } else {
          ctx.fillStyle = '#FFE066';
          ctx.strokeStyle = '#593A47';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, BIRD_RADIUS, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        ctx.font = '900 44px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#593A47';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeText(String(st.score), worldW / 2, 62);
        ctx.fillText(String(st.score), worldW / 2, 62);
        ctx.restore();

        if (curPhase === 'ready') {
          const boxW = Math.min(360, worldW - 48);
          const boxX = (worldW - boxW) / 2;
          ctx.save();
          drawRoundedRect(ctx, boxX, WORLD_H * 0.62, boxW, 80, 18);
          ctx.fillStyle = 'rgba(255, 253, 249, 0.94)';
          ctx.fill();
          ctx.strokeStyle = '#593A47';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.fillStyle = '#593A47';
          ctx.font = '900 16px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Chạm màn hình / Click / Nhấn SPACE', worldW / 2, WORLD_H * 0.62 + 31);
          ctx.fillStyle = '#D9386A';
          ctx.font = '800 13px system-ui, sans-serif';
          ctx.fillText(`Né ⚡ Tia Sét & 🌵 Xương Rồng — Đủ ${DAILY_REWARD_GOAL}⭐ xong NV Ngày!`, worldW / 2, WORLD_H * 0.62 + 57);
          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [triggerGameOver]);

  const handleCanvasPointerDown = (e) => {
    e.preventDefault();
    flap();
  };

  return (
    <MiniGameShell
      game={game}
      result={result}
      onRestart={resetWorld}
      fullViewport
      maxWidthClass="max-w-full"
      statusBadge={
        <span className="px-2.5 py-1 rounded-full bg-[#FFE2EC] border-2 border-[#593A47] text-[11px] font-black">
          ⭐ {score} • 🏆 {bestScore}
        </span>
      }
    >
      <div className="w-full flex-1 min-h-0 flex flex-col gap-2">
        <div className="w-full shrink-0 px-3 py-1.5 rounded-2xl bg-white border-2 border-[#593A47] flex items-center justify-between text-xs font-black">
          <span className={score >= DAILY_REWARD_GOAL ? 'text-[#16805D]' : 'text-[#593A47]'}>
            {score >= DAILY_REWARD_GOAL
              ? `✅ Đã đủ ${DAILY_REWARD_GOAL} sao NV Ngày! Bay tiếp phá kỷ lục!`
              : `🎯 Mốc NV Ngày: ${score}/${DAILY_REWARD_GOAL} ⭐ (Né ⚡ Tia Sét & 🌵 Xương Rồng)`}
          </span>
          <span className="text-[#D9386A]">🏆 Kỷ lục: {bestScore}</span>
        </div>

        <div
          ref={containerRef}
          onPointerDown={handleCanvasPointerDown}
          className="relative flex-1 min-h-0 w-full rounded-3xl overflow-hidden border-[3px] border-[#593A47] shadow-[0_7px_0_#593A47] bg-[#BAE6FD] cursor-pointer touch-none"
        >
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>

        <p className="text-center text-[11px] font-bold text-[#7D5867] shrink-0">
          Mobile: <strong>Chạm màn hình</strong> • PC: <strong>Click chuột</strong> hoặc nhấn phím <strong>Space</strong> để nhảy lên né ⚡ Tia Sét & 🌵 Cây Xương Rồng!
        </p>
      </div>
    </MiniGameShell>
  );
}
