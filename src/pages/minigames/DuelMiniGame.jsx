import React, { useState, useCallback } from 'react';
import MiniGameShell from '../../components/MiniGameShell';
import { getMiniGameById, queueMiniGameReward } from '../../config/minigamesConfig';
import { CHARACTER_SPRITES } from '../../data/characterSprites';

const MAX_HP = 100;

export default function DuelMiniGame() {
  const game = getMiniGameById('duel');
  const [playerHp, setPlayerHp] = useState(MAX_HP);
  const [enemyHp, setEnemyHp] = useState(MAX_HP);
  const [energy, setEnergy] = useState(0); // Đủ 2 năng lượng -> Siêu Cầu Sao
  const [log, setLog] = useState('Nhóc Mây Giông thách đấu ném bóng tuyết! Chọn chiêu thức của bạn nhé!');
  const [isBusy, setIsBusy] = useState(false);
  const [result, setResult] = useState(null);

  const handleRestart = useCallback(() => {
    setPlayerHp(MAX_HP);
    setEnemyHp(MAX_HP);
    setEnergy(0);
    setLog('Trận đấu mới bắt đầu! Chọn chiêu thức kawaii nào!');
    setIsBusy(false);
    setResult(null);
  }, []);

  const handleAction = (action) => {
    if (isBusy || result) return;
    if (action === 'ult' && energy < 2) return;

    setIsBusy(true);
    const enemyMoves = ['throw', 'throw', 'shield', 'charge'];
    const enemyMove = enemyMoves[Math.floor(Math.random() * enemyMoves.length)];

    let pHp = playerHp;
    let eHp = enemyHp;
    let nextEnergy = energy;
    let msg = '';

    if (action === 'throw') {
      nextEnergy = Math.min(2, energy + 1);
      if (enemyMove === 'shield') {
        pHp = Math.max(0, pHp - 10);
        msg = '🛡️ Nhóc Mây Giông dựng Khiên Băng phản lại 10 sát thương! (+1 Năng lượng)';
      } else {
        eHp = Math.max(0, eHp - 22);
        msg = '❄️ Bạn ném Bóng Tuyết trúng phóc! (-22 HP Nhóc Mây Giông)';
        if (enemyMove === 'throw') {
          pHp = Math.max(0, pHp - 16);
          msg += ' • Nhóc cũng ném lại (-16 HP)!';
        }
      }
    } else if (action === 'shield') {
      nextEnergy = Math.min(2, energy + 1);
      if (enemyMove === 'throw') {
        eHp = Math.max(0, eHp - 15);
        msg = '🛡️ Khiên Băng hoàn hảo! Bạn chặn sạch & phản 15 sát thương!';
      } else {
        msg = '🛡️ Bạn dựng Khiên Băng phòng thủ an toàn (+1 Năng lượng).';
      }
    } else if (action === 'ult') {
      nextEnergy = 0;
      eHp = Math.max(0, eHp - 38);
      msg = '🌟 SIÊU CẦU SAO BÔNG xuyên phá mọi khiên! (-38 HP Nhóc Mây Giông)';
      if (enemyMove === 'throw') {
        pHp = Math.max(0, pHp - 12);
      }
    }

    setTimeout(() => {
      setPlayerHp(pHp);
      setEnemyHp(eHp);
      setEnergy(nextEnergy);
      setLog(msg);
      setIsBusy(false);

      if (eHp <= 0) {
        queueMiniGameReward({
          gameId: game.id,
          gameTitle: game.title,
          hearts: game.rewardHearts,
          stars: game.rewardStars,
        });
        setResult({
          won: true,
          title: 'Nhà Vô Địch Bóng Tuyết! ❄️🏆',
          summary: 'Nhóc Mây Giông cười toe toét nhận thua và tặng bạn phần thưởng đặc biệt!',
          rewardHearts: game.rewardHearts,
          rewardStars: game.rewardStars,
        });
      } else if (pHp <= 0) {
        setResult({
          won: false,
          title: 'Bị Trúng Tuyết Lạnh Rồi! ☃️',
          summary: 'Nhóc Mây Giông thắng sát nút! Bấm Chơi lại để đấu tiếp nhé!',
        });
      }
    }, 260);
  };

  return (
    <MiniGameShell
      game={game}
      result={result}
      onRestart={handleRestart}
      statusBadge={
        <span className="px-2.5 py-1 rounded-full bg-[#FFE4EE] border-2 border-[#593A47] text-[11px] font-black">
          ⚡ Năng lượng: {energy}/2
        </span>
      }
    >
      <div className="w-full max-w-md space-y-4">
        {/* Đấu trường Kawaii */}
        <div className="p-4 rounded-3xl bg-gradient-to-b from-[#E0F2FE] to-[#FFFDF9] border-[3px] border-[#593A47] shadow-[0_6px_0_#593A47] space-y-4">
          <div className="grid grid-cols-2 gap-3 items-end">
            {/* Người chơi */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-full space-y-1">
                <div className="flex justify-between text-[11px] font-black">
                  <span>Bé Sao Bông</span>
                  <span>{playerHp}/100</span>
                </div>
                <div className="w-full h-3 rounded-full bg-white border-2 border-[#593A47] overflow-hidden">
                  <div
                    style={{ width: `${playerHp}%` }}
                    className="h-full bg-[#34D399] transition-all duration-300"
                  />
                </div>
              </div>
              <img
                src={CHARACTER_SPRITES.user_character}
                alt="Bé Sao Bông"
                className="w-20 h-20 object-contain drop-shadow"
              />
            </div>

            {/* Đối thủ NPC */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-full space-y-1">
                <div className="flex justify-between text-[11px] font-black">
                  <span>Nhóc Mây Giông</span>
                  <span>{enemyHp}/100</span>
                </div>
                <div className="w-full h-3 rounded-full bg-white border-2 border-[#593A47] overflow-hidden">
                  <div
                    style={{ width: `${enemyHp}%` }}
                    className="h-full bg-[#FB7185] transition-all duration-300"
                  />
                </div>
              </div>
              <img
                src={CHARACTER_SPRITES.storm_cloud}
                alt="Nhóc Mây Giông"
                className="w-20 h-20 object-contain drop-shadow"
              />
            </div>
          </div>

          {/* Nhật ký chiến đấu */}
          <div className="p-3 rounded-2xl bg-white border-2 border-[#593A47] text-xs font-extrabold text-center text-[#593A47] min-h-[48px] flex items-center justify-center">
            {log}
          </div>
        </div>

        {/* 3 Nút chiêu thức */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => handleAction('throw')}
            className="kawaii-btn p-3 bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#593A47] flex flex-col items-center gap-1 cursor-pointer"
          >
            <span className="text-2xl">❄️</span>
            <span className="text-xs font-black">Ném Tuyết</span>
            <span className="text-[9px] font-bold text-[#0369A1]">-22 HP • +1⚡</span>
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={() => handleAction('shield')}
            className="kawaii-btn p-3 bg-[#DFF8EB] hover:bg-[#A7F3D0] text-[#593A47] flex flex-col items-center gap-1 cursor-pointer"
          >
            <span className="text-2xl">🛡️</span>
            <span className="text-xs font-black">Khiên Băng</span>
            <span className="text-[9px] font-bold text-[#047857]">Phản đòn • +1⚡</span>
          </button>

          <button
            type="button"
            disabled={isBusy || energy < 2}
            onClick={() => handleAction('ult')}
            className={`kawaii-btn p-3 flex flex-col items-center gap-1 cursor-pointer ${
              energy >= 2
                ? 'bg-[#FFE066] hover:bg-[#FFD166] text-[#593A47] animate-pulse'
                : 'bg-[#F1F5F9] text-[#94A3B8] opacity-60 cursor-not-allowed'
            }`}
          >
            <span className="text-2xl">🌟</span>
            <span className="text-xs font-black">Siêu Cầu Sao</span>
            <span className="text-[9px] font-bold">Xuyên khiên (2⚡)</span>
          </button>
        </div>
      </div>
    </MiniGameShell>
  );
}
