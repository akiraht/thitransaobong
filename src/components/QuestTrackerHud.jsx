import React, { useState } from 'react';

/**
 * SỔ TAY HÀNH TRÌNH & ICON NHIỆM VỤ GÓC TRÊN BÊN TRÁI
 * Gồm 2 tab:
 *  1. Hành Trình Ngày (5 nhiệm vụ mỗi ngày + Chuỗi Streak + Hộp quà 5/5)
 *  2. Trên Bản Đồ (Gợi ý vị trí các vật phẩm mini-game đang rải trên 4 map)
 */
export default function QuestTrackerHud({
  levelInfo = null,
  unlockedBadgeCount = 0,
  totalBadgeCount = 30,
  dailyQuestsState,
  questsState,
  isOpen,
  onToggleOpen,
  onClaimDailyBox,
  onCompleteDailyQuiz,
  currentMapId,
  onJumpToMap,
  isTownUnlocked = true,
}) {
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'inworld'
  const [activeQuizQuest, setActiveQuizQuest] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState('');

  if (!isTownUnlocked) return null;

  const dailyList = dailyQuestsState?.quests || [];
  const dailyDoneCount = dailyList.filter((q) => q.done).length;
  const dailyTotal = dailyList.length || 5;
  const canClaimBox = dailyDoneCount >= dailyTotal && !dailyQuestsState?.boxClaimed;

  const allInWorld = Object.values(questsState?.quests || {});
  const activeInWorld = allInWorld.filter(
    (q) => q.status === 'active' || q.status === 'ready_to_claim'
  );
  const completedInWorld = allInWorld.filter((q) => q.status === 'completed');

  return (
    <>
      {/* NÚT ICON SỔ TAY HÀNH TRÌNH (NẰM TRONG CỤM TOP-RIGHT MENU) */}
      <button
        type="button"
        onClick={onToggleOpen}
        aria-label="Mở Sổ Tay Hành Trình"
        title="Sổ Tay Hành Trình & Gợi Ý Nhiệm Vụ"
        className={`h-9 sm:h-10 px-2.5 sm:px-3 rounded-full border-[2.5px] border-[#593A47] shadow-[0_3px_0_#593A47] flex items-center gap-1.5 font-black text-xs sm:text-sm text-[#593A47] transition active:translate-y-0.5 pointer-events-auto select-none ${
          canClaimBox
            ? 'bg-[#6EE7B7] animate-bounce'
            : activeInWorld.length > 0
            ? 'bg-[#FFE066] hover:bg-[#FFD166]'
            : 'bg-white/95 hover:bg-[#FFF4BD]'
        }`}
      >
        <span className="text-sm sm:text-base">{canClaimBox ? '🎁' : '📜'}</span>
        <span className="hidden sm:inline">Hành trình</span>
        <span className="min-w-[24px] h-[18px] px-1 rounded-full bg-[#FF6B9D] border-[1.5px] border-[#593A47] text-white text-[10px] font-black flex items-center justify-center leading-none">
          {dailyDoneCount}/{dailyTotal}
        </span>
      </button>

      {/* POPOVER / MODAL SỔ TAY HÀNH TRÌNH (CĂN PHẢI TRÊN PC, GIỮA TRÊN MOBILE) */}
      {isOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) onToggleOpen();
          }}
          className="fixed inset-0 z-[970] bg-[#593A47]/50 backdrop-blur-[2px] flex items-start justify-center sm:justify-end p-3 pt-16 sm:pr-4 overflow-y-auto"
        >
          <div className="kawaii-card w-full max-w-sm max-h-[82dvh] flex flex-col bg-[#FFFDF9] overflow-hidden pop-in">
            {/* HEADER */}
            <div className="px-4 py-3 bg-gradient-to-r from-[#FFF3B0] to-[#FFE4EE] border-b-[2.5px] border-[#593A47] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📜</span>
                <div className="text-left">
                  <h3 className="text-sm font-black text-[#593A47] leading-tight">
                    Sổ Tay Hành Trình • LV.{levelInfo?.level ?? 0}
                  </h3>
                  <p className="text-[11px] font-bold text-[#7D5867]">
                    🏅 <strong>{unlockedBadgeCount}/{totalBadgeCount}</strong> • 🔥{' '}
                    <strong>{dailyQuestsState?.dailyStreak || 0} ngày</strong> • ⭐{' '}
                    <strong>{dailyQuestsState?.totalQuestsCompleted || 0} NV</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleOpen}
                aria-label="Đóng sổ tay"
                className="w-8 h-8 rounded-full bg-white border-2 border-[#593A47] text-[#593A47] font-black text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* 2 TAB: HÀNH TRÌNH NGÀY & TRÊN BẢN ĐỒ */}
            <div className="px-3 pt-2 bg-[#FFF6FA] border-b-2 border-[#593A47] flex gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('daily')}
                className={`flex-1 py-1.5 px-2 rounded-t-xl text-[11px] sm:text-xs font-black border-t-2 border-x-2 -mb-[2px] ${
                  activeTab === 'daily'
                    ? 'bg-[#FFFDF9] border-[#593A47] text-[#593A47]'
                    : 'border-transparent text-[#8C6575]'
                }`}
              >
                🎯 Nhiệm Vụ Ngày ({dailyDoneCount}/{dailyTotal})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('inworld')}
                className={`flex-1 py-1.5 px-2 rounded-t-xl text-[11px] sm:text-xs font-black border-t-2 border-x-2 -mb-[2px] flex items-center justify-center gap-1 ${
                  activeTab === 'inworld'
                    ? 'bg-[#FFFDF9] border-[#593A47] text-[#593A47]'
                    : 'border-transparent text-[#8C6575]'
                }`}
              >
                <span>🗺️ Trên Bản Đồ</span>
                {activeInWorld.length > 0 && (
                  <span className="px-1.5 rounded-full bg-[#FFE066] border border-[#593A47] text-[9px] text-[#593A47]">
                    {activeInWorld.length}
                  </span>
                )}
              </button>
            </div>

            {/* NỘI DUNG TAB */}
            <div className="p-3.5 overflow-y-auto space-y-2.5 text-left">
              {activeTab === 'daily' ? (
                <>
                  {/* HỘP QUÀ HOÀN THÀNH 5/5 */}
                  {canClaimBox && (
                    <button
                      type="button"
                      onClick={onClaimDailyBox}
                      className="kawaii-btn w-full py-2.5 px-3 bg-gradient-to-r from-[#FFE066] to-[#6EE7B7] text-[#593A47] font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 animate-pulse"
                    >
                      <span>🎁</span>
                      <span>Nhận Hộp Quà 5/5 (+50 Sao &amp; +1 Streak)</span>
                    </button>
                  )}
                  {dailyQuestsState?.boxClaimed && (
                    <div className="p-2.5 rounded-2xl bg-[#DFF8EB] border-2 border-[#593A47] text-xs font-black text-[#16805D] text-center">
                      🎉 Bạn đã hoàn thành trọn vẹn 5/5 nhiệm vụ hôm nay!
                    </div>
                  )}

                  {/* PANEL TRẢ LỜI TRẮC NGHIỆM (NẾU ĐANG MỞ 1 CÂU HỎI TỪ ADMIN) */}
                  {activeQuizQuest && activeQuizQuest.quiz && (
                    <div className="p-3 rounded-2xl bg-[#FAF5FF] border-[2.5px] border-[#593A47] shadow-[0_4px_0_#593A47] space-y-2.5 pop-in">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-black text-[#593A47]">
                          ❓ {activeQuizQuest.quiz.question}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveQuizQuest(null);
                            setQuizFeedback('');
                          }}
                          className="text-xs font-black text-[#8C6575] hover:text-[#593A47] shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {(activeQuizQuest.quiz.options || []).map((opt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (idx === Number(activeQuizQuest.quiz.correctIndex)) {
                                onCompleteDailyQuiz?.(
                                  activeQuizQuest.id,
                                  activeQuizQuest.quiz.explanation
                                );
                                setActiveQuizQuest(null);
                                setQuizFeedback('');
                              } else {
                                setQuizFeedback('❌ Chưa đúng rồi, bạn thử chọn đáp án khác nhé!');
                              }
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-white hover:bg-[#FFF4BD] border-2 border-[#593A47] text-left text-xs font-extrabold text-[#593A47] transition"
                          >
                            <span className="inline-block w-5 font-black text-[#D9386A]">
                              {String.fromCharCode(65 + idx)}.
                            </span>
                            {opt}
                          </button>
                        ))}
                      </div>
                      {quizFeedback && (
                        <div className="text-[11px] font-black text-[#E11D48]">{quizFeedback}</div>
                      )}
                    </div>
                  )}

                  {dailyList.map((q) => {
                    const isQuiz = q.questType === 'quiz' && q.quiz;
                    const isCollect = q.questType === 'collect' && Array.isArray(q.targets) && q.targets.length > 0;
                    const nextCollectTarget = isCollect ? q.targets.find((t) => !t.collected) : null;
                    const collectedCount = isCollect ? q.targets.filter((t) => t.collected).length : 0;
                    const targetMapId = nextCollectTarget?.mapId || q.mapId;

                    return (
                      <div
                        key={q.id}
                        className={`p-2.5 rounded-2xl border-2 space-y-1.5 ${
                          q.done
                            ? 'bg-[#F0FDF4] border-green-400/70 opacity-85'
                            : 'bg-white border-[#593A47] shadow-[0_2px_0_#593A47]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-start gap-2 min-w-0">
                            <span className="text-lg shrink-0">{q.done ? '✅' : q.icon}</span>
                            <div className="min-w-0">
                              <div
                                className={`text-xs font-black leading-snug ${
                                  q.done ? 'line-through text-green-700' : 'text-[#593A47]'
                                }`}
                              >
                                {q.title}
                              </div>
                              <div className="text-[10px] font-bold text-[#8C6575]">
                                {isQuiz
                                  ? `❓ Trắc nghiệm • +${q.rewardStars} ⭐`
                                  : isCollect
                                  ? `🔍 Đã tìm ${collectedCount}/${q.targets.length} • +${q.rewardStars} ⭐`
                                  : `📍 ${q.mapName} • +${q.rewardStars} ⭐`}
                              </div>
                            </div>
                          </div>

                          {!q.done && isQuiz ? (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveQuizQuest(q);
                                setQuizFeedback('');
                              }}
                              className="shrink-0 px-2.5 py-1 rounded-xl bg-[#F3E8FF] hover:bg-[#E9D5FF] border-2 border-[#593A47] text-[10px] font-black text-[#593A47]"
                            >
                              Trả lời ❓
                            </button>
                          ) : !q.done && targetMapId && currentMapId !== targetMapId ? (
                            <button
                              type="button"
                              onClick={() => {
                                onJumpToMap(targetMapId);
                                onToggleOpen();
                              }}
                              className="shrink-0 px-2 py-1 rounded-xl bg-[#FFE066] border-2 border-[#593A47] text-[10px] font-black text-[#593A47]"
                            >
                              Đi tới ➡️
                            </button>
                          ) : !q.done && targetMapId && currentMapId === targetMapId ? (
                            <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-[#E0F2FE] text-[9px] font-black text-[#0369A1]">
                              Ở map này
                            </span>
                          ) : null}
                        </div>

                        {!q.done && isCollect && nextCollectTarget && (
                          <div className="pl-7 text-[10px] font-bold text-[#7D5867] leading-snug">
                            💡 Gợi ý: <strong>{nextCollectTarget.mapName}</strong> — {nextCollectTarget.hint || nextCollectTarget.label}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ) : (
                <>
                  {activeInWorld.length > 0 ? (
                    activeInWorld.map((q) => {
                      const doneCount = q.targets.filter((t) => t.collected).length;
                      const totalCount = q.targets.length;
                      return (
                        <div
                          key={q.id}
                          className="p-3 rounded-2xl bg-white border-2 border-[#593A47] shadow-[0_3px_0_#593A47] space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-lg">{q.icon}</span>
                              <div>
                                <div className="text-xs font-black text-[#593A47]">{q.title}</div>
                                <div className="text-[10px] font-bold text-[#8C6575]">
                                  Từ {q.npcName} • +{q.rewardHearts} 💖
                                </div>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-[#FFF3B0] border border-[#593A47] text-[10px] font-black text-[#593A47] shrink-0">
                              {q.status === 'ready_to_claim' ? 'Trả NV!' : `${doneCount}/${totalCount}`}
                            </span>
                          </div>

                          {q.status === 'ready_to_claim' ? (
                            <div className="p-2.5 rounded-xl bg-[#DFF8EB] border border-[#593A47]/40 text-[11px] font-extrabold text-[#16805D] flex items-center justify-between gap-2">
                              <span>🎁 {q.returnHint}</span>
                              {currentMapId !== q.returnMapId && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onJumpToMap(q.returnMapId);
                                    onToggleOpen();
                                  }}
                                  className="shrink-0 px-2 py-1 rounded-lg bg-[#FFE066] border border-[#593A47] text-[10px] font-black text-[#593A47]"
                                >
                                  Tới map ➡️
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {q.targets.map((t) => (
                                <div
                                  key={t.id}
                                  className={`p-2 rounded-xl border text-[11px] flex items-center justify-between gap-2 ${
                                    t.collected
                                      ? 'bg-[#F0FDF4] border-green-300 text-green-700 line-through opacity-75'
                                      : 'bg-[#FFFDF5] border-[#593A47]/30 text-[#593A47]'
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <div className="font-extrabold">
                                      {t.collected ? '✅' : t.icon} {t.label}
                                    </div>
                                    {!t.collected && (
                                      <div className="text-[10px] font-bold text-[#7D5867] leading-snug">
                                        📍 <strong>{t.mapName}</strong>: {t.hint}
                                      </div>
                                    )}
                                  </div>
                                  {!t.collected && currentMapId !== t.mapId && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onJumpToMap(t.mapId);
                                        onToggleOpen();
                                      }}
                                      className="shrink-0 px-2 py-1 rounded-lg bg-[#FFE066] border border-[#593A47] text-[10px] font-black text-[#593A47]"
                                    >
                                      Đi tới ➡️
                                    </button>
                                  )}
                                  {!t.collected && currentMapId === t.mapId && (
                                    <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-[#E0F2FE] text-[9px] font-black text-[#0369A1]">
                                      Đang ở đây
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 rounded-2xl bg-[#FFF9E6] border-2 border-dashed border-[#593A47]/40 text-xs font-bold text-[#7D5867] text-center space-y-2">
                      <p>Chưa nhận nhiệm vụ tìm đồ/bong bóng nào trên bản đồ. Ghé Hẻm Xoáy Tinh Nghịch để nhận nhé!</p>
                      {currentMapId !== 'map_mischief_alley' && (
                        <button
                          type="button"
                          onClick={() => {
                            onJumpToMap('map_mischief_alley');
                            onToggleOpen();
                          }}
                          className="kawaii-btn px-3 py-1 bg-[#FFE066] text-[#593A47] text-[11px] font-black"
                        >
                          🌀 Tới Hẻm Xoáy ngay
                        </button>
                      )}
                    </div>
                  )}

                  {completedInWorld.length > 0 && (
                    <div className="pt-1 space-y-1.5">
                      <div className="text-[11px] font-black text-[#16805D] uppercase tracking-wide">
                        ✅ Đã hoàn thành hôm nay
                      </div>
                      {completedInWorld.map((q) => (
                        <div
                          key={q.id}
                          className="p-2.5 rounded-xl bg-[#DFF8EB]/70 border border-[#593A47]/30 flex items-center justify-between text-xs font-extrabold text-[#593A47]"
                        >
                          <span>
                            {q.icon} {q.title}
                          </span>
                          <span className="text-[10px] text-[#16805D]">+{q.rewardHearts} 💖</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
