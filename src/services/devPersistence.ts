const DEV_SYNC_META_KEY = 'hocmonngon_dev_last_sync_v1';
const STORAGE_PREFIX = 'hocmonngon_';

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function collectLocalState(): Record<string, string> {
  const snapshot: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX) && key !== DEV_SYNC_META_KEY) {
        const val = localStorage.getItem(key);
        if (val !== null) {
          snapshot[key] = val;
        }
      }
    }
  } catch (err) {
    console.warn('DevPersistence collectLocalState failed:', err);
  }
  return snapshot;
}

export const DevPersistence = {
  scheduleSave(): void {
    if (!import.meta.env.DEV || typeof window === 'undefined') return;
    const updatedAt = Date.now();
    try {
      localStorage.setItem(DEV_SYNC_META_KEY, String(updatedAt));
    } catch {
      // Ignore quota errors on meta timestamp
    }
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveTimer = null;
      const state = collectLocalState();
      if (Object.keys(state).length === 0) return;
      fetch('/api/dev-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedAt, state })
      }).catch(() => {
        // Silent fallback if dev endpoint unavailable
      });
    }, 150);
  },

  saveImmediate(): void {
    if (!import.meta.env.DEV || typeof window === 'undefined') return;
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    const state = collectLocalState();
    const updatedAt = Date.now();
    try {
      localStorage.setItem(DEV_SYNC_META_KEY, String(updatedAt));
    } catch {
      // Ignore
    }
    fetch('/api/dev-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updatedAt, state })
    }).catch(() => {});
  },

  async restoreIfNeeded(): Promise<boolean> {
    if (!import.meta.env.DEV || typeof window === 'undefined') return false;
    try {
      const res = await fetch('/api/dev-state');
      if (!res.ok) return false;
      const data = await res.json();
      if (!data?.exists || !data?.state || typeof data.state !== 'object') {
        return false;
      }

      const remoteState = data.state as Record<string, string>;
      const remoteKeys = Object.keys(remoteState);
      if (remoteKeys.length === 0) return false;

      const localSyncTs = Number(localStorage.getItem(DEV_SYNC_META_KEY) || '0');
      const diskSyncTs = Number(data.updatedAt || '0');
      const hasCoreLocal =
        Boolean(localStorage.getItem('hocmonngon_homepage_config_v1')) ||
        Boolean(localStorage.getItem('hocmonngon_instructors_v1')) ||
        Boolean(localStorage.getItem('hocmonngon_courses_v1')) ||
        Boolean(localStorage.getItem('hocmonngon_firebase_config_v1'));

      // Restore if localStorage was wiped on Studio restart OR if disk snapshot is newer
      if (!hasCoreLocal || (diskSyncTs > 0 && diskSyncTs > localSyncTs)) {
        for (const [key, value] of Object.entries(remoteState)) {
          if (key.startsWith(STORAGE_PREFIX) && typeof value === 'string') {
            localStorage.setItem(key, value);
          }
        }
        if (diskSyncTs > 0) {
          localStorage.setItem(DEV_SYNC_META_KEY, String(diskSyncTs));
        }
        window.dispatchEvent(new Event('storage_data_updated'));
        window.dispatchEvent(new Event('homepage_config_updated'));
        window.dispatchEvent(new Event('payment_config_updated'));
        window.dispatchEvent(new Event('firebase_config_updated'));
        return true;
      }
    } catch {
      // Ignore in case endpoint isn't active
    }
    return false;
  },

  clear(): void {
    if (!import.meta.env.DEV || typeof window === 'undefined') return;
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    try {
      localStorage.removeItem(DEV_SYNC_META_KEY);
    } catch {
      // ignore
    }
    fetch('/api/dev-state', { method: 'DELETE' }).catch(() => {});
  }
};
