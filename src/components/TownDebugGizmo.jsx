import React, { useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * COMPONENT DEBUG CẢNH QUAN THỊ TRẤN (TOWN DEBUG GIZMO)
 * 
 * Nâng cấp:
 * 1. Tô màu toàn bộ Vùng Đồi Cỏ (Walkable Area) bằng màu xanh ngọc mờ (rgba 16, 185, 129, 0.28).
 * 2. Tô màu Vùng Cấm Phía Trên (Bầu trời / Rừng cây) bằng màu hồng đỏ mờ (rgba 239, 68, 68, 0.16).
 * 3. Hiển thị từng điểm neo neo màu vàng kèm NHÃN TỌA ĐỘ (X%, Y%) rõ ràng để người dùng dễ quan sát và mô tả.
 * 4. Hiển thị các hộp va chạm và vùng kích hoạt NPC thu nhỏ 70%.
 */
export default function TownDebugGizmo({
  playerPos,
  obstacles = [],
  landmarks = [],
  skyHorizonPoints = [],
  isOverviewFit = false,
  onToggleOverviewFit
}) {
  const [showGizmo, setShowGizmo] = useState(false);
  const [showObstacles, setShowObstacles] = useState(true);
  const [showTriggers, setShowTriggers] = useState(true);
  const [showHorizon, setShowHorizon] = useState(true);
  const [showGrassOverlay, setShowGrassOverlay] = useState(true);

  // Sắp xếp các điểm chân trời từ trái sang phải
  const sortedPts = [...skyHorizonPoints].sort((a, b) => a.x - b.x);

  // Polygon Vùng Đồi Cỏ Được Phép Đi (từ horizon points xuống 94%)
  const grassPolygon =
    sortedPts.length > 0
      ? [
          `0%,94%`,
          `0%,${sortedPts[0].y}%`,
          ...sortedPts.map((p) => `${p.x}%,${p.y}%`),
          `100%,${sortedPts[sortedPts.length - 1].y}%`,
          `100%,94%`,
          `0%,94%`
        ].join(' ')
      : '';

  // Polygon Vùng Cấm Bầu Trời / Rừng Cây (từ 0% xuống horizon points)
  const skyPolygon =
    sortedPts.length > 0
      ? [
          `0%,0%`,
          `100%,0%`,
          `100%,${sortedPts[sortedPts.length - 1].y}%`,
          ...[...sortedPts].reverse().map((p) => `${p.x}%,${p.y}%`),
          `0%,${sortedPts[0].y}%`,
          `0%,0%`
        ].join(' ')
      : '';

  // Panel điều khiển gắn cố định vào document.body bằng createPortal
  const controlPanel = (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col items-end gap-1.5 pointer-events-auto select-none">
      <button
        type="button"
        onClick={() => setShowGizmo((prev) => !prev)}
        title="Bật/Tắt công cụ kiểm tra ranh giới vật lý & vùng kích hoạt (Dành cho nhà phát triển)"
        className={`kawaii-btn text-xs font-black px-3.5 py-2 rounded-2xl border-2 border-[#593A47] flex items-center gap-1.5 shadow-[0_4px_0_#593A47] transition-all cursor-pointer ${
          showGizmo
            ? 'bg-[#10B981] text-white hover:bg-[#059669]'
            : 'bg-white/95 text-[#593A47] hover:bg-[#FFE066]'
        }`}
      >
        <span>🛠️</span>
        <span>{showGizmo ? 'Ẩn Tô Màu Ranh Giới Đồi Cỏ' : 'Bật Tô Màu Ranh Giới Đồi Cỏ'}</span>
      </button>

      {showGizmo && (
        <div className="p-4 rounded-3xl bg-[#593A47]/95 backdrop-blur-md border-[2.5px] border-[#FFE066] text-white text-xs flex flex-col gap-3 shadow-2xl min-w-[270px] pop-in">
          {/* Tọa độ hiện tại của Avatar */}
          <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/20 text-xs font-bold flex items-center justify-between">
            <span>🚶 Tọa độ Bé:</span>
            <span>
              <strong className="text-[#FFE066]">X: {playerPos?.x?.toFixed(1)}%</strong> |{' '}
              <strong className="text-[#6EE7B7]">Y: {playerPos?.y?.toFixed(1)}%</strong>
            </span>
          </div>

          {/* NÚT THU PHÓNG XEM TOÀN CẢNH BẢN ĐỒ (FIT SCREEN) */}
          {typeof onToggleOverviewFit === 'function' && (
            <button
              type="button"
              onClick={onToggleOverviewFit}
              title="Thu nhỏ toàn bộ bản đồ để hiển thị đầy đủ 100% trên màn hình"
              className={`w-full py-2 px-3 rounded-xl border-2 text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-[0_2px_0_#593A47] active:translate-y-0.5 cursor-pointer ${
                isOverviewFit
                  ? 'bg-[#FFE066] text-[#593A47] border-[#593A47]'
                  : 'bg-white/20 hover:bg-white/30 text-white border-white/40'
              }`}
            >
              <span>🔭</span>
              <span>{isOverviewFit ? 'Góc Nhìn Bình Thường' : 'Xem Toàn Cảnh (Fit Screen)'}</span>
            </button>
          )}

          {/* Các checkbox bật/tắt từng lớp */}
          <div className="pt-2 border-t border-white/20 flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer font-black text-xs text-[#6EE7B7]">
              <input
                type="checkbox"
                checked={showGrassOverlay}
                onChange={(e) => setShowGrassOverlay(e.target.checked)}
                className="w-4 h-4 rounded accent-[#10B981]"
              />
              <span>🟢 Tô Màu Vùng Đồi Cỏ (Đi Được)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-black text-xs text-[#FCA5A5]">
              <input
                type="checkbox"
                checked={showHorizon}
                onChange={(e) => setShowHorizon(e.target.checked)}
                className="w-4 h-4 rounded accent-[#EF4444]"
              />
              <span>🔴 Tô Màu Vùng Cấm (Bầu Trời/Cây)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-white/90">
              <input
                type="checkbox"
                checked={showObstacles}
                onChange={(e) => setShowObstacles(e.target.checked)}
                className="w-4 h-4 rounded accent-[#FFE066]"
              />
              <span>🧱 Khung Va Chạm Nhà (Obstacles)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-white/90">
              <input
                type="checkbox"
                checked={showTriggers}
                onChange={(e) => setShowTriggers(e.target.checked)}
                className="w-4 h-4 rounded accent-[#FF85A9]"
              />
              <span>🎯 Vùng Kích Hoạt 70% (Triggers)</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 1. GẮN PANEL ĐIỀU KHIỂN RA DOCUMENT.BODY */}
      {typeof document !== 'undefined' && createPortal(controlPanel, document.body)}

      {/* 2. LỚP VẼ TÔ MÀU TRỰC QUAN GIZMO NẰM TRONG CONTAINER MAP */}
      {showGizmo && (
        <div className="absolute inset-0 pointer-events-none z-[920] overflow-visible select-none">
          {/* LỚP SVG TÔ MÀU ĐỒI CỎ & VÙNG CẤM */}
          {sortedPts.length > 0 && (
            <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
              <defs>
                {/* Họa tiết lưới tọa độ nhẹ cho vùng cỏ */}
                <pattern id="walkableGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="1" />
                </pattern>
              </defs>

              {/* 1. TÔ MÀU VÙNG CẤM BẦU TRỜI / RỪNG CÂY PHÍA TRÊN */}
              {showHorizon && skyPolygon && (
                <polygon points={skyPolygon} fill="rgba(239, 68, 68, 0.18)" />
              )}

              {/* 2. TÔ MÀU VÙNG ĐỒI CỎ ĐƯỢC PHÉP ĐI LẠI */}
              {showGrassOverlay && grassPolygon && (
                <>
                  <polygon points={grassPolygon} fill="rgba(16, 185, 129, 0.25)" />
                  <polygon points={grassPolygon} fill="url(#walkableGrid)" />
                </>
              )}

              {/* 3. ĐƯỜNG RANH GIỚI BẦU TRỜI & ĐỒI CỎ NÉT ĐỨT NEON */}
              <polyline
                points={sortedPts.map((p) => `${p.x}%,${p.y}%`).join(' ')}
                fill="none"
                stroke="#10B981"
                strokeWidth="3.5"
                strokeDasharray="8 5"
              />

              {/* 4. CÁC ĐIỂM NEO KÈM NHÃN TỌA ĐỘ CỤ THỂ */}
              {sortedPts.map((p, idx) => {
                const labelY = Math.max(8, p.y - 2.8);
                return (
                  <g key={idx} className="pointer-events-none">
                    {/* Vòng tròn điểm neo */}
                    <circle
                      cx={`${p.x}%`}
                      cy={`${p.y}%`}
                      r="6"
                      fill="#FFE066"
                      stroke="#593A47"
                      strokeWidth="2.5"
                    />
                    <circle cx={`${p.x}%`} cy={`${p.y}%`} r="2.5" fill="#593A47" />

                    {/* Khung nhãn tọa độ */}
                    <rect
                      x={`calc(${p.x}% - 34px)`}
                      y={`calc(${labelY}% - 11px)`}
                      width="68"
                      height="18"
                      rx="9"
                      fill="#593A47"
                      stroke="#FFE066"
                      strokeWidth="1.5"
                    />
                    <text
                      x={`${p.x}%`}
                      y={`calc(${labelY}% + 2px)`}
                      textAnchor="middle"
                      fill="#FFE066"
                      fontSize="10"
                      fontWeight="900"
                      fontFamily="sans-serif"
                    >
                      {p.x.toFixed(0)}%, {p.y.toFixed(0)}%
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* CÁC HỘP VA CHẠM VẬT LÝ CỦA CÁC NGÔI NHÀ (SOLID OBSTACLES) */}
          {showObstacles &&
            obstacles.map((obs) => (
              <div
                key={obs.id}
                style={{
                  left: `${obs.xMin}%`,
                  top: `${obs.yMin}%`,
                  width: `${obs.xMax - obs.xMin}%`,
                  height: `${obs.yMax - obs.yMin}%`,
                  backgroundColor: obs.bg || 'rgba(239, 68, 68, 0.35)',
                  border: `2px dashed ${obs.color || '#EF4444'}`
                }}
                className="absolute flex items-center justify-center pointer-events-none rounded-lg"
              >
                <span className="px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-black text-white whitespace-nowrap">
                  {obs.name}
                </span>
              </div>
            ))}

          {/* CÁC VÙNG KÍCH HOẠT HỘI THOẠI CỦA NPC (TRIGGER ZONES - ĐÃ THU NHỎ 70%) */}
          {showTriggers &&
            landmarks.map((lm) => (
              <div
                key={lm.id}
                style={{
                  left: `${lm.x}%`,
                  top: `${lm.y}%`,
                  width: `${lm.radius * 2}%`,
                  height: `${lm.radius * 2 * 0.8}%`,
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '50%',
                  border: '2px solid rgba(147, 51, 234, 0.85)',
                  backgroundColor: 'rgba(147, 51, 234, 0.16)'
                }}
                className="absolute flex items-center justify-center pointer-events-none"
              >
                <span className="px-1.5 py-0.5 rounded-full bg-[#593A47] text-[9px] font-extrabold text-[#FFE066] whitespace-nowrap shadow-md">
                  {lm.name}
                </span>
              </div>
            ))}
        </div>
      )}
    </>
  );
}
