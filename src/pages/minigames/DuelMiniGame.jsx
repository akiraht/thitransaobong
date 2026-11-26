import React, { useState, useRef, useEffect, useCallback } from 'react';
import MiniGameShell from '../../components/MiniGameShell';
import { getMiniGameById, queueMiniGameReward } from '../../config/minigamesConfig';
import { CHARACTER_SPRITES } from '../../data/characterSprites';

const VIEW_W = 1000;
const VIEW_H = 480;
const GROUND_Y = 432;
const GRAVITY = 460;
const MAX_PULL = 155;
const POWER_SCALE = 5.6;
const MAX_HP = 100;

const PLAYER_POS = { x: 145, y: 280 };
const ENEMY_POS = { x: 855, y: 280 };

// Đường dẫn ảnh tùy chỉnh trong public/images/minigames/ (thả ảnh vào sẽ tự động thay thế)
const CUSTOM_ASSETS = {
  player: '/images/minigames/duel-player.webp',
  npc: '/images/minigames/duel-npc.webp',
  wall: '/images/minigames/duel-obstacle-wall.webp',
  forest: '/images/minigames/duel-obstacle-forest.webp',
  snowman: '/images/minigames/duel-obstacle-snowman.webp',
  crystal: '/images/minigames/duel-obstacle-crystal.webp',
};

// Chướng ngại vật cản tuyết ở giữa (ném trúng sẽ bị chặn & tính là hụt)
const OBSTACLES = [
  {
    id: 'wall',
    name: '🏰 Tường Thành Băng',
    imgSrc: CUSTOM_ASSETS.wall,
    box: { x: 458, y: 244, w: 84, h: GROUND_Y - 244 },
    hitTest: (x, y) => x >= 462 && x <= 538 && y >= 248 && y <= GROUND_Y,
  },
  {
    id: 'forest',
    name: '🌲 Rừng Thông Tuyết',
    imgSrc: CUSTOM_ASSETS.forest,
    box: { x: 404, y: 238, w: 192, h: GROUND_Y - 238 },
    hitTest: (x, y) =>
      (x >= 408 && x <= 466 && y >= 285 && y <= GROUND_Y) ||
      (x >= 468 && x <= 532 && y >= 242 && y <= GROUND_Y) ||
      (x >= 534 && x <= 592 && y >= 292 && y <= GROUND_Y),
  },
  {
    id: 'snowman',
    name: '☃️ Người Tuyết Khổng Lồ',
    imgSrc: CUSTOM_ASSETS.snowman,
    box: { x: 444, y: 222, w: 112, h: GROUND_Y - 222 },
    hitTest: (x, y) =>
      Math.hypot(x - 500, y - 385) <= 52 ||
      Math.hypot(x - 500, y - 320) <= 38 ||
      Math.hypot(x - 500, y - 270) <= 26,
  },
  {
    id: 'crystal',
    name: '💎 Đỉnh Đá Pha Lê',
    imgSrc: CUSTOM_ASSETS.crystal,
    box: { x: 432, y: 242, w: 142, h: GROUND_Y - 242 },
    hitTest: (x, y) =>
      (x >= 435 && x <= 515 && y >= 250 && y <= GROUND_Y) ||
      (x >= 505 && x <= 570 && y >= 285 && y <= GROUND_Y),
  },
];

function pickRandomObstacle() {
  return OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
}

function randomWind() {
  return Math.round((Math.random() * 110 - 55) / 5) * 5;
}

function getWindLabel(wind) {
  if (Math.abs(wind) < 10) return '🍃 Lặng gió';
  const dir = wind > 0 ? '➡️' : '⬅️';
  const strength = Math.abs(wind) >= 35 ? 'Mạnh' : 'Nhẹ';
  return `🍃 Gió ${dir} ${strength} (${Math.abs(wind)})`;
}

// Tính sát thương theo Tốc Độ ném & Góc ném (+ x2 nếu xuyên qua Vòng Lửa!)
function computeThrowDamage(hitType, vx, vy, isFireball = false) {
  const speed = Math.hypot(vx, vy);
  const maxSpeed = MAX_PULL * POWER_SCALE;
  const speedRatio = Math.min(1.15, Math.max(0.25, speed / maxSpeed));
  const angleDeg = Math.round((Math.atan2(-vy, Math.abs(vx)) * 180) / Math.PI);

  const base = hitType === 'bullseye' ? 24 : hitType === 'direct' ? 18 : 11;
  const speedMult = 0.65 + speedRatio * 0.65;

  let angleMult = 1.0;
  let styleNote = 'Góc chuẩn';
  if (angleDeg >= 52) {
    angleMult = 1.24;
    styleNote = `Cầu vồng bổng ${angleDeg}°`;
  } else if (angleDeg >= 34) {
    angleMult = 1.08;
    styleNote = `Góc đẹp ${angleDeg}°`;
  } else {
    angleMult = 0.86;
    styleNote = `Ném thấp ${angleDeg}°`;
  }

  const rawDmg = Math.max(9, Math.min(40, Math.round(base * speedMult * angleMult)));
  const dmg = isFireball ? rawDmg * 2 : rawDmg;
  const powerLabel = speedRatio >= 0.8 ? 'Lực cực mạnh' : speedRatio >= 0.55 ? 'Lực vừa' : 'Lực nhẹ';
  return { dmg, styleNote, powerLabel };
}

