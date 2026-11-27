/**
 * QUẢN LÝ KHO ĐỒ TRANG TRÍ & 6 VỊ TRÍ GẮN ĐỒ NGÔI NHÀ CỦA BẠN
 * - Lưu dạng JSON phẳng (ownedIds, equipped) để sẵn sàng đồng bộ thẳng lên cột JSONB của Supabase sau này.
 */

import { DECOR_ITEM_DICT } from '../config/houseDecorConfig';
import { spendStars, getStarBalance } from './miniGameEconomy';

const HOUSE_DECOR_STORAGE_KEY = 'TTSB_HOUSE_DECOR_V1';
export const DECOR_UPDATED_EVENT = 'ttsb-decor-updated';

const DEFAULT_DECOR_STATE = {
  ownedIds: [],
  equipped: {
    roof_deco: null,
    fence_lights: null,
    door_wreath: null,
    garden_left: null,
    garden_right: null,
    pet_companion: null,
  },
};

export function loadHouseDecorState() {
  try {
    const raw = localStorage.getItem(HOUSE_DECOR_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ownedIds: Array.isArray(parsed.ownedIds) ? parsed.ownedIds : [],
        equipped: {
          ...DEFAULT_DECOR_STATE.equipped,
          ...(parsed.equipped && typeof parsed.equipped === 'object' ? parsed.equipped : {}),
        },
      };
    }
  } catch {
    // ignore
  }
  return {
    ownedIds: [],
    equipped: { ...DEFAULT_DECOR_STATE.equipped },
  };
}

function saveHouseDecorState(next) {
  try {
    localStorage.setItem(HOUSE_DECOR_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(DECOR_UPDATED_EVENT));
  }
  return next;
}

export function buyHouseDecorItem(itemId) {
  const item = DECOR_ITEM_DICT[itemId];
  if (!item) return { ok: false, message: 'Vật phẩm không tồn tại.' };

  const cur = loadHouseDecorState();
  if (cur.ownedIds.includes(itemId)) {
    return { ok: true, already: true, state: cur, balance: getStarBalance() };
  }

  const pay = spendStars(item.price);
  if (!pay.ok) {
    return {
      ok: false,
      message: `Cần ${item.price} ⭐ Sao để mua "${item.name}" (bạn đang có ${pay.balance} ⭐).`,
      state: cur,
      balance: pay.balance,
    };
  }

  // Mua xong tự động gắn luôn vào vị trí tương ứng để người chơi thấy ngay hiệu quả!
  const next = saveHouseDecorState({
    ownedIds: [...cur.ownedIds, itemId],
    equipped: {
      ...cur.equipped,
      [item.slotId]: itemId,
    },
  });

  return { ok: true, item, state: next, balance: pay.balance };
}

export function equipHouseDecorItem(slotId, itemId) {
  const cur = loadHouseDecorState();
  if (itemId && !cur.ownedIds.includes(itemId)) {
    return { ok: false, state: cur };
  }
  const next = saveHouseDecorState({
    ...cur,
    equipped: {
      ...cur.equipped,
      [slotId]: itemId || null,
    },
  });
  return { ok: true, state: next };
}
