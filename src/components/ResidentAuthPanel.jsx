import React, { useState } from 'react';
import {
  evaluatePasswordStrength,
  loginUserAccount,
  registerUserAccount,
} from '../utils/userAuthService';

/**
 * FORM ĐĂNG NHẬP / ĐĂNG KÝ CƯ DÂN KAWAII
 * - Chế độ Đăng nhập: Username + Mật khẩu + nút "🏡 Vào Thị Trấn" + nút "✨ Đăng ký cư dân"
 * - Chế độ Đăng ký: Username + Mật khẩu mạnh (có thanh đo độ mạnh) + Xác nhận mật khẩu
 * - Kèm bảng quyền lợi thành viên để tạo động lực đăng ký.
 */
export default function ResidentAuthPanel({
  initialMode = 'login', // 'login' | 'register'
  showBenefits = true,
  guestActionLabel = '',
  onGuestAction = null,
  onAuthSuccess,
}) {
  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pwdStrength = evaluatePasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setErrorMsg('⚠️ Mật khẩu xác nhận chưa khớp với mật khẩu vừa nhập.');
        return;
      }
      setIsSubmitting(true);
      const res = await registerUserAccount({ username, password });
      setIsSubmitting(false);
      if (!res.ok) {
        setErrorMsg(res.error);
        return;
      }
      onAuthSuccess?.(res.user, 'register');
      return;
    }

    setIsSubmitting(true);
    const res = await loginUserAccount({ username, password });
    setIsSubmitting(false);
    if (!res.ok) {
      setErrorMsg(res.error);
      return;
    }
    onAuthSuccess?.(res.user, 'login');
  };

  return (
    <div className="space-y-4 text-left">
      <form
        onSubmit={handleSubmit}
        className="p-4 sm:p-5 rounded-2xl bg-[#FFF6FA] border-[2.5px] border-[#593A47] shadow-[0_4px_0_#593A47] space-y-3.5"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="font-extrabold text-sm sm:text-base text-[#593A47]">
            {mode === 'login'
              ? '✨ Đăng nhập Cư Dân Thị Trấn Sao Bông:'
              : '🌟 Đăng Ký Cư Dân Mới (Tạo Ngôi Nhà Riêng):'}
          </div>
          {mode === 'register' && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className="text-xs font-extrabold text-[#D9386A] underline shrink-0 cursor-pointer"
            >
              ⬅️ Quay lại đăng nhập
            </button>
          )}
        </div>

        {/* Username */}
        <div className="space-y-1">
          <label className="block text-xs font-extrabold text-[#7D5867]">
            Tên đăng nhập (Username)
          </label>
          <input
            type="text"
            maxLength={32}
            autoComplete="username"
            placeholder="Nhập tên cư dân của bạn (tối thiểu 3 ký tự)..."
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setErrorMsg('');
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#593A47] text-sm font-bold text-[#593A47] outline-none focus:ring-2 focus:ring-[#FF85A9]"
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="block text-xs font-extrabold text-[#7D5867]">
            Mật khẩu {mode === 'register' && <span className="text-[#D9386A]">(tối thiểu 8 ký tự, chữ hoa, thường &amp; số)</span>}
          </label>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              maxLength={64}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              placeholder={mode === 'register' ? 'Tạo mật khẩu mạnh...' : 'Nhập mật khẩu của bạn...'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg('');
              }}
              className="w-full px-3.5 py-2.5 pr-11 rounded-xl bg-white border-2 border-[#593A47] text-sm font-bold text-[#593A47] outline-none focus:ring-2 focus:ring-[#FF85A9]"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base opacity-70 hover:opacity-100 cursor-pointer"
            >
              {showPwd ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Thanh đo độ mạnh mật khẩu khi đăng ký */}
          {mode === 'register' && password.length > 0 && (
            <div className="pt-1 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-extrabold">
                <span className="text-[#7D5867]">Độ mạnh mật khẩu:</span>
                <span style={{ color: pwdStrength.color }}>{pwdStrength.label}</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    style={{
                      backgroundColor: pwdStrength.score >= step ? pwdStrength.color : '#E2E8F0',
                    }}
                    className="h-1.5 rounded-full transition-colors"
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                <span className={pwdStrength.hasMinLen ? 'text-[#16805D]' : 'text-[#8C6575]'}>
                  {pwdStrength.hasMinLen ? '✓' : '○'} ≥ 8 ký tự
                </span>
                <span className={pwdStrength.hasUpper ? 'text-[#16805D]' : 'text-[#8C6575]'}>
                  {pwdStrength.hasUpper ? '✓' : '○'} Chữ hoa
                </span>
                <span className={pwdStrength.hasLower ? 'text-[#16805D]' : 'text-[#8C6575]'}>
                  {pwdStrength.hasLower ? '✓' : '○'} Chữ thường
                </span>
                <span className={pwdStrength.hasDigit ? 'text-[#16805D]' : 'text-[#8C6575]'}>
                  {pwdStrength.hasDigit ? '✓' : '○'} Chữ số
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password (Register only) */}
        {mode === 'register' && (
          <div className="space-y-1">
            <label className="block text-xs font-extrabold text-[#7D5867]">
              Xác nhận mật khẩu
            </label>
            <input
              type={showPwd ? 'text' : 'password'}
              maxLength={64}
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu giống ở trên..."
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrorMsg('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#593A47] text-sm font-bold text-[#593A47] outline-none focus:ring-2 focus:ring-[#FF85A9]"
            />
          </div>
        )}

        {errorMsg && (
          <div className="px-3 py-2 rounded-xl bg-[#FFE4E6] border-2 border-[#E11D48] text-xs font-extrabold text-[#9F1239]">
            {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-1 flex flex-wrap items-center justify-between gap-2.5">
          {mode === 'login' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                }}
                className="kawaii-btn bg-[#FFF3B0] hover:bg-[#FFE066] text-[#593A47] font-extrabold text-xs sm:text-sm px-4 py-2.5 flex items-center gap-1.5 cursor-pointer"
              >
                <span>✨</span>
                <span>Đăng ký cư dân</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="kawaii-btn bg-[#FF85A9] hover:bg-[#FF6E99] text-[#593A47] font-extrabold text-sm sm:text-base px-5 py-2.5 flex items-center gap-1.5 flex-1 sm:flex-initial justify-center cursor-pointer disabled:opacity-60"
              >
                <span>🏡</span>
                <span>{isSubmitting ? 'Đang vào...' : 'Vào Thị Trấn'}</span>
              </button>
            </>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="kawaii-btn w-full bg-[#FF85A9] hover:bg-[#FF6E99] text-[#593A47] font-extrabold text-sm sm:text-base px-5 py-2.5 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <span>🏡</span>
              <span>{isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký cư dân & Vào Thị Trấn'}</span>
            </button>
          )}
        </div>

        <p className="text-[11px] font-bold text-[#8C6575] leading-snug">
          * Sau khi đăng nhập, bảng tên trên mái nhà ở giữa phố sẽ đổi thành tên của bạn và tự động lưu mọi thành tích!
        </p>

        {guestActionLabel && onGuestAction && (
          <div className="pt-2 border-t border-dashed border-[#E5B8C8] text-center">
            <button
              type="button"
              onClick={onGuestAction}
              className="text-xs font-extrabold text-[#7D5867] underline hover:text-[#593A47] cursor-pointer"
            >
              {guestActionLabel}
            </button>
          </div>
        )}
      </form>

      {/* Quyền lợi thành viên khi chưa đăng nhập */}
      {showBenefits && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FFFDF2] via-[#FFF4F8] to-[#F0F9FF] border-[2.5px] border-[#593A47] shadow-[0_3px_0_#593A47] space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎁</span>
            <h4 className="font-black text-xs sm:text-sm text-[#593A47]">
              Đặc quyền khi trở thành Cư Dân Chính Thức của Thị Trấn Sao Bông:
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-[#593A47]">
            <div className="p-2.5 rounded-xl bg-white/90 border border-[#593A47]/25 flex items-start gap-2">
              <span className="text-base shrink-0">🏺</span>
              <span>Lưu giữ trọn đời mọi bức thư Ngôi Sao May Mắn &amp; Lọ Sao Ký Ức của riêng bạn.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/90 border border-[#593A47]/25 flex items-start gap-2">
              <span className="text-base shrink-0">🏅</span>
              <span>Sưu tập 30 Huy hiệu 5 bậc &amp; mở khóa 15 Trang phục Skin độc quyền cho Bé Sao Bông.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/90 border border-[#593A47]/25 flex items-start gap-2">
              <span className="text-base shrink-0">💌</span>
              <span>Gửi lời chúc lên bầu trời sao, nhận trái tim từ hàng xóm &amp; gắn tên lên mái nhà riêng.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/90 border border-[#593A47]/25 flex items-start gap-2">
              <span className="text-base shrink-0">🔐</span>
              <span>Bảo vệ hồ sơ bằng mật khẩu mạnh, bổ sung Email/SĐT để đồng bộ &amp; lấy lại tài khoản dễ dàng.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