function renderFallbackObstacleSvg(obstacleId) {
  if (obstacleId === 'wall') {
    return (
      <g>
        <rect x="462" y="256" width="76" height={GROUND_Y - 256} rx="6" fill="#E0F2FE" stroke="#593A47" strokeWidth="3.5" />
        <rect x="460" y="242" width="22" height="20" rx="3" fill="#FFFFFF" stroke="#593A47" strokeWidth="3" />
        <rect x="489" y="242" width="22" height="20" rx="3" fill="#FFFFFF" stroke="#593A47" strokeWidth="3" />
        <rect x="518" y="242" width="22" height="20" rx="3" fill="#FFFFFF" stroke="#593A47" strokeWidth="3" />
        <line x1="462" y1="305" x2="538" y2="305" stroke="#93C5FD" strokeWidth="2.5" />
        <line x1="462" y1="355" x2="538" y2="355" stroke="#93C5FD" strokeWidth="2.5" />
      </g>
    );
  }
  if (obstacleId === 'forest') {
    const trees = [
      { cx: 437, topY: 282, w: 30 },
      { cx: 500, topY: 238, w: 38 },
      { cx: 563, topY: 290, w: 30 },
    ];
    return (
      <g>
        {trees.map((t, idx) => (
          <g key={idx}>
            <rect x={t.cx - 8} y={GROUND_Y - 38} width="16" height="38" fill="#B45309" stroke="#593A47" strokeWidth="2.5" />
            <polygon
              points={`${t.cx},${t.topY + 52} ${t.cx - t.w},${GROUND_Y - 30} ${t.cx + t.w},${GROUND_Y - 30}`}
              fill="#4ADE80"
              stroke="#593A47"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <polygon
              points={`${t.cx},${t.topY} ${t.cx - t.w * 0.65},${t.topY + 58} ${t.cx + t.w * 0.65},${t.topY + 58}`}
              fill="#FFFFFF"
              stroke="#593A47"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </g>
        ))}
      </g>
    );
  }
  if (obstacleId === 'snowman') {
    return (
      <g>
        <circle cx="500" cy="385" r="52" fill="#FFFFFF" stroke="#593A47" strokeWidth="3.5" />
        <circle cx="500" cy="320" r="38" fill="#FFFFFF" stroke="#593A47" strokeWidth="3.5" />
        <circle cx="500" cy="270" r="26" fill="#FFFFFF" stroke="#593A47" strokeWidth="3.5" />
        <rect x="470" y="290" width="60" height="12" rx="6" fill="#FB7185" stroke="#593A47" strokeWidth="2.5" />
        <circle cx="491" cy="264" r="3.5" fill="#593A47" />
        <circle cx="509" cy="264" r="3.5" fill="#593A47" />
        <polygon points="500,270 520,274 500,278" fill="#FB923C" stroke="#593A47" strokeWidth="1.8" />
        <rect x="478" y="242" width="44" height="7" rx="3" fill="#593A47" />
        <rect x="486" y="220" width="28" height="24" rx="4" fill="#64748B" stroke="#593A47" strokeWidth="2.5" />
      </g>
    );
  }
  return (
    <g>
      <polygon
        points={`435,${GROUND_Y} 474,244 516,${GROUND_Y}`}
        fill="#A5F3FC"
        stroke="#593A47"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <polygon
        points={`502,${GROUND_Y} 538,282 572,${GROUND_Y}`}
        fill="#C4B5FD"
        stroke="#593A47"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </g>
  );
}

