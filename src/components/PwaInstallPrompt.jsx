import React, { useState, useEffect } from 'react';

const DISMISS_STORAGE_KEY = 'TTSB_PWA_PROMPT_DISMISSED_AT';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày

/**
 * Banner gọn gợi ý cài đặt Thị Trấn Sao Bông lên Màn hình chính (PWA):
 * - Tự ẩn nếu đang mở ở chế độ standalone (đã cài đặt).
 * - Tự ẩn trong 7 ngày nếu người dùng bấm đóng.
 * - Hỗ trợ cả nút cài đặt 1 chạm (Android/Chrome) và hướng dẫn ngắn cho iOS Safari.
 */
export default function PwaInstallPrompt({ isVisible = true }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Đã chạy ở chế độ app standalone -> không hiện
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)')?.matches ||
      window.navigator?.standalone === true;
    if (isStandalone) return;

    // 2. Kiểm tra người dùng mới bấm đóng gần đây
    try {
      const lastDismissed = Number(localStorage.getItem(DISMISS_STORAGE_KEY) || 0);
      if (lastDismissed && Date.now() - lastDismissed < DISMISS_COOLDOWN_MS) {
        return;
      }
    } catch {}

    setDismissed(false);

    // 3. Android / Chrome / Edge: bắt sự kiện beforeinstallprompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 4. iOS Safari: phát hiện để hiện hướng dẫn thêm vào màn hình chính
    const ua = window.navigator.userAgent || '';
    const isIos = /iPhone|iPad|iPod/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
    if (isIos && isSafari) {
      setShowIosGuide(true);
    }

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setShowIosGuide(false);
      setDismissed(true);
    };
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    } catch {}
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        setDismissed(true);
      }
    } catch {}
    setDeferredPrompt(null);
  };

  if (!isVisible || dismissed || (!deferredPrompt && !showIosGuide)) {
    return null;
  }

  return (
    <div
      style={{ bottom: 'calc(max(0.5rem, env(safe-area-inset-bottom)) + 70px)' }}
      className="fixed left-1/2 -translate-x-1/2 z-[905] w-[calc(100%-1.5rem)] max-w-sm md:left-auto md:right-4 md:translate-x-0 md:bottom-5 pointer-events-auto pop-in select-none"
    >
      <div className="p-3 rounded-2xl bg-[#FFFDF9]/95 backdrop-blur-md border-[2.5px] border-[#593A47] shadow-[0_5px_0_#593A47] flex items-center gap-2.5">
        <img
          src="/icons/pwa-192x192.png"
          alt="Sao Bông"
          className="w-10 h-10 rounded-xl border-2 border-[#593A47] shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-black text-[#593A47] leading-tight">
            Cài Thị Trấn Sao Bông
          </div>
          {deferredPrompt ? (
            <p className="text-[11px] font-bold text-[#7D5867] leading-snug mt-0.5">
              Mở toàn màn hình mượt như app thật, không thanh địa chỉ.
            </p>
          ) : (
            <p className="text-[11px] font-bold text-[#7D5867] leading-snug mt-0.5">
              Chạm nút <strong>Chia sẻ</strong> rồi chọn <strong>Thêm vào MH chính</strong> để mở toàn màn hình.
            </p>
          )}
        </div>

        {deferredPrompt && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-[#FFE066] hover:bg-[#FFD166] border-2 border-[#593A47] shadow-[0_2px_0_#593A47] text-xs font-black text-[#593A47] active:translate-y-0.5"
          >
            Cài đặt
          </button>
        )}

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Đóng gợi ý cài đặt"
          className="shrink-0 w-7 h-7 rounded-full bg-[#FFE4EE] border-2 border-[#593A47] text-[#593A47] text-xs font-black flex items-center justify-center"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
