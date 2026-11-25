import React from 'react';

/**
 * MODAL CHÚC MỪNG & CHIA SẺ MẠNG XÃ HỘI (CELEBRATION & SOCIAL SHARE)
 * Kích hoạt mỗi khi:
 *  - type === 'badge' : Nhận huy hiệu mới (kèm màu bậc Đồng/Bạc/Vàng/Kim Cương/Pha Lê)
 *  - type === 'level_up' : Lên cấp độ mới & mở khóa cư dân mới
 *  - type === 'comic_done' : Đọc xong 1 tập Truyện Tranh Mỗi Ngày
 */
export default function CelebrationShareModal({
  event, // { type, icon, badgeBg, badgeBorder, subtitle, title, description, shareText, unlockedNames? }
  onShowToast,
  onClose,
}) {
  if (!event) return null;

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareText =
    event.shareText ||
    `✨ Mình vừa đạt thành tích "${event.title}" tại Thị Trấn Sao Bông! Ghé chơi cùng mình nhé 🌟`;

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Thị Trấn Sao Bông ✨',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // User hủy bảng share
      }
    }
    handleCopyShare();
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyShare = () => {
    const full = `${shareText}\n${shareUrl}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(full)
        .then(() => onShowToast?.('📋 Đã sao chép nội dung chia sẻ! Dán lên Zalo/Facebook ngay nhé!'))
        .catch(() => onShowToast?.('⚠️ Không thể sao chép tự động.'));
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9990] bg-[#593A47]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="kawaii-card w-full max-w-md p-6 bg-gradient-to-b from-[#FFFDF9] to-[#FFF4F8] text-center relative pop-in my-auto space-y-4">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng chúc mừng"
          className="kawaii-btn w-9 h-9 bg-[#FFE4EE] text-[#593A47] font-black text-sm flex items-center justify-center absolute -top-3.5 -right-3"
        >
          ✕
        </button>

        {/* Huy chương / Icon chúc mừng */}
        <div className="flex flex-col items-center gap-2">
          <div
            style={{
              backgroundColor: event.badgeBg || '#FFF3B0',
              borderColor: event.badgeBorder || '#593A47',
            }}
            className="w-20 h-20 rounded-3xl border-[3.5px] shadow-[0_6px_0_#593A47] flex items-center justify-center text-4xl animate-bounce"
          >
            {event.icon || '🎉'}
          </div>
          <span className="px-3 py-0.5 rounded-full bg-[#FFE066] border-2 border-[#593A47] text-[11px] font-black text-[#593A47] uppercase tracking-wider">
            {event.subtitle || '🎉 Chúc Mừng Thành Tích Mới!'}
          </span>
        </div>

        {/* Tiêu đề & Mô tả */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-black text-[#593A47] leading-snug">{event.title}</h3>
          <p className="text-xs sm:text-sm font-bold text-[#7D5867] leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Danh sách cư dân mới mở khóa (nếu là Level Up) */}
        {Array.isArray(event.unlockedNames) && event.unlockedNames.length > 0 && (
          <div className="p-3 rounded-2xl bg-[#DFF8EB] border-2 border-[#593A47] text-xs font-extrabold text-[#16805D] space-y-1">
            <div>🔓 Cư dân &amp; Ngôi nhà mới mở khóa:</div>
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {event.unlockedNames.map((name, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full bg-white border border-[#593A47] text-[#593A47]"
                >
                  ✨ {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Khung chia sẻ Mạng Xã Hội */}
        <div className="pt-2 border-t-2 border-dashed border-[#F0DCE5] space-y-2.5">
          <div className="text-[11px] font-black text-[#8C6575] uppercase tracking-wide">
            📢 Chia sẻ niềm vui lên mạng xã hội
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleNativeShare}
              className="kawaii-btn py-2 px-3 bg-[#FFE066] hover:bg-[#FFD166] text-[#593A47] text-xs font-black flex items-center justify-center gap-1.5"
            >
              <span>📲</span>
              <span>Chia sẻ ngay</span>
            </button>
            <button
              type="button"
              onClick={handleShareFacebook}
              className="kawaii-btn py-2 px-3 bg-[#DBEAFE] hover:bg-[#BFDBFE] text-[#1E3A8A] text-xs font-black flex items-center justify-center gap-1.5"
            >
              <span>🔵</span>
              <span>Facebook</span>
            </button>
            <button
              type="button"
              onClick={handleShareX}
              className="kawaii-btn py-2 px-3 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-xs font-black flex items-center justify-center gap-1.5"
            >
              <span>✖️</span>
              <span>X / Twitter</span>
            </button>
            <button
              type="button"
              onClick={handleCopyShare}
              className="kawaii-btn py-2 px-3 bg-[#FFE4EE] hover:bg-[#FFC9DC] text-[#593A47] text-xs font-black flex items-center justify-center gap-1.5"
            >
              <span>📋</span>
              <span>Sao chép</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="kawaii-btn w-full py-2.5 bg-[#FF85A9] hover:bg-[#FF6E99] text-[#593A47] font-black text-sm"
        >
          Tiếp tục khám phá thị trấn ✨
        </button>
      </div>
    </div>
  );
}