export default function DuelMiniGame() {
  const game = getMiniGameById('duel');
  const [playerHp, setPlayerHp] = useState(MAX_HP);
  const [enemyHp, setEnemyHp] = useState(MAX_HP);
  const [wind, setWind] = useState(() => randomWind());
  const [obstacle, setObstacle] = useState(() => pickRandomObstacle());
  const [turn, setTurn] = useState('player'); // 'player' | 'flying' | 'enemy'
  const [turnCount, setTurnCount] = useState(1);
  const [log, setLog] = useState('Nhấn vào Bé Sao Bông kéo lùi về sau để canh góc & lực ném tuyết!');
  const [aim, setAim] = useState(null);
  const [projectile, setProjectile] = useState(null); // { x, y, owner, isFireball, trail }
  const [burst, setBurst] = useState(null);
  const [result, setResult] = useState(null);

  // Vòng Lửa: 1 hiệp xuất hiện tối đa 2 lần chia đều (1 cho User, 1 cho NPC) ở lượt/vị trí/thời gian ngẫu nhiên
  const [fireRing, setFireRing] = useState(null); // { x, y, rx, ry, triggered } | null
  const fireQuotaRef = useRef({ player: 1, enemy: 1 });
  const fireRingRef = useRef(null);
  fireRingRef.current = fireRing;

  // Kiểm tra ảnh tùy chỉnh trong public/images/minigames/
  const [loadedAssets, setLoadedAssets] = useState({});
  useEffect(() => {
    Object.entries(CUSTOM_ASSETS).forEach(([key, url]) => {
      const img = new Image();
      img.onload = () => setLoadedAssets((prev) => ({ ...prev, [key]: url }));
      img.src = url;
    });
  }, []);

  const [playerMood, setPlayerMood] = useState({ type: 'idle', speech: '' });
  const [enemyMood, setEnemyMood] = useState({ type: 'idle', speech: '' });

  const svgRef = useRef(null);
  const draggingRef = useRef(false);
  const animRef = useRef(null);
  const hpRef = useRef({ player: MAX_HP, enemy: MAX_HP });
  hpRef.current = { player: playerHp, enemy: enemyHp };
  const obstacleRef = useRef(obstacle);
  obstacleRef.current = obstacle;

  const stopAnim = () => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  };

  useEffect(() => () => stopAnim(), []);

  // Random thời gian, vị trí và lượt xuất hiện Vòng Lửa (chia đều 1 lần User, 1 lần NPC mỗi hiệp)
  useEffect(() => {
    if ((turn !== 'player' && turn !== 'enemy') || result) return undefined;
    if (fireQuotaRef.current[turn] <= 0) return undefined;

    // Xác suất random mỗi lượt (tăng cao khi HP thấp để đảm bảo xuất hiện đủ trong hiệp)
    const lowHp = hpRef.current.player <= 55 || hpRef.current.enemy <= 55;
    const chance = lowHp ? 0.72 : 0.42;
    if (Math.random() > chance) return undefined;

    const delayMs = turn === 'player' ? 350 + Math.random() * 1400 : 180 + Math.random() * 350;
    const timer = setTimeout(() => {
      if (fireQuotaRef.current[turn] <= 0) return;
      fireQuotaRef.current[turn] -= 1;
      const rx = 20;
      const ry = 46;
      const x = Math.round(375 + Math.random() * 250);
      const y = Math.round(92 + Math.random() * 115);
      setFireRing({ x, y, rx, ry, triggered: false });
      setLog(
        turn === 'player'
          ? '🔥 VÒNG LỬA XUẤT HIỆN! Ném tuyết xuyên qua Vòng Lửa để biến thành Cầu Lửa x2 sát thương!'
          : '🔥 VÒNG LỬA XUẤT HIỆN ở lượt của Nhóc Mây Giông! Cẩn thận cầu lửa x2!'
      );
    }, delayMs);

    return () => clearTimeout(timer);
  }, [turn, turnCount, result]);

  const flashMoods = (pMood, eMood, durationMs = 1350) => {
    setPlayerMood(pMood);
    setEnemyMood(eMood);
    setTimeout(() => {
      setPlayerMood((cur) => (cur.type === pMood.type ? { type: 'idle', speech: '' } : cur));
      setEnemyMood((cur) => (cur.type === eMood.type ? { type: 'idle', speech: '' } : cur));
    }, durationMs);
  };

  const handleRestart = useCallback(() => {
    stopAnim();
    draggingRef.current = false;
    const nextObs = pickRandomObstacle();
    setObstacle(nextObs);
    setPlayerHp(MAX_HP);
    setEnemyHp(MAX_HP);
    setWind(randomWind());
    fireQuotaRef.current = { player: 1, enemy: 1 };
    setFireRing(null);
    setTurn('player');
    setTurnCount((c) => c + 1);
    setAim(null);
    setProjectile(null);
    setBurst(null);
    setPlayerMood({ type: 'idle', speech: '' });
    setEnemyMood({ type: 'idle', speech: '' });
    setLog(`Trận mới! Vật cản giữa sân: ${nextObs.name}. Kéo lùi để canh góc & lực ném!`);
    setResult(null);
  }, []);

  const showBurst = (x, y, text, color = '#0284C7') => {
    setBurst({ x, y, text, color });
    setTimeout(() => setBurst(null), 950);
  };

  const clientToSvg = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * VIEW_W,
      y: ((clientY - rect.top) / rect.height) * VIEW_H,
    };
  };

  const launchSnowball = useCallback((owner, vx, vy, currentWind) => {
    stopAnim();
    setTurn('flying');
    setAim(null);

    const start = owner === 'player' ? PLAYER_POS : ENEMY_POS;
    let x = start.x;
    let y = start.y;
    let curVx = vx;
    let curVy = vy;
    let isFireball = false;
    let lastTs = performance.now();
    const trail = [{ x, y }];

    const finishShot = (hitType, impactX, impactY) => {
      stopAnim();
      setProjectile(null);
      setFireRing(null); // Xóa vòng lửa sau khi kết thúc lượt ném

      let nextPlayerHp = hpRef.current.player;
      let nextEnemyHp = hpRef.current.enemy;

      if (owner === 'player') {
        if (hitType === 'bullseye' || hitType === 'direct' || hitType === 'castle') {
          const { dmg, styleNote, powerLabel } = computeThrowDamage(hitType, vx, vy, isFireball);
          nextEnemyHp = Math.max(0, nextEnemyHp - dmg);
          setEnemyHp(nextEnemyHp);
          showBurst(
            impactX,
            impactY,
            isFireball ? `🔥 x2 -${dmg} HP!` : `💥 -${dmg} HP!`,
            isFireball ? '#EA580C' : hitType === 'castle' ? '#7C3AED' : '#E11D48'
          );
          flashMoods(
            { type: 'happy', speech: isFireball ? 'Cầu Lửa x2 quá đỉnh! 🔥' : 'Trúng phóc! 🎯' },
            { type: 'hit', speech: isFireball ? 'Nóng quá á á! 🔥😵' : 'Ái da lạnh quá! 😵‍💫' }
          );
          setLog(
            `${isFireball ? '🔥 CẦU LỬA x2' : hitType === 'bullseye' ? '🎯 CHÍ MẠNG' : hitType === 'direct' ? '❄️ TRÚNG MỤC TIÊU' : '🏰 TRÚNG LÂU ĐÀI'}! (${styleNote} • ${powerLabel}) → -${dmg} HP Nhóc Mây Giông!`
          );
        } else {
          showBurst(impactX, impactY, hitType === 'obstacle' ? '🧱 Bị cản (Hụt)!' : '💨 Hụt rồi!', '#64748B');
          flashMoods(
            { type: 'hit', speech: hitType === 'obstacle' ? 'Trúng vật cản rồi! 😅' : 'Hụt mất rồi! 💦' },
            { type: 'taunt', speech: 'Hihi hụt rồi lêu lêu! 😝' }
          );
          setLog(
            hitType === 'obstacle'
              ? `🧱 Tuyết đập trúng ${obstacleRef.current.name} và vỡ tan (tính là hụt)! Hãy ném góc bổng hơn nhé!`
              : '💨 Ném hụt rồi! Nhóc Mây Giông đang cười khì khì kìa!'
          );
        }

        if (nextEnemyHp <= 0) {
          queueMiniGameReward({
            gameId: game.id,
            gameTitle: game.title,
            hearts: game.rewardHearts,
            stars: game.rewardStars,
          });
          setResult({
            won: true,
            title: 'Vô Địch Ném Tuyết! ❄️🏆',
            summary: 'Bạn đã chinh phục Lâu Đài Tuyết của Nhóc Mây Giông bằng những cú ném siêu chuẩn!',
            rewardHearts: game.rewardHearts,
            rewardStars: game.rewardStars,
          });
          return;
        }

        setWind(randomWind());
        setTurn('enemy');
        setTurnCount((c) => c + 1);
      } else {
        if (hitType === 'bullseye' || hitType === 'direct' || hitType === 'castle') {
          const { dmg, styleNote } = computeThrowDamage(hitType, vx, vy, isFireball);
          const enemyDmg = Math.max(8, Math.round(dmg * 0.85));
          nextPlayerHp = Math.max(0, nextPlayerHp - enemyDmg);
          setPlayerHp(nextPlayerHp);
          showBurst(impactX, impactY, isFireball ? `🔥 x2 -${enemyDmg} HP!` : `🥶 -${enemyDmg} HP!`, isFireball ? '#EA580C' : '#E11D48');
          flashMoods(
            { type: 'hit', speech: isFireball ? 'Ái chà Cầu Lửa! 🔥🥶' : 'Lạnh quáaa! 🥶' },
            { type: 'happy', speech: isFireball ? 'Cầu Lửa x2 cực cháy! 🔥' : 'Trúng rồi nha! 😈' }
          );
          setLog(
            `${isFireball ? '🔥 Nhóc Mây Giông bắn Cầu Lửa x2' : '🥶 Nhóc Mây Giông ném trúng'} (${styleNote}) → -${enemyDmg} HP! Đến lượt bạn!`
          );
        } else {
          showBurst(impactX, impactY, hitType === 'obstacle' ? '🧱 Bị cản!' : '😆 Né thoát!', '#16805D');
          flashMoods(
            { type: 'taunt', speech: 'Hihi né được rồi! 😜' },
            { type: 'hit', speech: 'Hừm hụt mất tiêu! 😤' }
          );
          setLog('😆 Nhóc Mây Giông ném hụt rồi! Kéo lùi Bé Sao Bông phản công ngay!');
        }

        if (nextPlayerHp <= 0) {
          setResult({
            won: false,
            title: 'Lâu Đài Tuyết Bị Đóng Băng! ☃️',
            summary: 'Nhóc Mây Giông ném chuẩn quá! Bấm Chơi lại để phục thù nha!',
          });
          return;
        }

        setWind(randomWind());
        setTurn('player');
        setTurnCount((c) => c + 1);
      }
    };

    const step = (ts) => {
      const dt = Math.min(0.032, (ts - lastTs) / 1000);
      lastTs = ts;

      curVx += currentWind * dt;
      curVy += GRAVITY * dt;
      x += curVx * dt;
      y += curVy * dt;

      // Kiểm tra bay xuyên qua Vòng Lửa -> biến thành Cầu Lửa x2 sát thương!
      const ring = fireRingRef.current;
      if (ring && !isFireball) {
        const inRingX = Math.abs(x - ring.x) <= ring.rx + 10;
        const inRingY = Math.abs(y - ring.y) <= ring.ry + 6;
        if (inRingX && inRingY) {
          isFireball = true;
          setFireRing((prev) => (prev ? { ...prev, triggered: true } : null));
          showBurst(ring.x, ring.y - 36, '🔥 CẦU LỬA x2!', '#EA580C');
        }
      }

      trail.push({ x, y });
      if (trail.length > 18) trail.shift();
      setProjectile({ x, y, owner, isFireball, trail: [...trail] });

      const target = owner === 'player' ? ENEMY_POS : PLAYER_POS;
      const distTarget = Math.hypot(x - target.x, y - target.y);
      if (distTarget <= 24) {
        finishShot('bullseye', x, y);
        return;
      }
      if (distTarget <= 48) {
        finishShot('direct', x, y);
        return;
      }

      if (owner === 'player' && x >= 780 && x <= 930 && y >= 312 && y <= GROUND_Y) {
        finishShot('castle', x, y);
        return;
      }
      if (owner === 'enemy' && x >= 70 && x <= 220 && y >= 312 && y <= GROUND_Y) {
        finishShot('castle', x, y);
        return;
      }

      // Chướng ngại vật giữa sân cản tuyết -> ném trúng xem như hụt!
      if (obstacleRef.current.hitTest(x, y)) {
        finishShot('obstacle', x, y);
        return;
      }

      if (y >= GROUND_Y || x < -40 || x > VIEW_W + 40) {
        finishShot('miss', Math.min(VIEW_W - 20, Math.max(20, x)), Math.min(GROUND_Y, y));
        return;
      }

      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
  }, [game]);

  // Lượt AI Nhóc Mây Giông
  useEffect(() => {
    if (turn !== 'enemy' || result) return undefined;
    setEnemyMood({ type: 'aim', speech: 'Đỡ chiêu này! 😤' });
    const timer = setTimeout(() => {
      const flightT = 1.55 + Math.random() * 0.35;
      const dx = PLAYER_POS.x - ENEMY_POS.x;
      const dy = PLAYER_POS.y - ENEMY_POS.y;
      const exactVx = (dx - 0.5 * wind * flightT * flightT) / flightT;
      const exactVy = (dy - 0.5 * GRAVITY * flightT * flightT) / flightT;
      const spreadX = (Math.random() - 0.5) * 105;
      const spreadY = (Math.random() - 0.5) * 75;
      launchSnowball('enemy', exactVx + spreadX, exactVy + spreadY, wind);
    }, 900);
    return () => clearTimeout(timer);
  }, [turn, result, wind, launchSnowball]);

  const updateAimFromPointer = (clientX, clientY) => {
    const pt = clientToSvg(clientX, clientY);
    let dx = PLAYER_POS.x - pt.x;
    let dy = PLAYER_POS.y - pt.y;
    const dist = Math.hypot(dx, dy);
    if (dist > MAX_PULL) {
      dx = (dx / dist) * MAX_PULL;
      dy = (dy / dist) * MAX_PULL;
    }
    if (dx < 15) dx = 15;
    if (dy > -15) dy = -15;

    const vx = dx * POWER_SCALE;
    const vy = dy * POWER_SCALE;
    const powerPct = Math.round((Math.min(MAX_PULL, Math.hypot(dx, dy)) / MAX_PULL) * 100);
    const angleDeg = Math.round((Math.atan2(-vy, vx) * 180) / Math.PI);

    setPlayerMood({ type: 'aim', speech: 'Nhắm kỹ nào... 🎯' });
    setAim({
      vx,
      vy,
      pullX: PLAYER_POS.x - dx,
      pullY: PLAYER_POS.y - dy,
      powerPct,
      angleDeg,
    });
  };

  const handleSvgPointerDown = (e) => {
    if (turn !== 'player' || result) return;
    const pt = clientToSvg(e.clientX, e.clientY);
    if (pt.x > 420) return;
    e.preventDefault();
    draggingRef.current = true;
    updateAimFromPointer(e.clientX, e.clientY);
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current) return;
      updateAimFromPointer(e.clientX, e.clientY);
    };
    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setAim((curAim) => {
        if (curAim && curAim.powerPct >= 12) {
          launchSnowball('player', curAim.vx, curAim.vy, wind);
        } else {
          setPlayerMood({ type: 'idle', speech: '' });
        }
        return null;
      });
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [wind, launchSnowball]);

  const trajectoryDots = [];
  if (aim) {
    for (let i = 1; i <= 16; i += 1) {
      const t = i * 0.085;
      const px = PLAYER_POS.x + aim.vx * t + 0.5 * wind * t * t;
      const py = PLAYER_POS.y + aim.vy * t + 0.5 * GRAVITY * t * t;
      if (py > GROUND_Y || px > VIEW_W) break;
      trajectoryDots.push({ x: px, y: py, opacity: Math.max(0.18, 1 - i * 0.052), r: Math.max(3, 6.4 - i * 0.2) });
    }
  }

  const defaultPlayerSprite =
    playerMood.type === 'happy' || playerMood.type === 'taunt'
      ? CHARACTER_SPRITES.user_happy
      : playerMood.type === 'aim'
        ? CHARACTER_SPRITES.user_hardworking
        : playerMood.type === 'hit'
          ? CHARACTER_SPRITES.user_sleepy
          : CHARACTER_SPRITES.user_character;

  const playerSprite = loadedAssets.player || defaultPlayerSprite;
  const enemySprite = loadedAssets.npc || CHARACTER_SPRITES.storm_cloud;
  const obstacleImgUrl = loadedAssets[obstacle.id] || null;

  return (
    <MiniGameShell
      game={game}
      result={result}
      onRestart={handleRestart}
      fullViewport
      maxWidthClass="max-w-full"
      statusBadge={
        <span className="px-2.5 py-1 rounded-full bg-[#E0F2FE] border-2 border-[#593A47] text-[11px] font-black">
          {getWindLabel(wind)} • {obstacle.name}
        </span>
      }
    >
      <div className="w-full flex-1 min-h-0 flex flex-col gap-2">
        {/* Thanh máu 2 bên */}
        <div className="shrink-0 px-3 py-2 rounded-2xl bg-white border-[2.5px] border-[#593A47] shadow-[0_4px_0_#593A47] grid grid-cols-2 gap-4 items-center">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-black">
              <span>⭐ Bé Sao Bông</span>
              <span className="text-[#16805D]">{playerHp}/{MAX_HP} HP</span>
            </div>
            <div className="h-3.5 rounded-full bg-[#F1F5F9] border-2 border-[#593A47] overflow-hidden">
              <div
                style={{ width: `${playerHp}%` }}
                className="h-full bg-gradient-to-r from-[#34D399] to-[#10B981] transition-all duration-300"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-black">
              <span>☁️ Nhóc Mây Giông</span>
              <span className="text-[#E11D48]">{enemyHp}/{MAX_HP} HP</span>
            </div>
            <div className="h-3.5 rounded-full bg-[#F1F5F9] border-2 border-[#593A47] overflow-hidden">
              <div
                style={{ width: `${enemyHp}%` }}
                className="h-full bg-gradient-to-r from-[#FB7185] to-[#E11D48] transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Sân đấu 2 Lâu Đài Tuyết full <main> */}
        <div className="flex-1 min-h-0 w-full rounded-3xl overflow-hidden border-[3px] border-[#593A47] shadow-[0_7px_0_#593A47] bg-[#E0F2FE] flex items-center justify-center">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="xMidYMid meet"
            onPointerDown={handleSvgPointerDown}
            className={`w-full h-full block touch-none select-none ${
              turn === 'player' ? 'cursor-crosshair' : 'cursor-default'
            }`}
          >
            <defs>
              <linearGradient id="winterSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7DD3FC" />
                <stop offset="55%" stopColor="#E0F2FE" />
                <stop offset="100%" stopColor="#FFFDF9" />
              </linearGradient>
              <linearGradient id="castleLeft" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#BAE6FD" />
              </linearGradient>
              <linearGradient id="castleRight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#DDD6FE" />
              </linearGradient>
              <linearGradient id="fireRingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="50%" stopColor="#FB923C" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>

            <rect width={VIEW_W} height={VIEW_H} fill="url(#winterSky)" />

            {/* Núi tuyết xa xa */}
            <path d="M0 432 L210 250 L420 432 Z" fill="#DBEAFE" opacity="0.7" />
            <path d="M290 432 L510 215 L740 432 Z" fill="#E0E7FF" opacity="0.65" />
            <path d="M620 432 L830 240 L1000 385 L1000 432 Z" fill="#DBEAFE" opacity="0.75" />

            {/* Bông tuyết trang trí */}
            {[
              [110, 70], [260, 110], [420, 65], [580, 95], [740, 55], [890, 105], [330, 165], [660, 150],
            ].map(([sx, sy], i) => (
              <circle key={i} cx={sx} cy={sy} r={i % 2 === 0 ? 4 : 2.8} fill="#FFFFFF" opacity="0.85" />
            ))}

            {/* Chướng ngại vật cản tuyết ở giữa (ưu tiên ảnh thiết kế riêng, fallback vector) */}
            {obstacleImgUrl ? (
              <image
                href={obstacleImgUrl}
                x={obstacle.box.x}
                y={obstacle.box.y}
                width={obstacle.box.w}
                height={obstacle.box.h}
                preserveAspectRatio="xMidYMax meet"
              />
            ) : (
              renderFallbackObstacleSvg(obstacle.id)
            )}

            {/* === VÒNG LỬA X2 SÁT THƯƠNG (XUẤT HIỆN RANDOM GIỮA SÂN) === */}
            {fireRing && (
              <g>
                {/* Hào quang ngoài */}
                <ellipse
                  cx={fireRing.x}
                  cy={fireRing.y}
                  rx={fireRing.rx + 8}
                  ry={fireRing.ry + 8}
                  fill="none"
                  stroke="#FDE047"
                  strokeWidth="6"
                  opacity={fireRing.triggered ? '0.95' : '0.45'}
                />
                {/* Vòng lửa chính */}
                <ellipse
                  cx={fireRing.x}
                  cy={fireRing.y}
                  rx={fireRing.rx}
                  ry={fireRing.ry}
                  fill={fireRing.triggered ? 'rgba(251,146,60,0.3)' : 'rgba(254,240,138,0.16)'}
                  stroke="url(#fireRingGrad)"
                  strokeWidth="9"
                />
                <ellipse
                  cx={fireRing.x}
                  cy={fireRing.y}
                  rx={fireRing.rx}
                  ry={fireRing.ry}
                  fill="none"
                  stroke="#593A47"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
                <text x={fireRing.x} y={fireRing.y - fireRing.ry - 10} textAnchor="middle" fontSize="14" fontWeight="900" fill="#EA580C" stroke="#FFFFFF" strokeWidth="3.5" paintOrder="stroke">
                  🔥 x2 SÁT THƯƠNG
                </text>
              </g>
            )}

            {/* Mặt đất tuyết phủ */}
            <rect x="0" y={GROUND_Y} width={VIEW_W} height={VIEW_H - GROUND_Y} fill="#FFFFFF" />
            <line x1="0" y1={GROUND_Y} x2={VIEW_W} y2={GROUND_Y} stroke="#593A47" strokeWidth="3.5" />

            {/* === LÂU ĐÀI TUYẾT BÊN TRÁI (NGƯỜI CHƠI) === */}
            <g>
              <rect x="70" y="314" width="150" height="118" rx="10" fill="url(#castleLeft)" stroke="#593A47" strokeWidth="3.5" />
              <rect x="70" y="298" width="28" height="22" rx="4" fill="#FFFFFF" stroke="#593A47" strokeWidth="3" />
              <rect x="111" y="298" width="28" height="22" rx="4" fill="#FFFFFF" stroke="#593A47" strokeWidth="3" />
              <rect x="151" y="298" width="28" height="22" rx="4" fill="#FFFFFF" stroke="#593A47" strokeWidth="3" />
              <rect x="192" y="298" width="28" height="22" rx="4" fill="#FFFFFF" stroke="#593A47" strokeWidth="3" />
              <path d="M123 432 L123 384 A22 22 0 0 1 167 384 L167 432 Z" fill="#7DD3FC" stroke="#593A47" strokeWidth="3" />
              <line x1="84" y1="298" x2="84" y2="250" stroke="#593A47" strokeWidth="3" />
              <polygon points="84,252 118,262 84,272" fill="#FF85A9" stroke="#593A47" strokeWidth="2.5" />
            </g>

            {/* === LÂU ĐÀI TUYẾT BÊN PHẢI (NHÓC MÂY GIÔNG) === */}
            <g>
              <rect x="780" y="314" width="150" height="118" rx="10" fill="url(#castleRight)" stroke="#593A47" strokeWidth="3.5" />
              <rect x="780" y="298" width="28" height="22" rx="4" fill="#FFFFFF" stroke="#593A47" strokeWidth="3" />
              <rect x="821" y="298" width="28" height="22" rx="4" fill="#FFFFFF" stroke="#593A47" strokeWidth="3" />
              <rect x="861" y="298" width="28" height="22" rx="4" fill="#FFFFFF" stroke="#593A47" strokeWidth="3" />
              <rect x="902" y="298" width="28" height="22" rx="4" fill="#FFFFFF" stroke="#593A47" strokeWidth="3" />
              <path d="M833 432 L833 384 A22 22 0 0 1 877 384 L877 432 Z" fill="#C4B5FD" stroke="#593A47" strokeWidth="3" />
              <line x1="916" y1="298" x2="916" y2="250" stroke="#593A47" strokeWidth="3" />
              <polygon points="916,252 882,262 916,272" fill="#A78BFA" stroke="#593A47" strokeWidth="2.5" />
            </g>

            {turn === 'player' && !aim && (
              <circle
                cx={PLAYER_POS.x}
                cy={PLAYER_POS.y}
                r="45"
                fill="#FFE066"
                fillOpacity="0.22"
                stroke="#FF6B9D"
                strokeWidth="3"
                strokeDasharray="7 5"
              />
            )}

            {/* Nhân vật Bé Sao Bông */}
            <g
              transform={
                playerMood.type === 'hit'
                  ? `translate(${PLAYER_POS.x}, ${PLAYER_POS.y}) rotate(-12) translate(${-PLAYER_POS.x}, ${-PLAYER_POS.y})`
                  : playerMood.type === 'happy' || playerMood.type === 'taunt'
                    ? 'translate(0, -8)'
                    : undefined
              }
            >
              <image
                href={playerSprite}
                x={PLAYER_POS.x - 38}
                y={PLAYER_POS.y - 40}
                width="76"
                height="76"
                preserveAspectRatio="xMidYMid meet"
              />
              {playerMood.type === 'hit' && (
                <text x={PLAYER_POS.x} y={PLAYER_POS.y - 42} textAnchor="middle" fontSize="22">
                  💫🥶
                </text>
              )}
            </g>

            {playerMood.speech && !aim && (
              <g transform={`translate(${PLAYER_POS.x + 12}, ${PLAYER_POS.y - 62})`}>
                <rect x="-80" y="-18" width="160" height="28" rx="14" fill="#FFFDF9" stroke="#593A47" strokeWidth="2.5" />
                <text x="0" y="0" textAnchor="middle" fontSize="12" fontWeight="900" fill="#593A47">
                  {playerMood.speech}
                </text>
              </g>
            )}

            {/* Nhân vật Nhóc Mây Giông */}
            <g
              transform={
                enemyMood.type === 'hit'
                  ? `translate(${ENEMY_POS.x}, ${ENEMY_POS.y}) rotate(14) translate(${-ENEMY_POS.x}, ${-ENEMY_POS.y})`
                  : enemyMood.type === 'happy' || enemyMood.type === 'taunt'
                    ? 'translate(0, -8)'
                    : undefined
              }
            >
              <image
                href={enemySprite}
                x={ENEMY_POS.x - 40}
                y={ENEMY_POS.y - 40}
                width="80"
                height="80"
                preserveAspectRatio="xMidYMid meet"
              />
              {enemyMood.type === 'hit' && (
                <text x={ENEMY_POS.x} y={ENEMY_POS.y - 42} textAnchor="middle" fontSize="22">
                  💫😵‍💫
                </text>
              )}
              {enemyMood.type === 'taunt' && (
                <text x={ENEMY_POS.x} y={ENEMY_POS.y - 42} textAnchor="middle" fontSize="22">
                  😝
                </text>
              )}
            </g>

            {enemyMood.speech && (
              <g transform={`translate(${ENEMY_POS.x - 16}, ${ENEMY_POS.y - 62})`}>
                <rect x="-86" y="-18" width="172" height="28" rx="14" fill="#FFFDF9" stroke="#593A47" strokeWidth="2.5" />
                <text x="0" y="0" textAnchor="middle" fontSize="12" fontWeight="900" fill="#593A47">
                  {enemyMood.speech}
                </text>
              </g>
            )}

            {/* Dây kéo & đường cong quỹ đạo canh góc */}
            {aim && (
              <g>
                <line
                  x1={PLAYER_POS.x}
                  y1={PLAYER_POS.y}
                  x2={aim.pullX}
                  y2={aim.pullY}
                  stroke="#FF6B9D"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle cx={aim.pullX} cy={aim.pullY} r="9" fill="#FFFFFF" stroke="#593A47" strokeWidth="3" />
                {trajectoryDots.map((dot, idx) => (
                  <circle
                    key={idx}
                    cx={dot.x}
                    cy={dot.y}
                    r={dot.r}
                    fill="#FFFFFF"
                    stroke="#0284C7"
                    strokeWidth="2"
                    opacity={dot.opacity}
                  />
                ))}
                <g transform={`translate(${PLAYER_POS.x + 10}, ${PLAYER_POS.y - 60})`}>
                  <rect x="-74" y="-16" width="148" height="26" rx="13" fill="#FFF3B0" stroke="#593A47" strokeWidth="2.5" />
                  <text x="0" y="2" textAnchor="middle" fontSize="12" fontWeight="900" fill="#593A47">
                    Góc {aim.angleDeg}° • Lực {aim.powerPct}%
                  </text>
                </g>
              </g>
            )}

            {/* Bóng tuyết hoặc Cầu Lửa đang bay */}
            {projectile && (
              <g>
                {projectile.trail.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={(projectile.isFireball ? 3.5 : 2) + (i / projectile.trail.length) * (projectile.isFireball ? 7 : 5.2)}
                    fill={projectile.isFireball ? (i % 2 === 0 ? '#FB923C' : '#FDE047') : '#FFFFFF'}
                    opacity={(i / projectile.trail.length) * 0.75}
                  />
                ))}
                {projectile.isFireball ? (
                  <g>
                    <circle cx={projectile.x} cy={projectile.y} r="16" fill="#F97316" opacity="0.45" />
                    <circle cx={projectile.x} cy={projectile.y} r="12" fill="#FEF08A" stroke="#DC2626" strokeWidth="3.5" />
                  </g>
                ) : (
                  <circle
                    cx={projectile.x}
                    cy={projectile.y}
                    r="11.5"
                    fill="#FFFFFF"
                    stroke="#0284C7"
                    strokeWidth="3"
                  />
                )}
              </g>
            )}

            {/* Hiệu ứng va chạm */}
            {burst && (
              <g transform={`translate(${burst.x}, ${burst.y - 24})`}>
                <circle cx="0" cy="24" r="26" fill="#FFFFFF" opacity="0.8" />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  fontSize="21"
                  fontWeight="900"
                  fill={burst.color}
                  stroke="#FFFFFF"
                  strokeWidth="4"
                  paintOrder="stroke"
                >
                  {burst.text}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Nhật ký trận đấu */}
        <div className="shrink-0 px-3 py-2 rounded-2xl bg-white border-[2.5px] border-[#593A47] shadow-[0_4px_0_#593A47] text-xs sm:text-sm font-extrabold text-center text-[#593A47]">
          {log}
        </div>
      </div>
    </MiniGameShell>
  );
}
