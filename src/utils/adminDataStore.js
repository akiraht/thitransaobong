import { SafeStorage } from './storage';

/**
 * KHO LƯU TRỮ LOCAL CHO TRANG ADMIN (CHẠY 100% OFFLINE TRƯỚC KHI LÊN SUPABASE)
 * - Truyện tranh dạng ảnh: lưu vào IndexedDB (dung lượng hàng trăm MB, không bị giới hạn 5MB như localStorage).
 * - Ảnh upload được tự động nén sang WebP (maxWidth 1200px, quality 0.82) ngay trên trình duyệt.
 * - Nhiệm vụ tùy chỉnh (Custom Daily Quests): lưu vào SafeStorage (nhẹ, chỉ JSON text).
 */

const IDB_NAME = 'TTSB_ADMIN_DB';
const IDB_VERSION = 1;
const COMICS_STORE = 'comics';

export const ADMIN_CUSTOM_QUESTS_KEY = 'TTSB_ADMIN_CUSTOM_QUESTS_V1';

function openAdminDb() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB không khả dụng trên trình duyệt này.'));
      return;
    }
    const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(COMICS_STORE)) {
        db.createObjectStore(COMICS_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Không thể mở IndexedDB.'));
  });
}

/**
 * Nén file ảnh (PNG/JPG/WebP) sang WebP Data URL nhẹ (~120–250KB/trang) ngay trên client.
 */
export function compressImageFileToWebpDataUrl(file, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không đọc được file ảnh.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('File ảnh không hợp lệ.'));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetW = Math.max(1, Math.round(img.width * scale));
        const targetH = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result);
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);
        let dataUrl = canvas.toDataURL('image/webp', quality);
        // Fallback nếu trình duyệt cũ không hỗ trợ encode webp
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export async function getAllAdminComics() {
  try {
    const db = await openAdminDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(COMICS_STORE, 'readonly');
      const store = tx.objectStore(COMICS_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const items = Array.isArray(req.result) ? req.result : [];
        items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function saveAdminComic(comic) {
  const db = await openAdminDb();
  const payload = {
    ...comic,
    id: comic.id || `comic_img_${Date.now()}`,
    isAdminImageComic: true,
    createdAt: comic.createdAt || Date.now(),
  };
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(COMICS_STORE, 'readwrite');
    tx.objectStore(COMICS_STORE).put(payload);
    tx.oncomplete = () => resolve(payload);
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteAdminComic(id) {
  const db = await openAdminDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(COMICS_STORE, 'readwrite');
    tx.objectStore(COMICS_STORE).delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export function loadAdminCustomQuests() {
  try {
    const raw = SafeStorage.getItem(ADMIN_CUSTOM_QUESTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAdminCustomQuests(list) {
  SafeStorage.setItem(ADMIN_CUSTOM_QUESTS_KEY, JSON.stringify(Array.isArray(list) ? list : []));
}

import {
  loadUserAccounts,
  loadBlockedIps,
  loadBlockedDevices,
} from './userAuthService';

export async function exportAdminBackupJson(sheetWishes = []) {
  const comics = await getAllAdminComics();
  const customQuests = loadAdminCustomQuests();
  const users = loadUserAccounts().map(({ passwordHash, salt, ...safeUser }) => safeUser);
  const blockedIps = loadBlockedIps();
  const blockedDevices = loadBlockedDevices();
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      version: 2,
      comics,
      customQuests,
      wishes: sheetWishes,
      users,
      blockedIps,
      blockedDevices,
    },
    null,
    2
  );
}
