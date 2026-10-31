import React from 'react';
import { MOOD_CONFIG } from '../config/constants';

/**
 * Modal hiển thị ở chính giữa màn hình khi người dùng bấm vào nút "Thẻ Sao Đã Mở" kế bên Nhà Của Bạn.
 */
export default function HistorySidebar({
  isOpen,
  historyList,
  onClose,
  onSelectHistoryItem
}) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#593A47]/55 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Thẻ Sao May Mắn Đã Mở Hôm Nay"
        className="kawaii-card modal-spring-enter w-full max-w-lg max-h-[85dvh] bg-[#FFFDF9] flex flex-col overflow-hidden relative"
      >
        {/* Header Modal */}
        <div className="p-4 sm:p-5 bg-[#FFF3B0] border-b-[3px] border-[#593A47] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-white border-[2.5px] border-[#593A47] flex items-center justify-center text-xl shadow-[0_3px_0_#593A47]">
              🗂️
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#593A47] leading-tight">
                Thẻ Sao May Mắn Đã Mở Hôm Nay
              </h2>
              <span className="text-xs sm:text-sm font-bold text-[#7D5867]">
                Đã mở: {historyList.length} ngôi sao hôm nay
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="kawaii-btn w-9 h-9 bg-white hover:bg-[#FFE4EE] text-[#593A47] font-extrabold text-base flex items-center justify-center shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Danh sách thẻ sao */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {historyList.length === 0 ? (
            <div className="py-10 px-4 text-center bg-[#FFF6FA] border-[2.5px] border-dashed border-[#E5B8C8] rounded-2xl">
              <div className="text-4xl mb-2">🌠</div>
              <p className="font-extrabold text-sm sm:text-base text-[#593A47]">
                Hôm nay bạn chưa mở ngôi sao nào cả!
              </p>
              <p className="text-xs sm:text-sm font-semibold text-[#8C6575] mt-1">
                Hãy bấm vào nút Mở Hộp Sao ở cuối con đường để nhận thông điệp đầu tiên nhé ✨
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {historyList.map((item, idx) => {
                const cfg = MOOD_CONFIG[item.mood] || MOOD_CONFIG.happy;
                return (
                  <button
                    key={item.id + '-' + idx}
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectHistoryItem(item);
                    }}
                    className="kawaii-card-sm p-4 text-left flex flex-col justify-between gap-2.5 bg-gradient-to-br from-white to-[#FFF6FA] cursor-pointer focus:outline-none w-full"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          style={{ backgroundColor: cfg.badgeBg }}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border-2 border-[#593A47] text-xs sm:text-sm font-extrabold"
                        >
                          <span>{cfg.emoji}</span>
                          <span>{cfg.shortLabel}</span>
                        </span>
                        <span className="text-[11px] font-extrabold text-[#8C6575]">
                          🕒 {item.timeStr}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base font-extrabold text-[#593A47] line-clamp-3 leading-relaxed">
                        &ldquo;{item.text}&rdquo;
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t-2 border-dashed border-[#F0DCE5] text-[11px] font-extrabold text-[#D9386A]">
                      <span>{item.fromSheet ? `💌 Từ: ${item.sender}` : '🌟 Sao Bầu Trời'}</span>
                      <span className="underline">Mở lại thư ➔</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
