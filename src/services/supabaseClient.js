/**
 * Lightweight Supabase REST Client (không cần thêm bundle SDK nặng).
 * Tự động kích hoạt khi có VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY trong .env;
 * khi chưa cấu hình sẽ trả về null để app chạy offline/local mượt mà 100%.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY
);

async function supabaseFetch(path, options = {}) {
  if (!isSupabaseConfigured) return null;
  const res = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function fetchApprovedComicsFromCloud() {
  try {
    const rows = await supabaseFetch('comics?status=eq.approved&order=publish_date.desc&limit=30');
    if (!Array.isArray(rows)) return null;
    return rows.map((r) => ({
      id: r.id,
      publishDate: r.publish_date,
      title: r.title,
      author: r.author,
      moral: r.moral,
      pages: Array.isArray(r.pages_json) ? r.pages_json : [],
    }));
  } catch {
    return null;
  }
}

export async function submitComicDraftToCloud(comicDraft) {
  try {
    return await supabaseFetch('comics', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        id: comicDraft.id,
        status: 'pending',
        title: comicDraft.title,
        author: comicDraft.author,
        moral: comicDraft.moral,
        pages_json: comicDraft.pages,
      }),
    });
  } catch {
    return null;
  }
}
